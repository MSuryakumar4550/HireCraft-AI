-- ============================================================
-- HireCraft AI - V1 Initial Schema
-- Strictly per DATABASE.md design
-- All PKs: UUID, All enums: VARCHAR
-- ============================================================

-- 1. users
CREATE TABLE users (
    user_id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                    VARCHAR(255) NOT NULL UNIQUE,
    password_hash            VARCHAR(255) NOT NULL,
    account_status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    full_name                VARCHAR(255),
    college_name             VARCHAR(255),
    degree                   VARCHAR(100),
    department               VARCHAR(100),
    cgpa                     NUMERIC(4, 2),
    graduation_year          INT,
    experience_level         VARCHAR(20),
    target_role              VARCHAR(255),
    career_interests         TEXT,
    strengths                TEXT,
    weaknesses               TEXT,
    resume_filename          VARCHAR(500),
    resume_storage_provider  VARCHAR(50),
    resume_storage_bucket    VARCHAR(255),
    resume_object_key        VARCHAR(1000),
    resume_mime_type         VARCHAR(100),
    resume_file_size         BIGINT,
    resume_processing_status VARCHAR(20),
    resume_ats_score         INT,
    resume_analysis          TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. virtual_interviews
CREATE TABLE virtual_interviews (
    virtual_interview_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status               VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    current_stage        VARCHAR(20),
    final_score          NUMERIC(5, 2),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. coding_assessments
CREATE TABLE coding_assessments (
    coding_assessment_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assessment_mode      VARCHAR(30) NOT NULL,
    difficulty_level     VARCHAR(10) NOT NULL,
    question_source      VARCHAR(500),
    status               VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    total_questions      INT,
    score                INT,
    accuracy             NUMERIC(5, 2),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. aptitude_assessments
CREATE TABLE aptitude_assessments (
    aptitude_assessment_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status                 VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    total_questions        INT,
    score                  INT,
    accuracy               NUMERIC(5, 2),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. interview_sessions
CREATE TABLE interview_sessions (
    interview_session_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    interview_type       VARCHAR(20) NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    livekit_room_id      VARCHAR(255) UNIQUE,
    session_identifier   VARCHAR(255) UNIQUE,
    transcript_available BOOLEAN     DEFAULT FALSE,
    total_questions      INT,
    total_score          NUMERIC(5, 2),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. evaluations
CREATE TABLE evaluations (
    evaluation_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    coding_assessment_id   UUID        REFERENCES coding_assessments(coding_assessment_id),
    aptitude_assessment_id UUID        REFERENCES aptitude_assessments(aptitude_assessment_id),
    interview_session_id   UUID        REFERENCES interview_sessions(interview_session_id),
    virtual_interview_id   UUID,  -- FK added after virtual_interviews table is ready below
    evaluation_type        VARCHAR(30) NOT NULL,
    score                  NUMERIC(5, 2),
    percentage             NUMERIC(5, 2),
    strengths              TEXT,
    weaknesses             TEXT,
    feedback               TEXT,
    recommendations        TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. virtual_interview_stages
CREATE TABLE virtual_interview_stages (
    stage_id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    virtual_interview_id   UUID        NOT NULL REFERENCES virtual_interviews(virtual_interview_id) ON DELETE CASCADE,
    stage_type             VARCHAR(20) NOT NULL,
    stage_order            INT         NOT NULL,
    status                 VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    coding_assessment_id   UUID        REFERENCES coding_assessments(coding_assessment_id),
    aptitude_assessment_id UUID        REFERENCES aptitude_assessments(aptitude_assessment_id),
    interview_session_id   UUID        REFERENCES interview_sessions(interview_session_id),
    evaluation_id          UUID        REFERENCES evaluations(evaluation_id),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. coding_submissions
CREATE TABLE coding_submissions (
    submission_id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    coding_assessment_id   UUID         NOT NULL REFERENCES coding_assessments(coding_assessment_id) ON DELETE CASCADE,
    question_no            INT          NOT NULL,
    language               VARCHAR(50),
    source_code            TEXT,
    submission_number      INT          NOT NULL,
    status                 VARCHAR(50),
    judge0_token           VARCHAR(255) UNIQUE,
    judge0_status_id       INT,
    stdout                 TEXT,
    stderr                 TEXT,
    compile_output         TEXT,
    execution_time_ms      NUMERIC(10, 3),
    memory_kb              INT,
    exit_code              INT,
    testcases_passed       INT,
    testcases_total        INT,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 9. aptitude_answers
CREATE TABLE aptitude_answers (
    aptitude_answer_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    aptitude_assessment_id UUID        NOT NULL REFERENCES aptitude_assessments(aptitude_assessment_id) ON DELETE CASCADE,
    question_no            INT         NOT NULL,
    selected_option        VARCHAR(10),
    is_correct             BOOLEAN,
    time_taken_seconds     INT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. interview_answers
CREATE TABLE interview_answers (
    interview_answer_id     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_session_id    UUID          NOT NULL REFERENCES interview_sessions(interview_session_id) ON DELETE CASCADE,
    question_no             INT           NOT NULL,
    answer_text             TEXT,
    transcript              TEXT,
    response_duration_seconds NUMERIC(8, 2),
    response_latency_seconds  NUMERIC(8, 2),
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 11. ai_memory_items
CREATE TABLE ai_memory_items (
    memory_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    memory_type       VARCHAR(20) NOT NULL,
    category          VARCHAR(30) NOT NULL,
    memory_key        VARCHAR(255) NOT NULL,
    memory_value      TEXT,
    confidence_score  NUMERIC(4, 3),
    is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. readiness_snapshots
CREATE TABLE readiness_snapshots (
    readiness_snapshot_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                   UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    resume_readiness           NUMERIC(5, 2),
    coding_readiness           NUMERIC(5, 2),
    company_coding_readiness   NUMERIC(5, 2),
    aptitude_readiness         NUMERIC(5, 2),
    technical_readiness        NUMERIC(5, 2),
    communication_readiness    NUMERIC(5, 2),
    behavioral_readiness       NUMERIC(5, 2),
    overall_placement_readiness NUMERIC(5, 2),
    calculation_version        VARCHAR(50),
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- No updated_at: snapshots are immutable per DATABASE.md
);

-- 13. reports
CREATE TABLE reports (
    report_id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    coding_assessment_id   UUID        REFERENCES coding_assessments(coding_assessment_id),
    aptitude_assessment_id UUID        REFERENCES aptitude_assessments(aptitude_assessment_id),
    interview_session_id   UUID        REFERENCES interview_sessions(interview_session_id),
    virtual_interview_id   UUID        REFERENCES virtual_interviews(virtual_interview_id),
    report_type            VARCHAR(30) NOT NULL,
    overall_score          NUMERIC(5, 2),
    generated_content      TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add deferred FK: evaluations.virtual_interview_id
ALTER TABLE evaluations
    ADD CONSTRAINT fk_evaluations_virtual_interview
    FOREIGN KEY (virtual_interview_id) REFERENCES virtual_interviews(virtual_interview_id);

-- Useful indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_coding_assessments_user_id ON coding_assessments(user_id);
CREATE INDEX idx_aptitude_assessments_user_id ON aptitude_assessments(user_id);
CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_virtual_interviews_user_id ON virtual_interviews(user_id);
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_ai_memory_items_user_id ON ai_memory_items(user_id);
CREATE INDEX idx_readiness_snapshots_user_id ON readiness_snapshots(user_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
