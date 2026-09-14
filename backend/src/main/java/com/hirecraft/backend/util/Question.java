package com.hirecraft.backend.util;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Model representing a question loaded from the JSON question bank.
 * Maps to the structure in resources/questions/coding/*.json files.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Question {

    private Integer id;
    private String title;
    private String description;
    private String difficulty;
    private List<String> topics;
    private List<String> companies;
    private List<String> constraints;
    private List<Example> examples;
    private List<String> languages;
    private Map<String, String> starterCode;
    private String correctAnswer;

    /**
     * Hidden test cases used for Judge0 execution/grading.
     * These are loaded from the JSON question bank but are NEVER sent to the frontend;
     * they are consumed only by the backend execution pipeline.
     */
    private List<TestCase> testCases;

    /**
     * Time limit in minutes based on difficulty:
     * EASY: 10 minutes, MEDIUM: 25 minutes, HARD: 40 minutes
     */
    public int getTimeLimitMinutes() {
        if (difficulty == null) return 10;
        return switch (difficulty.toUpperCase()) {
            case "HARD" -> 40;
            case "MEDIUM" -> 25;
            default -> 10;
        };
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Example {
        private String input;
        private String output;
        private String explanation;
    }

    /**
     * A hidden test case used exclusively by the Judge0 execution pipeline.
     * <ul>
     *   <li>{@code input} — the value fed to the program via stdin.</li>
     *   <li>{@code expectedOutput} — the exact output the program must produce.</li>
     * </ul>
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TestCase {
        private String input;
        private String expectedOutput;
    }

    /**
     * Returns the test cases for this question, or an empty list if none are defined.
     * Guarantees a non-null return value.
     */
    public List<TestCase> getTestCases() {
        return testCases != null ? testCases : Collections.emptyList();
    }
}
