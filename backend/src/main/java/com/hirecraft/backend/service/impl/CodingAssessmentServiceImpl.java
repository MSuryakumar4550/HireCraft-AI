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
import com.hirecraft.backend.service.AiMemoryService;
import com.hirecraft.backend.service.CodingAssessmentService;
import com.hirecraft.backend.dto.response.CodingQuestion;
import com.hirecraft.backend.service.QuestionEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CodingAssessmentServiceImpl implements CodingAssessmentService {

    private final CodingAssessmentRepository codingAssessmentRepository;
    private final UserRepository userRepository;
    private final AiMemoryService aiMemoryService;
    private final QuestionEngineService questionEngineService;

    @Override
    @Transactional
    public CodingAssessmentResponse createAssessment(Long userId, CreateCodingAssessmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<CodingQuestion> questions = questionEngineService.generateCodingQuestions(userId, request.getDifficultyLevel());
        int timeLimitMinutes = questionEngineService.calculateTotalTimeLimit(questions);

        CodingAssessment assessment = CodingAssessment.builder()
                .user(user)
                .assessmentMode(request.getAssessmentMode())
                .difficultyLevel(request.getDifficultyLevel())
                .status(AssessmentStatus.NOT_STARTED)
                .totalQuestions(questions.size())
                .build();

        codingAssessmentRepository.save(assessment);
        return toResponse(assessment, questions, timeLimitMinutes);
    }

    @Override
    @Transactional(readOnly = true)
    public CodingAssessmentResponse getAssessment(Long assessmentId) {
        return toResponse(findById(assessmentId), null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CodingAssessmentResponse> getUserAssessments(Long userId) {
        return codingAssessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(a -> toResponse(a, null, null)).toList();
    }

    @Override
    @Transactional
    public CodingAssessmentResponse completeAssessment(Long assessmentId) {
        CodingAssessment assessment = findById(assessmentId);
        if (assessment.getStatus() == AssessmentStatus.COMPLETED) {
            throw new BadRequestException("Assessment is already completed");
        }
        assessment.setStatus(AssessmentStatus.COMPLETED);
        codingAssessmentRepository.save(assessment);
        
        // Update AI Memory
        Integer score = assessment.getScore() != null ? assessment.getScore().intValue() : 0;
        aiMemoryService.updateMemoryGraph(
                assessment.getUser().getUserId(),
                com.hirecraft.backend.enums.MemoryCategory.TECHNICAL, // Assuming coding is technical
                com.hirecraft.backend.enums.MemoryType.STRENGTH, // Default, logic handles re-classification
                "Data Structures and Algorithms",
                score,
                "Coding assessment completed."
        );
        
        return toResponse(assessment, null, null);
    }

    private CodingAssessment findById(Long id) {
        return codingAssessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CodingAssessment", id));
    }

    private CodingAssessmentResponse toResponse(CodingAssessment a, List<CodingQuestion> questions, Integer timeLimitMinutes) {
        return CodingAssessmentResponse.builder()
                .codingAssessmentId(a.getCodingAssessmentId())
                .assessmentMode(a.getAssessmentMode())
                .difficultyLevel(a.getDifficultyLevel())
                .status(a.getStatus())
                .totalQuestions(a.getTotalQuestions())
                .score(a.getScore())
                .accuracy(a.getAccuracy())
                .questions(questions)
                .timeLimitMinutes(timeLimitMinutes)
                .createdAt(a.getCreatedAt())
                .build();
    }
}
