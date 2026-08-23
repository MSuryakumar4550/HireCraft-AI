package com.hirecraft.backend.entity;

import com.hirecraft.backend.enums.InterviewStatus;
import com.hirecraft.backend.enums.InterviewType;
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
@Table(name = "interview_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "interview_session_id", nullable = false, updatable = false)
    private UUID interviewSessionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false, length = 20)
    private InterviewType interviewType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private InterviewStatus status;

    @Column(name = "livekit_room_id", unique = true, length = 255)
    private String livekitRoomId;

    @Column(name = "session_identifier", unique = true, length = 255)
    private String sessionIdentifier;

    @Column(name = "transcript_available")
    private Boolean transcriptAvailable;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "total_score", precision = 5, scale = 2)
    private BigDecimal totalScore;

    @Builder.Default
    @OneToMany(mappedBy = "interviewSession", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InterviewAnswer> answers = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
