package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.response.ReadinessResponse;
import com.hirecraft.backend.entity.AptitudeAssessment;
import com.hirecraft.backend.entity.InterviewSession;
import com.hirecraft.backend.entity.ReadinessSnapshot;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.InterviewStatus;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.AptitudeAssessmentRepository;
import com.hirecraft.backend.repository.InterviewSessionRepository;
import com.hirecraft.backend.repository.ReadinessSnapshotRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.ReadinessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReadinessServiceImpl implements ReadinessService {

    private static final String CALCULATION_VERSION = "1.0";

    private final ReadinessSnapshotRepository snapshotRepository;
    private final UserRepository userRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final AptitudeAssessmentRepository aptitudeAssessmentRepository;

    @Override
    @Transactional
    public ReadinessResponse calculateAndSaveReadiness(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<InterviewSession> sessions = interviewSessionRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        List<InterviewSession> completedSessions = sessions.stream()
                .filter(s -> s.getStatus() == InterviewStatus.COMPLETED && s.getTotalScore() != null)
                .toList();

        BigDecimal technicalReadiness = BigDecimal.ZERO;
        BigDecimal communicationReadiness = BigDecimal.ZERO;
        if (!completedSessions.isEmpty()) {
            double avgScore = completedSessions.stream()
                    .mapToDouble(s -> s.getTotalScore().doubleValue())
                    .average().orElse(0.0);
            technicalReadiness = BigDecimal.valueOf(avgScore).setScale(2, RoundingMode.HALF_UP);
            communicationReadiness = technicalReadiness.multiply(BigDecimal.valueOf(0.95)).setScale(2, RoundingMode.HALF_UP);
        }

        List<AptitudeAssessment> aptitudeTests = aptitudeAssessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        BigDecimal aptitudeReadiness = BigDecimal.ZERO;
        if (!aptitudeTests.isEmpty()) {
            double avgAptitude = aptitudeTests.stream()
                    .filter(a -> a.getScore() != null)
                    .mapToDouble(a -> a.getScore().doubleValue())
                    .average().orElse(0.0);
            aptitudeReadiness = BigDecimal.valueOf(avgAptitude).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal codingReadiness = technicalReadiness.multiply(BigDecimal.valueOf(0.9)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal resumeReadiness = BigDecimal.valueOf(75.00); // Default baseline

        // Overall placement readiness calculation
        BigDecimal overallPlacementReadiness = BigDecimal.ZERO;
        if (technicalReadiness.compareTo(BigDecimal.ZERO) > 0 || aptitudeReadiness.compareTo(BigDecimal.ZERO) > 0) {
            double techWeight = 0.50;
            double aptWeight = 0.30;
            double resumeWeight = 0.20;
            double overall = (technicalReadiness.doubleValue() * techWeight)
                    + (aptitudeReadiness.doubleValue() * aptWeight)
                    + (resumeReadiness.doubleValue() * resumeWeight);
            overallPlacementReadiness = BigDecimal.valueOf(overall).setScale(2, RoundingMode.HALF_UP);
        }

        ReadinessSnapshot snapshot = ReadinessSnapshot.builder()
                .user(user)
                .calculationVersion(CALCULATION_VERSION)
                .technicalReadiness(technicalReadiness)
                .communicationReadiness(communicationReadiness)
                .aptitudeReadiness(aptitudeReadiness)
                .codingReadiness(codingReadiness)
                .resumeReadiness(resumeReadiness)
                .overallPlacementReadiness(overallPlacementReadiness)
                .build();

        snapshotRepository.save(snapshot);
        return toResponse(snapshot);
    }

    @Override
    @Transactional
    public ReadinessResponse getCurrentReadiness(Long userId) {
        return snapshotRepository.findFirstByUserUserIdOrderBySnapshotAtDesc(userId)
                .map(this::toResponse)
                .orElseGet(() -> calculateAndSaveReadiness(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReadinessResponse> getReadinessHistory(Long userId) {
        return snapshotRepository.findByUserUserIdOrderBySnapshotAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    private ReadinessResponse toResponse(ReadinessSnapshot s) {
        return ReadinessResponse.builder()
                .readinessSnapshotId(s.getReadinessSnapshotId())
                .resumeReadiness(s.getResumeReadiness())
                .codingReadiness(s.getCodingReadiness())
                .companyCodingReadiness(s.getCompanyCodingReadiness())
                .aptitudeReadiness(s.getAptitudeReadiness())
                .technicalReadiness(s.getTechnicalReadiness())
                .communicationReadiness(s.getCommunicationReadiness())
                .behavioralReadiness(s.getBehavioralReadiness())
                .overallPlacementReadiness(s.getOverallPlacementReadiness())
                .calculationVersion(s.getCalculationVersion())
                .createdAt(s.getSnapshotAt())
                .build();
    }
}
