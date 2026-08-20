package com.hirecraft.backend.util;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Model representing a question loaded from the JSON question bank.
 * Maps to the structure in resources/questions/*.json files.
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class Question {

    private Integer id;
    private String title;
    private String description;
    private String difficulty;
    private List<String> topics;
    private List<String> companies;
    private String constraints;
    private List<Example> examples;
    private String starterCode;
    private String correctAnswer;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Example {
        private String input;
        private String output;
        private String explanation;
    }
}
