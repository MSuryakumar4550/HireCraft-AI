package com.hirecraft.backend.dto.response;

import com.hirecraft.backend.enums.AccountStatus;
import com.hirecraft.backend.enums.ExperienceLevel;
import com.hirecraft.backend.enums.ResumeProcessingStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class UserProfileResponse {

    private final UUID userId;
    private final String email;
    private final String fullName;
    private final AccountStatus accountStatus;
    private final String collegeName;
    private final String degree;
    private final String department;
    private final BigDecimal cgpa;
    private final Integer graduationYear;
    private final ExperienceLevel experienceLevel;
    private final String targetRole;
    private final String careerInterests;
    private final String strengths;
    private final String weaknesses;
    private final String resumeFilename;
    private final ResumeProcessingStatus resumeProcessingStatus;
    private final Integer resumeAtsScore;
    private final Instant createdAt;
}
