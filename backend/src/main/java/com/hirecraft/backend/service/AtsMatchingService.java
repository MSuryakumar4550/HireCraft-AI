package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.AtsScoreDto;
import com.hirecraft.backend.dto.response.ParsedJdDto;
import com.hirecraft.backend.dto.response.ParsedResumeDto;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AtsMatchingService {

    private final AtsRecommendationService recommendationService;

    public AtsMatchingService(AtsRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    private static final Map<String, List<String>> SEMANTIC_LINKS = new HashMap<>();
    
    static {
        SEMANTIC_LINKS.put("rest api", Arrays.asList("spring boot", "node.js", "backend", "express"));
        SEMANTIC_LINKS.put("web services", Arrays.asList("rest api", "spring boot", "microservices"));
        SEMANTIC_LINKS.put("machine learning", Arrays.asList("data science", "python", "tensorflow", "pytorch"));
        SEMANTIC_LINKS.put("cloud", Arrays.asList("aws", "gcp", "azure", "docker", "kubernetes"));
        SEMANTIC_LINKS.put("frontend", Arrays.asList("react", "vue", "angular", "javascript", "html", "css"));
        SEMANTIC_LINKS.put("database", Arrays.asList("sql", "mysql", "postgresql", "mongodb"));
        SEMANTIC_LINKS.put("version control", Arrays.asList("git", "github", "bitbucket", "gitlab"));
    }

    public AtsScoreDto match(ParsedJdDto jd, ParsedResumeDto resume) {
        
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        List<String> partialMatches = new ArrayList<>();
        List<String> semanticMatches = new ArrayList<>();
        List<String> explanations = new ArrayList<>();
        
        Set<String> normalizedResumeSkills = new HashSet<>();
        List<String> resumeSkills = resume.getSkills() != null ? resume.getSkills() : Collections.emptyList();
        for (String rs : resumeSkills) {
            normalizedResumeSkills.add(SkillNormalizer.normalize(rs).toLowerCase());
        }
        
        List<String> jdSkills = jd.getRequiredSkills() != null ? jd.getRequiredSkills() : Collections.emptyList();
        int totalJdSkills = jdSkills.size();
        
        for (String jdSkill : jdSkills) {
            String originalJdSkill = jdSkill;
            String normJdSkill = SkillNormalizer.normalize(jdSkill).toLowerCase();
            
            if (normalizedResumeSkills.contains(normJdSkill)) {
                matchedSkills.add(SkillNormalizer.normalize(originalJdSkill));
                continue;
            }
            
            boolean foundPartial = false;
            for (String rs : normalizedResumeSkills) {
                if (rs.contains(normJdSkill) || normJdSkill.contains(rs)) {
                    partialMatches.add(originalJdSkill + " (Found: " + rs + ")");
                    foundPartial = true;
                    break;
                }
            }
            if (foundPartial) continue;
            
            boolean foundSemantic = false;
            if (SEMANTIC_LINKS.containsKey(normJdSkill)) {
                for (String linkedSkill : SEMANTIC_LINKS.get(normJdSkill)) {
                    if (normalizedResumeSkills.contains(linkedSkill)) {
                        semanticMatches.add(originalJdSkill + " (Inferred from: " + linkedSkill + ")");
                        foundSemantic = true;
                        break;
                    }
                }
            }
            if (!foundSemantic) {
                for (Map.Entry<String, List<String>> entry : SEMANTIC_LINKS.entrySet()) {
                    if (entry.getValue().contains(normJdSkill) && normalizedResumeSkills.contains(entry.getKey())) {
                        semanticMatches.add(originalJdSkill + " (Inferred from category: " + entry.getKey() + ")");
                        foundSemantic = true;
                        break;
                    }
                }
            }
            
            if (foundSemantic) continue;
            missingSkills.add(originalJdSkill);
        }

        // === DETERMINISTIC SCORING ENGINE ===
        
        // 1. Skill Score (35%)
        double skillScore = 0.0;
        if (totalJdSkills > 0) {
            skillScore = ((double) matchedSkills.size() / totalJdSkills) * 100.0;
        }
        explanations.add(String.format("Skill Score (35%%): %.1f/100 -> %d Exact/Normalized matches out of %d required.", skillScore, matchedSkills.size(), totalJdSkills));

        // 2. Keyword Score (15%)
        double keywordScore = 0.0;
        if (totalJdSkills > 0) {
            keywordScore = Math.min(100.0, ((double) partialMatches.size() / Math.max(1, totalJdSkills / 2)) * 100.0);
        } else {
            keywordScore = 100.0; 
        }
        explanations.add(String.format("Keyword Score (15%%): %.1f/100 -> Based on %d partial contextual matches.", keywordScore, partialMatches.size()));

        // 3. Semantic Score (10%)
        double semanticScore = 0.0;
        if (totalJdSkills > 0) {
            semanticScore = Math.min(100.0, ((double) semanticMatches.size() / Math.max(1, totalJdSkills / 2)) * 100.0);
        } else {
            semanticScore = 100.0;
        }
        explanations.add(String.format("Semantic Score (10%%): %.1f/100 -> Found %d semantically related concepts using Knowledge Graph.", semanticScore, semanticMatches.size()));

        // 4. Experience Score (20%)
        double expScore = calculateExperienceScore(jd.getExperienceRequired(), resume.getExperience());
        int expCount = resume.getExperience() != null ? resume.getExperience().size() : 0;
        explanations.add(String.format("Experience Score (20%%): %.1f/100 -> JD requires '%s', Resume has %d roles.", expScore, jd.getExperienceRequired(), expCount));

        // 5. Education Score (10%)
        double eduScore = calculateEducationScore(jd.getQualifications(), resume.getEducation());
        explanations.add(String.format("Education Score (10%%): %.1f/100 -> Based on degree requirements vs resume education.", eduScore));

        // 6. Structure Score (10%)
        double structureScore = 100.0;
        if (resume.getExperience() == null || resume.getExperience().isEmpty()) structureScore -= 25;
        if (resume.getEducation() == null || resume.getEducation().isEmpty()) structureScore -= 25;
        if (resumeSkills.isEmpty()) structureScore -= 25;
        if (resume.getSummary() == null || resume.getSummary().isEmpty()) structureScore -= 25;
        explanations.add(String.format("Structure Score (10%%): %.1f/100 -> Points deducted for missing standard resume sections.", structureScore));

        // FINAL MATH
        double finalScore = 
            (skillScore * 0.35) +
            (expScore * 0.20) +
            (keywordScore * 0.15) +
            (eduScore * 0.10) +
            (semanticScore * 0.10) +
            (structureScore * 0.10);
            
        finalScore = Math.round(finalScore * 10.0) / 10.0; // Round to 1 decimal
        explanations.add(String.format("Final Computed ATS Score: %.1f/100", finalScore));
        
        // --- Generate Recommendations (Phase 5) ---
        AtsRecommendationService.RecommendationResult feedback = recommendationService.generateRecommendations(resume, missingSkills, jd.getJobTitle());

        return AtsScoreDto.builder()
                .matchedSkills(matchedSkills)
                .missingSkills(missingSkills)
                .partialMatches(partialMatches)
                .semanticMatches(semanticMatches)
                .experienceMatch(jd.getExperienceRequired())
                .educationMatch("Computed")
                .jobTitleMatch(jd.getJobTitle())
                .skillScore(skillScore)
                .experienceScore(expScore)
                .keywordScore(keywordScore)
                .educationScore(eduScore)
                .semanticScore(semanticScore)
                .structureScore(structureScore)
                .finalScore(finalScore)
                .scoringExplanations(explanations)
                .resumeProblems(feedback.getProblems())
                .suggestions(feedback.getSuggestions())
                .build();
    }
    
    private double calculateExperienceScore(String jdExp, List<ParsedResumeDto.Experience> resumeExp) {
        if (jdExp == null || jdExp.equals("Not specified")) {
            return 100.0; // Free points if no experience specified
        }
        
        int requiredYears = 0;
        Matcher m = Pattern.compile("(\\d+)").matcher(jdExp);
        if (m.find()) {
            requiredYears = Integer.parseInt(m.group(1));
        }
        
        if (requiredYears == 0) return 100.0;
        
        // Very rough heuristic: each role averages 1.5 years
        int numRoles = (resumeExp != null) ? resumeExp.size() : 0;
        double estimatedCandidateYears = numRoles * 1.5;
        
        if (estimatedCandidateYears >= requiredYears) {
            return 100.0;
        } else {
            return Math.min(100.0, (estimatedCandidateYears / requiredYears) * 100.0);
        }
    }
    
    private double calculateEducationScore(String qualifications, List<ParsedResumeDto.Education> education) {
        if (qualifications == null) return 100.0;
        
        String lowerQual = qualifications.toLowerCase();
        boolean requiresBachelor = lowerQual.contains("bachelor") || lowerQual.contains("b.s") || lowerQual.contains("bs") || lowerQual.contains("degree");
        boolean requiresMaster = lowerQual.contains("master") || lowerQual.contains("m.s");
        
        if (!requiresBachelor && !requiresMaster) {
            return 100.0;
        }
        
        boolean hasEdu = education != null && !education.isEmpty();
        if (hasEdu) {
            // Check if any string matches
            for (ParsedResumeDto.Education ed : education) {
                String d = (ed.getDegree() != null) ? ed.getDegree().toLowerCase() : "";
                if (requiresMaster && (d.contains("master") || d.contains("m.s"))) return 100.0;
                if (requiresBachelor && (d.contains("bachelor") || d.contains("b.s"))) return 100.0;
            }
            return 75.0; // Has education, but exact degree text match failed (partial points)
        }
        
        return 0.0; // Missing completely
    }
}
