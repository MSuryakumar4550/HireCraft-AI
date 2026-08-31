package com.hirecraft.backend.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ParsedJdDto {
    private String jobTitle;
    private List<String> requiredSkills;
    private String experienceRequired;
    private String companyOverview;
    private String responsibilities;
    private String qualifications;
    private String benefits;
}
