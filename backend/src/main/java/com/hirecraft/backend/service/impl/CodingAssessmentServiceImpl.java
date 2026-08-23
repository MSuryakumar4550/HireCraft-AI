package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.request.CreateCodingAssessmentRequest;
import com.hirecraft.backend.dto.response.CodingAssessmentResponse;
import com.hirecraft.backend.entity.CodingAssessment;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.AssessmentStatus;
import com.hirecraft.backend.exception.BadRequestException;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.CodingAssessmentRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.CodingAssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CodingAssessmentServiceImpl implements CodingAssessmentService {

    private final CodingAssessmentRepository codingAssessmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CodingAssessmentResponse createAssessment(UUID userId, CreateCodingAssessmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        int totalQuestions = switch (request.getDifficultyLevel()) {
            case EASY -> 5;
            case MEDIUM -> 5;
            case HARD -> 5;
        };

        CodingAssessment assessment = CodingAssessment.builder()
                .user(user)
                .assessmentMode(request.getAssessmentMode())
                .difficultyLevel(request.getDifficultyLevel())
                .status(AssessmentStatus.NOT_STARTED)
                .totalQuestions(totalQuestions)
                .build();

        codingAssessmentRepository.save(assessment);
        return toResponse(assessment);
    }

    @Override
    @Transactional(readOnly = true)
    public CodingAssessmentResponse getAssessment(UUID assessmentId) {
        return toResponse(findById(assessmentId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CodingAssessmentResponse> getUserAssessments(UUID userId) {
        return codingAssessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public CodingAssessmentResponse completeAssessment(UUID assessmentId) {
        CodingAssessment assessment = findById(assessmentId);
        if (assessment.getStatus() == AssessmentStatus.COMPLETED) {
            throw new BadRequestException("Assessment is already completed");
        }
        assessment.setStatus(AssessmentStatus.COMPLETED);
        codingAssessmentRepository.save(assessment);
        return toResponse(assessment);
    }

    private CodingAssessment findById(UUID id) {
        return codingAssessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CodingAssessment", id));
    }

    private CodingAssessmentResponse toResponse(CodingAssessment a) {
        return CodingAssessmentResponse.builder()
                .codingAssessmentId(a.getCodingAssessmentId())
                .assessmentMode(a.getAssessmentMode())
                .difficultyLevel(a.getDifficultyLevel())
                .status(a.getStatus())
                .totalQuestions(a.getTotalQuestions())
                .score(a.getScore())
                .accuracy(a.getAccuracy())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
