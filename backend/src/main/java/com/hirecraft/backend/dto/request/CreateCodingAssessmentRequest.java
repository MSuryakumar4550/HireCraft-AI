package com.hirecraft.backend.dto.request;

import com.hirecraft.backend.enums.AssessmentMode;
import com.hirecraft.backend.enums.DifficultyLevel;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateCodingAssessmentRequest {

    private AssessmentMode assessmentMode = AssessmentMode.TOPIC_WISE;

    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficultyLevel;

    // For TOPIC_WISE mode: list of selected topics
    private List<String> topics;

    // For COMPANY_WISE mode: target company name
    private String companyName;
}
