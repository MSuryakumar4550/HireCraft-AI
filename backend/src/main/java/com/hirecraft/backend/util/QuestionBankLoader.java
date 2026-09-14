package com.hirecraft.backend.util;

import com.hirecraft.backend.enums.DifficultyLevel;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Loads question banks from JSON files at application startup.
 * Questions are NOT stored in PostgreSQL — they are loaded from classpath resources.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class QuestionBankLoader {

    private final JsonMapper objectMapper;

    @Getter
    private List<Question> easyQuestions = Collections.emptyList();

    @Getter
    private List<Question> mediumQuestions = Collections.emptyList();

    @Getter
    private List<Question> hardQuestions = Collections.emptyList();

    private final Map<Integer, Question> questionMap = new ConcurrentHashMap<>();

    @PostConstruct
    public void loadAll() {
        easyQuestions = loadFromJson("questions/coding/easy.json");
        mediumQuestions = loadFromJson("questions/coding/medium.json");
        hardQuestions = loadFromJson("questions/coding/hard.json");

        questionMap.clear();
        for (Question q : easyQuestions) {
            if (q.getId() != null) questionMap.put(q.getId(), q);
        }
        for (Question q : mediumQuestions) {
            if (q.getId() != null) questionMap.put(q.getId(), q);
        }
        for (Question q : hardQuestions) {
            if (q.getId() != null) questionMap.put(q.getId(), q);
        }

        log.info("Coding Question Bank loaded — Easy: {}, Medium: {}, Hard: {}, Total unique indexed: {}",
                easyQuestions.size(), mediumQuestions.size(), hardQuestions.size(), questionMap.size());
    }

    public List<Question> getQuestionsByDifficulty(DifficultyLevel difficulty) {
        if (difficulty == null) return Collections.emptyList();
        return switch (difficulty) {
            case EASY -> Collections.unmodifiableList(easyQuestions);
            case MEDIUM -> Collections.unmodifiableList(mediumQuestions);
            case HARD -> Collections.unmodifiableList(hardQuestions);
        };
    }

    public Optional<Question> getQuestionById(Integer id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(questionMap.get(id));
    }

    public List<Question> getAllCodingQuestions() {
        List<Question> all = new ArrayList<>(easyQuestions.size() + mediumQuestions.size() + hardQuestions.size());
        all.addAll(easyQuestions);
        all.addAll(mediumQuestions);
        all.addAll(hardQuestions);
        return all;
    }

    private List<Question> loadFromJson(String resourcePath) {
        try {
            ClassPathResource resource = new ClassPathResource(resourcePath);
            if (!resource.exists()) {
                log.warn("Question bank file not found: {}", resourcePath);
                return Collections.emptyList();
            }
            try (InputStream is = resource.getInputStream()) {
                List<Question> list = objectMapper.readValue(is, new TypeReference<List<Question>>() {});
                return list != null ? list : Collections.emptyList();
            }
        } catch (IOException e) {
            log.error("Failed to load question bank from {}: {}", resourcePath, e.getMessage());
            return Collections.emptyList();
        }
    }
}
