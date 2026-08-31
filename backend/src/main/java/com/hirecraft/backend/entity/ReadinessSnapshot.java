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

@Entity
@Table(name = "readiness_snapshots")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadinessSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "readiness_snapshot_id", nullable = false, updatable = false)
    private Long readinessSnapshotId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "resume_readiness", precision = 5, scale = 2)
    private BigDecimal resumeReadiness;

    @Column(name = "coding_readiness", precision = 5, scale = 2)
    private BigDecimal codingReadiness;

    @Column(name = "company_coding_readiness", precision = 5, scale = 2)
    private BigDecimal companyCodingReadiness;

    @Column(name = "aptitude_readiness", precision = 5, scale = 2)
    private BigDecimal aptitudeReadiness;

    @Column(name = "technical_readiness", precision = 5, scale = 2)
    private BigDecimal technicalReadiness;

    @Column(name = "communication_readiness", precision = 5, scale = 2)
    private BigDecimal communicationReadiness;

    @Column(name = "behavioral_readiness", precision = 5, scale = 2)
    private BigDecimal behavioralReadiness;

    @Column(name = "overall_placement_readiness", precision = 5, scale = 2)
    private BigDecimal overallPlacementReadiness;

    @Column(name = "calculation_version", length = 50)
    private String calculationVersion;

    @CreationTimestamp
    @Column(name = "snapshot_at", nullable = false, updatable = false)
    private Instant snapshotAt;
}
