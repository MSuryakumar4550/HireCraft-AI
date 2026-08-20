package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.response.ReadinessResponse;
import com.hirecraft.backend.entity.ReadinessSnapshot;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.ReadinessSnapshotRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.ReadinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReadinessServiceImpl implements ReadinessService {

    private static final String CALCULATION_VERSION = "1.0";

    private final ReadinessSnapshotRepository snapshotRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReadinessResponse calculateAndSaveReadiness(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Readiness calculation logic will be implemented when evaluation data is available.
        // Snapshots are NEVER overwritten — a new record is created each time.
        ReadinessSnapshot snapshot = ReadinessSnapshot.builder()
                .user(user)
                .calculationVersion(CALCULATION_VERSION)
                .build();

        snapshotRepository.save(snapshot);
        return toResponse(snapshot);
    }

    @Override
    @Transactional(readOnly = true)
    public ReadinessResponse getCurrentReadiness(UUID userId) {
        return snapshotRepository.findFirstByUserUserIdOrderByCreatedAtDesc(userId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReadinessResponse> getReadinessHistory(UUID userId) {
        return snapshotRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
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
                .createdAt(s.getCreatedAt())
                .build();
    }
}
