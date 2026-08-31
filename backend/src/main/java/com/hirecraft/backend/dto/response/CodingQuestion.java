package com.hirecraft.backend.dto.response;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CodingQuestion {
    private Integer id;
    private String title;
    private String difficulty;
    private String description;
    private List<Example> examples;
    private List<String> constraints;
    private Map<String, String> starterCode;
    private List<String> topics;
    private List<String> companies;

    @Data
    public static class Example {
        private String input;
        private String output;
        private String explanation;
    }
}
