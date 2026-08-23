package com.hirecraft.backend.dto.request;

import com.hirecraft.backend.enums.InterviewType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateInterviewSessionRequest {

    @NotNull(message = "Interview type is required")
    private InterviewType interviewType;
}
