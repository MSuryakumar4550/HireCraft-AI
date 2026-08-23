package com.hirecraft.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class ReadinessResponse {

    private final UUID readinessSnapshotId;
    private final BigDecimal resumeReadiness;
    private final BigDecimal codingReadiness;
    private final BigDecimal companyCodingReadiness;
    private final BigDecimal aptitudeReadiness;
    private final BigDecimal technicalReadiness;
    private final BigDecimal communicationReadiness;
    private final BigDecimal behavioralReadiness;
    private final BigDecimal overallPlacementReadiness;
    private final String calculationVersion;
    private final Instant createdAt;
}
