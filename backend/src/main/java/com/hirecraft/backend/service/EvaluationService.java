package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.EvaluationResponse;

import java.util.List;
import java.util.UUID;

public interface EvaluationService {

    EvaluationResponse getEvaluation(UUID evaluationId);

    List<EvaluationResponse> getUserEvaluations(UUID userId);
}
