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
@Table(name = "interview_answers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_answer_id", nullable = false, updatable = false)
    private Long interviewAnswerId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interview_session_id", nullable = false)
    private InterviewSession interviewSession;

    @Column(name = "question_no", nullable = false)
    private Integer questionNo;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "transcript", columnDefinition = "TEXT")
    private String transcript;

    @Column(name = "response_duration_seconds", precision = 8, scale = 2)
    private BigDecimal responseDurationSeconds;

    @Column(name = "response_latency_seconds", precision = 8, scale = 2)
    private BigDecimal responseLatencySeconds;

    @CreationTimestamp
    @Column(name = "answered_at", nullable = false, updatable = false)
    private Instant answeredAt;
}
