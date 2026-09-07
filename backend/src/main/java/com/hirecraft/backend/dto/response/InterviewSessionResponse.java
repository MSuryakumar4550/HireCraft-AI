package com.hirecraft.backend.dto.response;

import com.hirecraft.backend.enums.InterviewStatus;
import com.hirecraft.backend.enums.InterviewType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;


@Getter
@Builder
public class InterviewSessionResponse {

    private final Long interviewSessionId;
    private final InterviewType interviewType;
    private final InterviewStatus status;
    private final String sessionIdentifier;
    private final Boolean transcriptAvailable;
    private final Integer totalQuestions;
    private final BigDecimal totalScore;
    private final String currentTopic;
    private final String subject;
    private final java.util.List<String> remainingTopics;
    private final Integer consecutiveWeakAnswers;
    private final Integer currentTopicQuestionCount;
    private final Instant createdAt;
}
