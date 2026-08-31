package com.hirecraft.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AtsScoreDto {
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> partialMatches;
    private List<String> semanticMatches;
    
    private String experienceMatch;
    private String educationMatch;
    private String jobTitleMatch;
    
    // Scoring Breakdown
    private double finalScore;
    private double skillScore;
    private double experienceScore;
    private double keywordScore;
    private double educationScore;
    private double semanticScore;
    private double structureScore;
    
    // Explanations
    private List<String> scoringExplanations;
    
    // Recommendations
    private List<String> resumeProblems;
    private List<String> suggestions;
}
