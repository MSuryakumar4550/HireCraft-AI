package com.hirecraft.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;


@Getter
@Builder
public class SubmissionResponse {

    private final Long submissionId;
    private final Integer questionNo;
    private final String language;
    private final Integer submissionNumber;
    private final String status;
    private final String judge0Token;
    private final Integer judge0StatusId;
    private final String stdout;
    private final String stderr;
    private final String compileOutput;
    private final Integer executionTimeMs;
    private final Integer memoryKb;
    private final Integer exitCode;
    private final Integer testcasesPassed;
    private final Integer testcasesTotal;
    private final Instant createdAt;
}
