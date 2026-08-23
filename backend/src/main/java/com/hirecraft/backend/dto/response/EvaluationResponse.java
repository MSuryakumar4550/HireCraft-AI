package com.hirecraft.backend.dto.response;

import com.hirecraft.backend.enums.EvaluationType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class EvaluationResponse {

    private final UUID evaluationId;
    private final EvaluationType evaluationType;
    private final BigDecimal score;
    private final BigDecimal percentage;
    private final String strengths;
    private final String weaknesses;
    private final String feedback;
    private final String recommendations;
    private final Instant createdAt;
}
