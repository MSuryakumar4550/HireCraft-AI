package com.hirecraft.backend.util;

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
import java.util.Collections;
import java.util.List;

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
    private List<Question> dsaQuestions = Collections.emptyList();

    @Getter
    private List<Question> companyQuestions = Collections.emptyList();

    @Getter
    private List<Question> aptitudeQuestions = Collections.emptyList();

    @Getter
    private List<Question> technicalQuestions = Collections.emptyList();

    @PostConstruct
    public void loadAll() {
        dsaQuestions = loadFromJson("questions/dsa_questions.json");
        companyQuestions = loadFromJson("questions/company_questions.json");
        aptitudeQuestions = loadFromJson("questions/aptitude_questions.json");
        technicalQuestions = loadFromJson("questions/technical_questions.json");

        log.info("Question bank loaded — DSA: {}, Company: {}, Aptitude: {}, Technical: {}",
                dsaQuestions.size(), companyQuestions.size(),
                aptitudeQuestions.size(), technicalQuestions.size());
    }

    private List<Question> loadFromJson(String resourcePath) {
        try {
            ClassPathResource resource = new ClassPathResource(resourcePath);
            if (!resource.exists()) {
                log.warn("Question bank file not found: {}", resourcePath);
                return Collections.emptyList();
            }
            try (InputStream is = resource.getInputStream()) {
                return objectMapper.readValue(is, new TypeReference<List<Question>>() {});
            }
        } catch (IOException e) {
            log.error("Failed to load question bank from {}: {}", resourcePath, e.getMessage());
            return Collections.emptyList();
        }
    }
}
