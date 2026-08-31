package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.ParsedResumeDto;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AtsRecommendationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_SERVICE_URL = "http://localhost:8000/api/suggestions";

    public RecommendationResult generateRecommendations(ParsedResumeDto resume, List<String> missingSkills, String jobTitle) {
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("parsed_resume", resume);
        requestBody.put("missing_skills", missingSkills);
        requestBody.put("job_title", jobTitle != null ? jobTitle : "Unknown Job");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    PYTHON_SERVICE_URL, requestEntity, Map.class);
                    
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null) {
                List<String> problems = (List<String>) responseBody.getOrDefault("problems", new ArrayList<>());
                List<String> suggestions = (List<String>) responseBody.getOrDefault("suggestions", new ArrayList<>());
                return new RecommendationResult(problems, suggestions);
            }
        } catch (Exception e) {
            System.err.println("Error calling Python Suggestions API: " + e.getMessage());
        }

        // Fallback if LLM fails
        return generateFallbackRecommendations(resume, missingSkills);
    }

    // Keep the old logic as a fallback just in case the python server is down
    private RecommendationResult generateFallbackRecommendations(ParsedResumeDto resume, List<String> missingSkills) {
        List<String> problems = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (resume.getSummary() == null || resume.getSummary().trim().isEmpty()) {
            problems.add("Resume is missing a professional summary.");
            suggestions.add("Add a strong professional summary (3-4 sentences) at the top of your resume to grab attention.");
        } 

        if (missingSkills != null && !missingSkills.isEmpty()) {
            int maxSuggestions = Math.min(3, missingSkills.size());
            for (int i = 0; i < maxSuggestions; i++) {
                suggestions.add("Add " + missingSkills.get(i) + " experience if you genuinely have it.");
            }
        }

        return new RecommendationResult(problems, suggestions);
    }

    public static class RecommendationResult {
        private final List<String> problems;
        private final List<String> suggestions;

        public RecommendationResult(List<String> problems, List<String> suggestions) {
            this.problems = problems;
            this.suggestions = suggestions;
        }

        public List<String> getProblems() {
            return problems;
        }

        public List<String> getSuggestions() {
            return suggestions;
        }
    }
}
