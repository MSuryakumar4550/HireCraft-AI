package com.hirecraft.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class PythonAtsResponseDto {

    @JsonProperty("final_ats_score")
    private Double finalAtsScore;

    private Breakdown breakdown;

    @Data
    public static class Breakdown {
        
        @JsonProperty("keyword_match")
        private KeywordMatch keywordMatch;

        @JsonProperty("semantic_score")
        private Double semanticScore;

        @JsonProperty("format_score")
        private Double formatScore;

        @JsonProperty("TEXT_THE_AI_READ")
        private String textTheAiRead;

        private List<String> recommendations;
    }

    @Data
    public static class KeywordMatch {
        private Double score;
        private List<String> matched;
        private List<String> missing;
    }
}
