package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.EvaluationResponse;

import java.util.List;


public interface EvaluationService {

    EvaluationResponse getEvaluation(Long evaluationId);

    List<EvaluationResponse> getUserEvaluations(Long userId);
}
