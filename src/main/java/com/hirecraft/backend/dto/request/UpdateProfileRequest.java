package com.hirecraft.backend.dto.request;

import com.hirecraft.backend.enums.ExperienceLevel;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateProfileRequest {

    @Size(max = 255)
    private String collegeName;

    @Size(max = 100)
    private String degree;

    @Size(max = 100)
    private String department;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "10.0")
    private BigDecimal cgpa;

    @Min(2000)
    @Max(2100)
    private Integer graduationYear;

    private ExperienceLevel experienceLevel;

    @Size(max = 255)
    private String targetRole;

    private String careerInterests;
    private String strengths;
    private String weaknesses;
}
