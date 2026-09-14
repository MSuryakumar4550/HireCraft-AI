package com.hirecraft.backend.dto.response;

import com.hirecraft.backend.enums.AssessmentMode;
import com.hirecraft.backend.enums.AssessmentStatus;
import com.hirecraft.backend.enums.DifficultyLevel;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CodingAssessmentResponse {
    private final UUID codingAssessmentId;
    private final AssessmentMode assessmentMode;
    private final DifficultyLevel difficultyLevel;
    private final AssessmentStatus status;
    private final Integer totalQuestions;
    private final BigDecimal score;
    private final BigDecimal accuracy;
    private final Integer timeLimitMinutes;
    private final Integer totalTimeLimitMinutes;
    private final List<CodingQuestionResponse> questions;
    private final List<CodingQuestion> engineQuestions;
    private final Instant createdAt;
}
