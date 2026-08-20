package com.hirecraft.backend.entity;

import com.hirecraft.backend.enums.VirtualInterviewStatus;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "virtual_interviews")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VirtualInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "virtual_interview_id", nullable = false, updatable = false)
    private UUID virtualInterviewId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VirtualInterviewStatus status;

    @Column(name = "current_stage", length = 20)
    private String currentStage;

    @Column(name = "final_score", precision = 5, scale = 2)
    private BigDecimal finalScore;

    @Builder.Default
    @OneToMany(mappedBy = "virtualInterview", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<VirtualInterviewStage> stages = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
