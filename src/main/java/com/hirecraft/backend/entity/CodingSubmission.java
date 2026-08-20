package com.hirecraft.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "coding_submissions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "submission_id", nullable = false, updatable = false)
    private UUID submissionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coding_assessment_id", nullable = false)
    private CodingAssessment codingAssessment;

    @Column(name = "question_no", nullable = false)
    private Integer questionNo;

    @Column(name = "language", length = 50)
    private String language;

    @Column(name = "source_code", columnDefinition = "TEXT")
    private String sourceCode;

    @Column(name = "submission_number", nullable = false)
    private Integer submissionNumber;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "judge0_token", unique = true, length = 255)
    private String judge0Token;

    @Column(name = "judge0_status_id")
    private Integer judge0StatusId;

    @Column(name = "stdout", columnDefinition = "TEXT")
    private String stdout;

    @Column(name = "stderr", columnDefinition = "TEXT")
    private String stderr;

    @Column(name = "compile_output", columnDefinition = "TEXT")
    private String compileOutput;

    @Column(name = "execution_time_ms", precision = 10, scale = 3)
    private BigDecimal executionTimeMs;

    @Column(name = "memory_kb")
    private Integer memoryKb;

    @Column(name = "exit_code")
    private Integer exitCode;

    @Column(name = "testcases_passed")
    private Integer testcasesPassed;

    @Column(name = "testcases_total")
    private Integer testcasesTotal;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
