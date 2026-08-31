package com.hirecraft.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirecraft.backend.dto.request.SubmitAptitudeAnswerRequest;
import com.hirecraft.backend.dto.response.AptitudeAssessmentResponse;
import com.hirecraft.backend.dto.response.AptitudeQuestion;
import com.hirecraft.backend.entity.AptitudeAnswer;
import com.hirecraft.backend.entity.AptitudeAssessment;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.AssessmentStatus;
import com.hirecraft.backend.exception.BadRequestException;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.AptitudeAnswerRepository;
import com.hirecraft.backend.repository.AptitudeAssessmentRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.AiMemoryService;
import com.hirecraft.backend.service.AptitudeAssessmentService;
import jakarta.annotation.PostConstruct;
import com.hirecraft.backend.service.QuestionEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AptitudeAssessmentServiceImpl implements AptitudeAssessmentService {

    private final AptitudeAssessmentRepository assessmentRepository;
    private final AptitudeAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final AiMemoryService aiMemoryService;
    private final QuestionEngineService questionEngineService;

    public List<AptitudeQuestion> getQuestions() {
        // Fallback for any other usages, but mostly unused now
        return questionEngineService.generateAptitudeQuestions(-1L, 15);
    }


    @Override
    @Transactional
    public AptitudeAssessmentResponse createAssessment(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Generate questions via QuestionEngine
        List<AptitudeQuestion> questions = questionEngineService.generateAptitudeQuestions(userId, 15);

        AptitudeAssessment assessment = AptitudeAssessment.builder()
                .user(user)
                .status(AssessmentStatus.NOT_STARTED)
                .totalQuestions(questions.size())
                .build();

        assessmentRepository.save(assessment);
        return toResponse(assessment);
    }

    @Override
    @Transactional(readOnly = true)
    public AptitudeAssessmentResponse getAssessment(Long assessmentId) {
        return toResponse(findById(assessmentId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AptitudeAssessmentResponse> getUserAssessments(Long userId) {
        return assessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void submitAnswer(Long assessmentId, SubmitAptitudeAnswerRequest request) {
        AptitudeAssessment assessment = findById(assessmentId);
        if (assessment.getStatus() == AssessmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot submit answer to a completed assessment");
        }

        if (assessment.getStatus() == AssessmentStatus.NOT_STARTED) {
            assessment.setStatus(AssessmentStatus.IN_PROGRESS);
            assessmentRepository.save(assessment);
        }

        Boolean isCorrect = false;
        Optional<AptitudeQuestion> questionOpt = questionEngineService.getAptitudeQuestionById(request.getQuestionNo());

        if (questionOpt.isPresent()) {
            isCorrect = request.getSelectedOption() != null && 
                       request.getSelectedOption().equals(questionOpt.get().getCorrectOption());
        }

        AptitudeAnswer answer = AptitudeAnswer.builder()
                .aptitudeAssessment(assessment)
                .questionNo(request.getQuestionNo())
                .selectedOption(request.getSelectedOption())
                .isCorrect(isCorrect)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .build();

        answerRepository.save(answer);

        // Dynamically update AI Memory after every question
        if (questionOpt.isPresent()) {
            AptitudeQuestion q = questionOpt.get();
            int score = isCorrect ? 100 : 0;
            String feedback = isCorrect ? "Answered correctly." : "Missed this question.";
            aiMemoryService.updateMemoryGraph(
                    assessment.getUser().getUserId(),
                    com.hirecraft.backend.enums.MemoryCategory.APTITUDE,
                    com.hirecraft.backend.enums.MemoryType.STRENGTH, // initial assumption, will self-correct in AiMemoryServiceImpl
                    q.getTopic() != null ? q.getTopic() : "General Aptitude",
                    score,
                    feedback
            );
        }
    }

    @Override
    @Transactional
    public AptitudeAssessmentResponse completeAssessment(Long assessmentId) {
        AptitudeAssessment assessment = findById(assessmentId);
        if (assessment.getStatus() == AssessmentStatus.COMPLETED) {
            throw new BadRequestException("Assessment is already completed");
        }

        List<AptitudeAnswer> answers = answerRepository
                .findByAptitudeAssessmentAptitudeAssessmentId(assessmentId);

        long correct = answers.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsCorrect()))
                .count();

        int total = assessment.getTotalQuestions() != null ? assessment.getTotalQuestions() : answers.size();

        assessment.setScore(BigDecimal.valueOf(correct));
        assessment.setStatus(AssessmentStatus.COMPLETED);

        if (total > 0) {
            assessment.setAccuracy(BigDecimal.valueOf(correct)
                    .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP));
        }

        assessmentRepository.save(assessment);

        // Update AI Memory Engine
        aiMemoryService.updateMemoryGraph(
                assessment.getUser().getUserId(),
                com.hirecraft.backend.enums.MemoryCategory.APTITUDE,
                com.hirecraft.backend.enums.MemoryType.STRENGTH, 
                "General Aptitude & Reasoning",
                assessment.getAccuracy() != null ? assessment.getAccuracy().intValue() : 0,
                "Aptitude test completed."
        );

        return toResponse(assessment);
    }

    private AptitudeAssessment findById(Long id) {
        return assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AptitudeAssessment", id));
    }

    @Override
    @Transactional
    public AptitudeAssessmentResponse saveScore(Long userId, com.hirecraft.backend.dto.request.SaveAptitudeScoreRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        AptitudeAssessment assessment = AptitudeAssessment.builder()
                .user(user)
                .status(AssessmentStatus.COMPLETED)
                .totalQuestions(request.getTotalQuestions())
                .score(BigDecimal.valueOf(request.getScore()))
                .accuracy(request.getAccuracy())
                .build();

        assessmentRepository.save(assessment);

        // Update AI Memory Engine
        aiMemoryService.updateMemoryGraph(
                userId,
                com.hirecraft.backend.enums.MemoryCategory.APTITUDE,
                com.hirecraft.backend.enums.MemoryType.STRENGTH, 
                "General Aptitude & Reasoning",
                request.getAccuracy() != null ? request.getAccuracy().intValue() : 0,
                "Aptitude test completed."
        );

        return toResponse(assessment);
    }

    private AptitudeAssessmentResponse toResponse(AptitudeAssessment a) {
        return AptitudeAssessmentResponse.builder()
                .aptitudeAssessmentId(a.getAptitudeAssessmentId())
                .status(a.getStatus())
                .totalQuestions(a.getTotalQuestions())
                .score(a.getScore())
                .accuracy(a.getAccuracy())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
