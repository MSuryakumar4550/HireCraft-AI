package com.hirecraft.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class InterviewSummaryResponse {
    private final Long sessionId;
    private final Long candidateId;
    private final String candidateName;
    private final String interviewType;
    private final String subject;
    private final String status;
    private final BigDecimal overallScore;
    private final String summaryFeedback;
    private final List<String> overallStrengths;
    private final List<String> areasForImprovement;
    private final List<QuestionEvaluationSummary> questionEvaluations;
    private final Instant createdAt;

    @Getter
    @Builder
    public static class QuestionEvaluationSummary {
        private final Long answerId;
        private final Integer questionNo;
        private final String questionId;
        private final String questionText;
        private final String topic;
        private final String difficultyLevel;
        private final String transcript;
        private final BigDecimal score;
        private final String feedback;
    }
}
