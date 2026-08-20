package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.response.EvaluationResponse;
import com.hirecraft.backend.entity.Evaluation;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.EvaluationRepository;
import com.hirecraft.backend.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository evaluationRepository;

    @Override
    @Transactional(readOnly = true)
    public EvaluationResponse getEvaluation(UUID evaluationId) {
        return toResponse(evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation", evaluationId)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResponse> getUserEvaluations(UUID userId) {
        return evaluationRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    private EvaluationResponse toResponse(Evaluation e) {
        return EvaluationResponse.builder()
                .evaluationId(e.getEvaluationId())
                .evaluationType(e.getEvaluationType())
                .score(e.getScore())
                .percentage(e.getPercentage())
                .strengths(e.getStrengths())
                .weaknesses(e.getWeaknesses())
                .feedback(e.getFeedback())
                .recommendations(e.getRecommendations())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
