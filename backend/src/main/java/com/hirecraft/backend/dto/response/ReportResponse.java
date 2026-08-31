package com.hirecraft.backend.dto.response;

import com.hirecraft.backend.enums.ReportType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;


@Getter
@Builder
public class ReportResponse {

    private final Long reportId;
    private final ReportType reportType;
    private final BigDecimal overallScore;
    private final String generatedContent;
    private final Instant createdAt;
}
