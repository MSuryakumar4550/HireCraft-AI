package com.hirecraft.backend.dto;

import lombok.Data;
import java.util.List;
import java.math.BigDecimal;

@Data
public class EvaluationResult {
    private BigDecimal score;
    private String feedback;
    private List<String> missingConcepts;
}
