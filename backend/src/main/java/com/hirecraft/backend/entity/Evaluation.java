package com.hirecraft.backend.entity;

import com.hirecraft.backend.enums.EvaluationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "evaluation_id", nullable = false, updatable = false)
    private UUID evaluationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Only ONE of these source FKs should be non-null per evaluation per DATABASE.md
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_assessment_id")
    private CodingAssessment codingAssessment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aptitude_assessment_id")
    private AptitudeAssessment aptitudeAssessment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_session_id")
    private InterviewSession interviewSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "virtual_interview_id")
    private VirtualInterview virtualInterview;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_type", nullable = false, length = 30)
    private EvaluationType evaluationType;

    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
