package com.hirecraft.backend.dto.response;

import com.hirecraft.backend.enums.AssessmentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.math.BigDecimal;


@Getter
@Builder
public class AptitudeAssessmentResponse {

    private final Long aptitudeAssessmentId;
    private final AssessmentStatus status;
    private final Integer totalQuestions;
    private final BigDecimal score;
    private final BigDecimal accuracy;
    private final Instant createdAt;
}
