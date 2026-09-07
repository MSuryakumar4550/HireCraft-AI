package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.EvaluationResult;
import com.hirecraft.backend.dto.InterviewQuestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewEvaluatorService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${hirecraft.ai.evaluator.url:http://localhost:8002/evaluate}")
    private String evaluatorApiUrl;

    public EvaluationResult evaluateAnswer(String candidateAnswer, InterviewQuestion question) {
        if (question == null) {
            EvaluationResult res = new EvaluationResult();
            res.setScore(BigDecimal.valueOf(5.0));
            res.setFeedback("No question context available.");
            return res;
        }

        log.info("Evaluating answer for question ID: {}", question.getId());
        String cleanAnswer = (candidateAnswer != null) ? candidateAnswer.trim() : "";

        // 1. Check for refusal / empty / evasive answers ("no idea", "don't know", etc.)
        if (isRefusalOrEmpty(cleanAnswer)) {
            return evaluateRefusal(cleanAnswer, question);
        }

        // 2. Attempt evaluation via Local Python LLM (port 8002) if running
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("candidateAnswer", cleanAnswer);
            requestBody.put("questionText", question.getQuestion());
            requestBody.put("criteria", question.getCriteria());
            requestBody.put("concepts", question.getConcepts());

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<EvaluationResult> response = restTemplate.postForEntity(
                    evaluatorApiUrl,
                    request,
                    EvaluationResult.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().getScore() != null) {
                log.info("Successfully evaluated using Local Hugging Face / Qwen LLM on port 8002");
                return response.getBody();
            }
        } catch (Exception e) {
            log.debug("Local LLM evaluator (port 8002) not active. Using built-in Concept & Rubric Evaluator: {}", e.getMessage());
        }

        // 3. Built-in Dynamic Concept & Rubric Evaluation Engine
        return evaluateWithConceptRubricEngine(cleanAnswer, question);
    }

    private boolean isRefusalOrEmpty(String answer) {
        if (answer.isEmpty() || answer.length() < 3) return true;
        String lower = answer.toLowerCase().replaceAll("[^a-z ]", " ").replaceAll("\\s+", " ").trim();
        List<String> refusalPhrases = List.of(
            "no idea", "dont know", "don t know", "do not know", "idk",
            "no clue", "not sure", "skip", "pass", "have no idea",
            "i dont know", "i do not know", "no knowledge", "na", "none", "nothing", "cant say", "can not say"
        );
        for (String phrase : refusalPhrases) {
            if (lower.equals(phrase) || lower.startsWith(phrase + " ") || lower.endsWith(" " + phrase)) {
                return true;
            }
        }
        return false;
    }

    private EvaluationResult evaluateRefusal(String answer, InterviewQuestion question) {
        EvaluationResult res = new EvaluationResult();
        res.setScore(BigDecimal.valueOf(0.0).setScale(1, RoundingMode.HALF_UP));

        List<String> concepts = (question.getConcepts() != null && !question.getConcepts().isEmpty())
                ? question.getConcepts()
                : List.of("foundational principles");
        String conceptsPreview = String.join(", ", concepts.subList(0, Math.min(3, concepts.size())));

        String answerText = answer.isEmpty() ? "No response recorded" : answer;
        res.setFeedback("No substantive technical answer provided (\"" + answerText + "\"). Missing all core concepts: " + conceptsPreview + ".");
        return res;
    }

    private EvaluationResult evaluateWithConceptRubricEngine(String answer, InterviewQuestion question) {
        String lowerAnswer = answer.toLowerCase();
        String[] words = lowerAnswer.split("\\s+");
        int wordCount = words.length;

        List<String> concepts = question.getConcepts() != null ? question.getConcepts() : List.of();
        List<String> criteria = question.getCriteria() != null ? question.getCriteria() : List.of();

        List<String> matchedConcepts = new ArrayList<>();
        List<String> missingConcepts = new ArrayList<>();

        for (String concept : concepts) {
            String cleanConcept = concept.toLowerCase().trim();
            // Check full concept match or multi-token overlap
            if (lowerAnswer.contains(cleanConcept)) {
                matchedConcepts.add(concept);
            } else {
                String[] conceptTokens = cleanConcept.split("[_\\s]+");
                int tokenHits = 0;
                for (String t : conceptTokens) {
                    if (t.length() > 3 && lowerAnswer.contains(t)) {
                        tokenHits++;
                    }
                }
                if (tokenHits >= Math.max(1, conceptTokens.length / 2)) {
                    matchedConcepts.add(concept);
                } else {
                    missingConcepts.add(concept);
                }
            }
        }

        // Calculate concept score (0 - 5.0)
        double conceptRatio = concepts.isEmpty() ? 0.5 : ((double) matchedConcepts.size() / concepts.size());
        double conceptScore = conceptRatio * 5.0;

        // Check criteria keyword matches (0 - 3.5)
        int criteriaHits = 0;
        for (String c : criteria) {
            String cleanCrit = c.toLowerCase();
            String[] critWords = cleanCrit.split("[^a-z0-9]+");
            int critWordMatches = 0;
            int significantWords = 0;
            for (String cw : critWords) {
                if (cw.length() > 4) {
                    significantWords++;
                    if (lowerAnswer.contains(cw)) {
                        critWordMatches++;
                    }
                }
            }
            if (significantWords > 0 && (double) critWordMatches / significantWords >= 0.3) {
                criteriaHits++;
            }
        }
        double criteriaRatio = criteria.isEmpty() ? 0.5 : ((double) criteriaHits / criteria.size());
        double criteriaScore = criteriaRatio * 3.5;

        // Technical elaboration and length factor (0 - 1.5)
        double depthScore;
        if (wordCount < 8) {
            depthScore = 0.2;
        } else if (wordCount < 20) {
            depthScore = 0.6;
        } else if (wordCount < 45) {
            depthScore = 1.0;
        } else {
            depthScore = 1.5;
        }

        // Total score calculation (bounded 0.5 to 10.0)
        double rawScore = conceptScore + criteriaScore + depthScore;
        
        // If very few words, cap score strictly
        if (wordCount < 10) {
            rawScore = Math.min(rawScore, 2.5);
        } else if (wordCount < 20) {
            rawScore = Math.min(rawScore, 5.0);
        }

        rawScore = Math.max(0.5, Math.min(10.0, rawScore));
        BigDecimal finalScore = BigDecimal.valueOf(rawScore).setScale(1, RoundingMode.HALF_UP);

        // Generate specific, actionable feedback
        StringBuilder feedback = new StringBuilder();
        if (!matchedConcepts.isEmpty()) {
            feedback.append("Covered concepts: ").append(String.join(", ", matchedConcepts)).append(". ");
        }
        if (!missingConcepts.isEmpty()) {
            String missingPreview = String.join(", ", missingConcepts.subList(0, Math.min(3, missingConcepts.size())));
            feedback.append("Missing core technical concepts: ").append(missingPreview).append(". ");
        }

        if (wordCount < 15) {
            feedback.append("Explanation was brief; expand on runtime trade-offs and operational thresholds for higher marks.");
        } else if (finalScore.compareTo(BigDecimal.valueOf(7.0)) >= 0) {
            feedback.append("Clear technical articulation meeting rubric expectations.");
        } else {
            feedback.append("Needs deeper technical explanation addressing exact architectural parameters.");
        }

        EvaluationResult result = new EvaluationResult();
        result.setScore(finalScore);
        result.setFeedback(feedback.toString());
        return result;
    }
}
