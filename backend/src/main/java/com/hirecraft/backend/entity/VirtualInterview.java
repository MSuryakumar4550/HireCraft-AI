package com.hirecraft.backend.entity;

import com.hirecraft.backend.enums.VirtualInterviewStatus;
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
@Table(name = "virtual_interviews")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VirtualInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "virtual_interview_id", nullable = false, updatable = false)
    private Long virtualInterviewId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VirtualInterviewStatus status;

    @Column(name = "current_stage", length = 20)
    private String currentStage;
    
    @Column(name = "started_at")
    private Instant startedAt;
    
    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "final_score", precision = 5, scale = 2)
    private BigDecimal finalScore;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
