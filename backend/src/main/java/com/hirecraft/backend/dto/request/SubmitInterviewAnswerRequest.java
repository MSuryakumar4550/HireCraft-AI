package com.hirecraft.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitInterviewAnswerRequest {

    @NotNull(message = "Question number is required")
    @Min(value = 1)
    private Integer questionNo;

    @NotNull(message = "Question ID is required")
    private String questionId;

    private String answerText;
    private String transcript;
    private Double responseDurationSeconds;
    private Double responseLatencySeconds;
}
