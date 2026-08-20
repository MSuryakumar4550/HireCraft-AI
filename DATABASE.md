# Data Base - HireCraft AI

### HireCraft AI – Final Database Entity Design

### 1. `users`

### Purpose

Central entity storing user authentication, academic profile, career information, and the current resume metadata.

Used by:

- Login & Registration
- Dashboard
- Resume Analysis
- Coding Assessments
- Aptitude Tests
- Interview Sessions
- AI Memory
- Readiness Calculation
- Reports

### Attributes

| Attribute                  | Key    | Purpose                    |
| -------------------------- | ------ | -------------------------- |
| `user_id`                  | PK     | Unique user identifier     |
| `email`                    | UNIQUE | Login email                |
| `password_hash`            | —      | Secure hashed password     |
| `account_status`           | —      | ACTIVE, PENDING, SUSPENDED |
| `full_name`                | —      | Candidate name             |
| `college_name`             | —      | College                    |
| `degree`                   | —      | Degree                     |
| `department`               | —      | Department                 |
| `cgpa`                     | —      | Academic score             |
| `graduation_year`          | —      | Graduation year            |
| `experience_level`         | —      | Fresher / Experienced      |
| `target_role`              | —      | Desired job role           |
| `career_interests`         | —      | Career interests           |
| `strengths`                | —      | Strengths                  |
| `weaknesses`               | —      | Weaknesses                 |
| `resume_filename`          | —      | Resume file name           |
| `resume_storage_provider`  | —      | Cloud storage provider     |
| `resume_storage_bucket`    | —      | Bucket name                |
| `resume_object_key`        | —      | Resume object path         |
| `resume_mime_type`         | —      | File type                  |
| `resume_file_size`         | —      | File size                  |
| `resume_processing_status` | —      | ATS processing status      |
| `resume_ats_score`         | —      | ATS score                  |
| `resume_analysis`          | —      | AI resume analysis         |

### Important

We intentionally do not create a `resumes` entity.

The flow is:

Resume PDF

↓

Cloud Object Storage

↓

resume_object_key

↓

users

### 2. `virtual_interviews`

### Purpose

Represents one complete placement simulation containing multiple interview stages.

Used by:

- Virtual Interview
- Dashboard
- Final Evaluation
- Reports

### Attributes

| Attribute              | Key | Purpose                      |
| ---------------------- | --- | ---------------------------- |
| `virtual_interview_id` | PK  | Virtual interview identifier |
| `user_id`              | FK  | Candidate                    |
| `status`               | —   | Overall interview status     |
| `current_stage`        | —   | Current interview stage      |
| `final_score`          | —   | Overall placement score      |

### 3. `virtual_interview_stages`

### Purpose

Maps each stage inside a virtual interview without duplicating assessment data.

Used by:

- Stage Progress
- Stage Navigation
- Final Evaluation

### Attributes

| Attribute                | Key | Purpose                              |
| ------------------------ | --- | ------------------------------------ |
| `stage_id`               | PK  | Stage identifier                     |
| `virtual_interview_id`   | FK  | Parent interview                     |
| `stage_type`             | —   | APTITUDE, DSA, TECHNICAL, BEHAVIORAL |
| `stage_order`            | —   | Stage sequence                       |
| `status`                 | —   | Stage status                         |
| `coding_assessment_id`   | FK  | DSA stage                            |
| `aptitude_assessment_id` | FK  | Aptitude stage                       |
| `interview_session_id`   | FK  | Technical/Behavioral stage           |
| `evaluation_id`          | FK  | Final evaluation                     |

### Why this entity?

Instead of storing stage information repeatedly inside every assessment, this table keeps the Virtual Interview as the owner of the entire workflow.

### 4. `coding_assessments`

### Purpose

Stores every coding assessment taken by a candidate.

Questions are loaded from JSON files; only the assessment result is stored.

Used by:

- DSA Practice
- Company-wise Practice
- Virtual Interview
- Dashboard
- Readiness

### Attributes

| Attribute              | Key | Purpose                                     |
| ---------------------- | --- | ------------------------------------------- |
| `coding_assessment_id` | PK  | Assessment identifier                       |
| `user_id`              | FK  | Candidate                                   |
| `assessment_mode`      | —   | TOPIC_WISE, COMPANY_WISE, VIRTUAL_INTERVIEW |
| `difficulty_level`     | —   | EASY, MEDIUM, HARD                          |
| `question_source`      | —   | JSON dataset reference                      |
| `status`               | —   | Assessment status                           |
| `total_questions`      | —   | Assigned questions                          |
| `score`                | —   | Final score                                 |
| `accuracy`             | —   | Accuracy percentage                         |

### Important

No coding questions are stored in PostgreSQL.

### 5. `coding_submissions`

### Purpose

Stores every source-code submission made during a coding assessment.

Judge0 execution results are stored directly inside this entity.

Used by:

- Submission History
- Performance Review
- Execution Analysis

### Attributes

| Attribute              | Key    | Purpose               |
| ---------------------- | ------ | --------------------- |
| `submission_id`        | PK     | Submission identifier |
| `coding_assessment_id` | FK     | Parent assessment     |
| `question_no`          | —      | Question index        |
| `language`             | —      | Programming language  |
| `source_code`          | —      | Submitted code        |
| `submission_number`    | —      | Attempt number        |
| `status`               | —      | Submission result     |
| `judge0_token`         | UNIQUE | Judge0 reference      |
| `judge0_status_id`     | —      | Judge0 status         |
| `stdout`               | —      | Output                |
| `stderr`               | —      | Error output          |
| `compile_output`       | —      | Compiler logs         |
| `execution_time_ms`    | —      | Execution time        |
| `memory_kb`            | —      | Memory used           |
| `exit_code`            | —      | Exit status           |
| `testcases_passed`     | —      | Passed test cases     |
| `testcases_total`      | —      | Total test cases      |

### Why this entity?

A single submission naturally owns one execution result, so a separate execution table is unnecessary.

---

### 6. `aptitude_assessments`

### Purpose

Stores every aptitude assessment taken by a candidate.

Used by:

- Aptitude Practice
- Virtual Interview
- Dashboard
- Readiness

### Attributes

| Attribute                | Key | Purpose               |
| ------------------------ | --- | --------------------- |
| `aptitude_assessment_id` | PK  | Assessment identifier |
| `user_id`                | FK  | Candidate             |
| `status`                 | —   | Assessment status     |
| `total_questions`        | —   | Number of questions   |
| `score`                  | —   | Final score           |
| `accuracy`               | —   | Accuracy percentage   |

### 7. `aptitude_answers`

### Purpose

Stores the user's selected answer for every aptitude question.

Questions remain in JSON files.

Used by:

- Performance Analysis
- Weak Topic Detection

### Attributes

| Attribute                | Key | Purpose           |
| ------------------------ | --- | ----------------- |
| `aptitude_answer_id`     | PK  | Answer identifier |
| `aptitude_assessment_id` | FK  | Parent assessment |
| `question_no`            | —   | Question number   |
| `selected_option`        | —   | Selected option   |
| `is_correct`             | —   | Correctness       |
| `time_taken_seconds`     | —   | Time spent        |

### Important

`question_no` directly maps to the JSON question dataset.

### 8. `interview_sessions`

### Purpose

Represents both Technical and Behavioral interview sessions.

Supports both text-based and voice-based interviews.

Used by:

- Interview History
- Dashboard
- AI Evaluation

### Attributes

| Attribute              | Key    | Purpose                 |
| ---------------------- | ------ | ----------------------- |
| `interview_session_id` | PK     | Session identifier      |
| `user_id`              | FK     | Candidate               |
| `interview_type`       | —      | TECHNICAL or BEHAVIORAL |
| `status`               | —      | Session status          |
| `livekit_room_id`      | UNIQUE | LiveKit room            |
| `session_identifier`   | UNIQUE | Session routing ID      |
| `transcript_available` | —      | Transcript availability |
| `total_questions`      | —      | Questions asked         |
| `total_score`          | —      | Session score           |

### Important

A separate `voice_interview_sessions` table is unnecessary because voice metadata belongs directly to the interview session.

### 9. `interview_answers`

### Purpose

Stores every answer given during Technical or Behavioral interviews.

Supports typed answers and speech transcripts.

Used by:

- AI Evaluation
- Interview Review
- Communication Analysis

### Attributes

| Attribute                   | Key | Purpose           |
| --------------------------- | --- | ----------------- |
| `interview_answer_id`       | PK  | Answer identifier |
| `interview_session_id`      | FK  | Parent session    |
| `question_no`               | —   | Question order    |
| `answer_text`               | —   | Typed answer      |
| `transcript`                | —   | Speech transcript |
| `response_duration_seconds` | —   | Speaking duration |
| `response_latency_seconds`  | —   | Response delay    |

### 10. `evaluations`

### Purpose

Unified AI evaluation table for all modules.

Instead of creating separate evaluation tables, this entity stores every evaluation result.

Used by:

- Dashboard
- Reports
- Readiness
- AI Memory

### Attributes

| Attribute                | Key | Purpose                                                        |
| ------------------------ | --- | -------------------------------------------------------------- |
| `evaluation_id`          | PK  | Evaluation identifier                                          |
| `user_id`                | FK  | Candidate                                                      |
| `coding_assessment_id`   | FK  | Coding source                                                  |
| `aptitude_assessment_id` | FK  | Aptitude source                                                |
| `interview_session_id`   | FK  | Interview source                                               |
| `virtual_interview_id`   | FK  | Virtual Interview source                                       |
| `evaluation_type`        | —   | RESUME, CODING, APTITUDE, TECHNICAL, BEHAVIORAL, VIRTUAL_DRIVE |
| `score`                  | —   | Score                                                          |
| `percentage`             | —   | Percentage                                                     |
| `strengths`              | —   | AI strengths                                                   |
| `weaknesses`             | —   | AI weaknesses                                                  |
| `feedback`               | —   | Feedback                                                       |
| `recommendations`        | —   | Recommendations                                                |

### Important

Only one source foreign key should be populated for each evaluation.

Example:

CODING

↓

coding_assessment_id

APTITUDE

↓

aptitude_assessment_id

TECHNICAL

↓

interview_session_id

### 11. `ai_memory_items`

### Purpose

Stores long-term AI memory used for personalization.

Unlike assessment tables, this stores persistent learning insights.

Used by:

- Personalized Questions
- Difficulty Adjustment
- Learning Recommendations

### Attributes

| Attribute          | Key | Purpose                      |
| ------------------ | --- | ---------------------------- |
| `memory_id`        | PK  | Memory identifier            |
| `user_id`          | FK  | Candidate                    |
| `memory_type`      | —   | STRENGTH, WEAKNESS, BEHAVIOR |
| `category`         | —   | DSA, APTITUDE, TECHNICAL     |
| `memory_key`       | —   | Concept                      |
| `memory_value`     | —   | Stored insight               |
| `confidence_score` | —   | AI confidence                |
| `is_active`        | —   | Active flag                  |

### Example

WEAKNESS

Category: DSA

Concept: Dynamic Programming

STRENGTH

Category: SQL

Concept: Joins

### 12. `readiness_snapshots`

### Purpose

Stores historical placement-readiness records.

Each snapshot represents one calculated readiness state.

Used by:

- Dashboard
- Progress Charts
- Weekly Trends

### Attributes

| Attribute                     | Key | Purpose                 |
| ----------------------------- | --- | ----------------------- |
| `readiness_snapshot_id`       | PK  | Snapshot identifier     |
| `user_id`                     | FK  | Candidate               |
| `resume_readiness`            | —   | Resume score            |
| `coding_readiness`            | —   | Coding readiness        |
| `company_coding_readiness`    | —   | Company readiness       |
| `aptitude_readiness`          | —   | Aptitude readiness      |
| `technical_readiness`         | —   | Technical readiness     |
| `communication_readiness`     | —   | Communication readiness |
| `behavioral_readiness`        | —   | Behavioral readiness    |
| `overall_placement_readiness` | —   | Overall readiness       |
| `calculation_version`         | —   | Formula version         |

### Important

Snapshots are historical records and should never overwrite previous results.

### 13. `reports`

### Purpose

Stores downloadable reports generated by the system.

Used by:

- Dashboard
- Download Center
- Interview Review

### Attributes

| Attribute                | Key | Purpose           |
| ------------------------ | --- | ----------------- |
| `report_id`              | PK  | Report identifier |
| `user_id`                | FK  | Candidate         |
| `coding_assessment_id`   | FK  | Coding report     |
| `aptitude_assessment_id` | FK  | Aptitude report   |
| `interview_session_id`   | FK  | Interview report  |
| `virtual_interview_id`   | FK  | Virtual report    |
| `report_type`            | —   | Report category   |
| `overall_score`          | —   | Summary score     |
| `generated_content`      | —   | Generated report  |

### Final Entity Relationships

| Relationship                                        | Cardinality |
| --------------------------------------------------- | ----------- |
| `users` → `virtual_interviews`                      | 1 : M       |
| `virtual_interviews` → `virtual_interview_stages`   | 1 : M       |
| `users` → `coding_assessments`                      | 1 : M       |
| `coding_assessments` → `coding_submissions`         | 1 : M       |
| `users` → `aptitude_assessments`                    | 1 : M       |
| `aptitude_assessments` → `aptitude_answers`         | 1 : M       |
| `users` → `interview_sessions`                      | 1 : M       |
| `interview_sessions` → `interview_answers`          | 1 : M       |
| `users` → `evaluations`                             | 1 : M       |
| `users` → `ai_memory_items`                         | 1 : M       |
| `users` → `readiness_snapshots`                     | 1 : M       |
| `users` → `reports`                                 | 1 : M       |
| `virtual_interview_stages` → `coding_assessments`   | M : 1       |
| `virtual_interview_stages` → `aptitude_assessments` | M : 1       |
| `virtual_interview_stages` → `interview_sessions`   | M : 1       |
| `virtual_interview_stages` → `evaluations`          | M : 1       |

### Final Question Storage Plan

Questions are not database entities.

Instead, Spring Boot loads them from JSON files.

### Question Bank Structure

questions/

│

├── dsa_questions.json

├── company_questions.json

├── aptitude_questions.json

└── technical_questions.json

Each JSON file contains:

- Question
- Difficulty
- Topics
- Companies (for company-wise DSA)
- Constraints
- Examples
- Starter Code
- Correct Answer (where applicable)

### Runtime Flow

JSON Question Files

↓

Spring Boot loads questions

↓

User takes assessment/interview

↓

PostgreSQL stores only:

- assessment records
- answers
- code submissions
- Judge0 execution results
- interview history
- evaluations
- AI memory
- readiness snapshots
- reports

This structure is clean for Spring Boot + Spring Data JPA + Hibernate because every database entity represents persistent business data, while the question bank remains easy to maintain as external JSON files.
