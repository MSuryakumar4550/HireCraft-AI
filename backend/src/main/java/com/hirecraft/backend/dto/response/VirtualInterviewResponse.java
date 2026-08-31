package com.hirecraft.backend.dto.response;

import com.hirecraft.backend.enums.VirtualInterviewStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;


@Getter
@Builder
public class VirtualInterviewResponse {

    private final Long virtualInterviewId;
    private final VirtualInterviewStatus status;
    private final String currentStage;
    private final BigDecimal finalScore;
    private final Instant createdAt;
}
