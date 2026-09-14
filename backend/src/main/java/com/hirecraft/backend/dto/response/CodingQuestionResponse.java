package com.hirecraft.backend.dto.response;

import com.hirecraft.backend.enums.DifficultyLevel;
import com.hirecraft.backend.util.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingQuestionResponse {

    private Integer id;
    private Integer questionNumber;
    private String title;
    private DifficultyLevel difficulty;
    private Integer timeLimitMinutes;
    private String description;
    private List<Question.Example> examples;
    private List<String> constraints;
    private List<String> languages;
    private Map<String, String> starterCode;
}
