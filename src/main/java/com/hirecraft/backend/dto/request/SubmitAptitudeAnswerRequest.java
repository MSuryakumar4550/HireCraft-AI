package com.hirecraft.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitAptitudeAnswerRequest {

    @NotNull(message = "Question number is required")
    @Min(value = 1)
    private Integer questionNo;

    @NotNull(message = "Selected option is required")
    @Size(max = 10)
    private String selectedOption;

    private Integer timeTakenSeconds;
}
