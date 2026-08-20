package com.hirecraft.backend.entity;

import com.hirecraft.backend.enums.StageStatus;
import com.hirecraft.backend.enums.StageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "virtual_interview_stages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VirtualInterviewStage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "stage_id", nullable = false, updatable = false)
    private UUID stageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "virtual_interview_id", nullable = false)
    private VirtualInterview virtualInterview;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage_type", nullable = false, length = 20)
    private StageType stageType;

    @Column(name = "stage_order", nullable = false)
    private Integer stageOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StageStatus status;

    // Optional FK references to the actual assessment entities for this stage
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
    @JoinColumn(name = "evaluation_id")
    private Evaluation evaluation;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
