package com.hirecraft.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirecraft.backend.dto.InterviewQuestion;
import com.hirecraft.backend.dto.QuestionBankFile;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionBankService {

    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    // Map<Subject, Map<Topic, Map<Difficulty, List<InterviewQuestion>>>>
    private final Map<String, Map<String, Map<String, List<InterviewQuestion>>>> questionBank = new HashMap<>();

    @PostConstruct
    public void init() {
        // Core Subjects (4 x 250 = 1,000 questions)
        loadBank("classpath:questions/Core_Subjects/os.json");
        loadBank("classpath:questions/Core_Subjects/dbms.json");
        loadBank("classpath:questions/Core_Subjects/cn.json");
        loadBank("classpath:questions/Core_Subjects/oops.json");

        // Technical Interview Domains (4 x 250 = 1,000 questions)
        loadBank("classpath:questions/Technical_Domains/system_design.json");
        loadBank("classpath:questions/Technical_Domains/backend_development.json");
        loadBank("classpath:questions/Technical_Domains/cloud_devops.json");
        loadBank("classpath:questions/Technical_Domains/security_apis.json");

        // Behavioral Competency Tracks (4 x 250 = 1,000 questions)
        loadBank("classpath:questions/Behavioral_Tracks/leadership_initiative.json");
        loadBank("classpath:questions/Behavioral_Tracks/teamwork_conflict.json");
        loadBank("classpath:questions/Behavioral_Tracks/problem_solving.json");
        loadBank("classpath:questions/Behavioral_Tracks/goal_achievement.json");

        log.info("QuestionBank initialized with {} subjects: {}", questionBank.size(), questionBank.keySet());
    }

    public String normalizeSubject(String sub) {
        if (sub == null || sub.trim().isEmpty()) return "Operating Systems";
        String s = sub.trim().toUpperCase().replace("-", "_").replace(" ", "_");

        // Core CS Subjects
        if (s.contains("OS") || s.contains("OPERAT")) return "Operating Systems";
        if (s.contains("OOP")) return "OOP";
        if (s.contains("DBMS") || s.contains("DATABASE")) return "DBMS";
        if (s.contains("NET") || s.contains("CN")) return "Computer Networks";

        // Technical Interview Domains
        if (s.contains("SYSTEM") || s.contains("ARCHITECT")) return "System Design";
        if (s.contains("BACKEND") || s.contains("JAVA")) return "Backend Engineering";
        if (s.contains("CLOUD") || s.contains("DEVOPS") || s.contains("INFRA")) return "Cloud & Infrastructure";
        if (s.contains("SECUR") || s.contains("API")) return "API Security & Design";

        // Behavioral Competency Tracks
        if (s.contains("LEADER") || s.contains("INITIATIVE")) return "Leadership & Initiative";
        if (s.contains("TEAM") || s.contains("CONFLICT")) return "Teamwork & Conflict Resolution";
        if (s.contains("PROBLEM") || s.contains("ADAPT")) return "Problem Solving & Adaptability";
        if (s.contains("GOAL") || s.contains("ACHIEV") || s.contains("IMPACT")) return "Goal Achievement & Impact";

        return sub.trim();
    }

    private void loadBank(String location) {
        try {
            Resource resource = resourceLoader.getResource(location);
            if (!resource.exists()) {
                log.warn("Question bank file not found: {}", location);
                return;
            }
            try (InputStream is = resource.getInputStream()) {
                QuestionBankFile bankFile = objectMapper.readValue(is, QuestionBankFile.class);
                if (bankFile == null || bankFile.getQuestions() == null) {
                    log.warn("Question bank file {} has no questions", location);
                    return;
                }
                
                String fileSubject = normalizeSubject(bankFile.getSubject());

                for (InterviewQuestion q : bankFile.getQuestions()) {
                    String rawSubject = (q.getSubject() != null && !q.getSubject().trim().isEmpty())
                            ? q.getSubject()
                            : fileSubject;
                    String subject = normalizeSubject(rawSubject);
                    String topic = q.getTopic() != null ? q.getTopic() : "General";
                    String difficulty = q.getDifficulty() != null ? q.getDifficulty().toUpperCase() : "MEDIUM";

                    questionBank.computeIfAbsent(subject, k -> new HashMap<>())
                                .computeIfAbsent(topic, k -> new HashMap<>())
                                .computeIfAbsent(difficulty, k -> new ArrayList<>())
                                .add(q);
                }
                log.info("Loaded {} questions from {} for subject '{}'", bankFile.getQuestions().size(), location, fileSubject);
            }
        } catch (Exception e) {
            log.error("Failed to load question bank: {}", location, e);
        }
    }

    public InterviewQuestion getQuestionById(String id) {
        for (Map<String, Map<String, List<InterviewQuestion>>> subjectMap : questionBank.values()) {
            for (Map<String, List<InterviewQuestion>> topicMap : subjectMap.values()) {
                for (List<InterviewQuestion> questions : topicMap.values()) {
                    for (InterviewQuestion q : questions) {
                        if (q.getId().equals(id)) return q;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Get a question that hasn't been asked yet for a given subject, topic, and difficulty.
     */
    public InterviewQuestion getNextQuestion(String subject, String topic, String difficulty, List<String> askedQuestionIds) {
        String normSub = normalizeSubject(subject);
        Map<String, Map<String, List<InterviewQuestion>>> subjectMap = questionBank.get(normSub);
        if (subjectMap == null) return null;

        Map<String, List<InterviewQuestion>> topicMap = subjectMap.get(topic);
        if (topicMap == null) return null;

        // 1. Try requested difficulty
        if (difficulty != null) {
            List<InterviewQuestion> questions = topicMap.get(difficulty.toUpperCase());
            if (questions != null && !questions.isEmpty()) {
                InterviewQuestion match = questions.stream()
                        .filter(q -> askedQuestionIds == null || !askedQuestionIds.contains(q.getId()))
                        .findFirst()
                        .orElse(null);
                if (match != null) return match;
            }
        }

        // 2. Fallback: try other difficulties in order (MEDIUM -> EASY -> HARD)
        String[] preferredOrder = {"MEDIUM", "EASY", "HARD"};
        for (String diff : preferredOrder) {
            List<InterviewQuestion> questions = topicMap.get(diff);
            if (questions != null && !questions.isEmpty()) {
                InterviewQuestion match = questions.stream()
                        .filter(q -> askedQuestionIds == null || !askedQuestionIds.contains(q.getId()))
                        .findFirst()
                        .orElse(null);
                if (match != null) return match;
            }
        }

        // 3. Fallback: check any remaining difficulty in this topic
        for (List<InterviewQuestion> fallbackList : topicMap.values()) {
            if (fallbackList != null) {
                InterviewQuestion match = fallbackList.stream()
                        .filter(q -> askedQuestionIds == null || !askedQuestionIds.contains(q.getId()))
                        .findFirst()
                        .orElse(null);
                if (match != null) return match;
            }
        }

        return null;
    }
    
    public List<String> getAvailableTopics(String subject) {
        String normSub = normalizeSubject(subject);
        Map<String, Map<String, List<InterviewQuestion>>> subjectMap = questionBank.get(normSub);
        if (subjectMap == null) return List.of();
        return new ArrayList<>(subjectMap.keySet());
    }
}
