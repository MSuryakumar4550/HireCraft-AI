package com.hirecraft.backend.dto.response;

import com.hirecraft.backend.enums.AssessmentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class AptitudeAssessmentResponse {

    private final UUID aptitudeAssessmentId;
    private final AssessmentStatus status;
    private final Integer totalQuestions;
    private final Integer score;
    private final BigDecimal accuracy;
    private final Instant createdAt;
}
