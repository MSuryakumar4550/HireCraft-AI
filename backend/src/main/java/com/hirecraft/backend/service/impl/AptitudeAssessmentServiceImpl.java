package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.request.SubmitAptitudeAnswerRequest;
import com.hirecraft.backend.dto.response.AptitudeAssessmentResponse;
import com.hirecraft.backend.entity.AptitudeAnswer;
import com.hirecraft.backend.entity.AptitudeAssessment;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.AssessmentStatus;
import com.hirecraft.backend.exception.BadRequestException;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.AptitudeAnswerRepository;
import com.hirecraft.backend.repository.AptitudeAssessmentRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.AptitudeAssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AptitudeAssessmentServiceImpl implements AptitudeAssessmentService {

    private final AptitudeAssessmentRepository assessmentRepository;
    private final AptitudeAnswerRepository answerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AptitudeAssessmentResponse createAssessment(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        AptitudeAssessment assessment = AptitudeAssessment.builder()
                .user(user)
                .status(AssessmentStatus.NOT_STARTED)
                .totalQuestions(30)
                .build();

        assessmentRepository.save(assessment);
        return toResponse(assessment);
    }

    @Override
    @Transactional(readOnly = true)
    public AptitudeAssessmentResponse getAssessment(UUID assessmentId) {
        return toResponse(findById(assessmentId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AptitudeAssessmentResponse> getUserAssessments(UUID userId) {
        return assessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void submitAnswer(UUID assessmentId, SubmitAptitudeAnswerRequest request) {
        AptitudeAssessment assessment = findById(assessmentId);
        if (assessment.getStatus() == AssessmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot submit answer to a completed assessment");
        }

        if (assessment.getStatus() == AssessmentStatus.NOT_STARTED) {
            assessment.setStatus(AssessmentStatus.IN_PROGRESS);
            assessmentRepository.save(assessment);
        }

        AptitudeAnswer answer = AptitudeAnswer.builder()
                .aptitudeAssessment(assessment)
                .questionNo(request.getQuestionNo())
                .selectedOption(request.getSelectedOption())
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .build();

        answerRepository.save(answer);
    }

    @Override
    @Transactional
    public AptitudeAssessmentResponse completeAssessment(UUID assessmentId) {
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

        assessment.setScore((int) correct);
        assessment.setStatus(AssessmentStatus.COMPLETED);

        if (total > 0) {
            assessment.setAccuracy(BigDecimal.valueOf(correct)
                    .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP));
        }

        assessmentRepository.save(assessment);
        return toResponse(assessment);
    }

    private AptitudeAssessment findById(UUID id) {
        return assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AptitudeAssessment", id));
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
