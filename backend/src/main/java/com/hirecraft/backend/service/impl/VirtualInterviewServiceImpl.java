package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.response.VirtualInterviewResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.entity.VirtualInterview;
import com.hirecraft.backend.enums.StageType;
import com.hirecraft.backend.enums.VirtualInterviewStatus;
import com.hirecraft.backend.exception.BadRequestException;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.repository.VirtualInterviewRepository;
import com.hirecraft.backend.service.VirtualInterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VirtualInterviewServiceImpl implements VirtualInterviewService {

    private final VirtualInterviewRepository virtualInterviewRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public VirtualInterviewResponse createVirtualInterview(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        VirtualInterview interview = VirtualInterview.builder()
                .user(user)
                .status(VirtualInterviewStatus.NOT_STARTED)
                .currentStage(StageType.APTITUDE.name())
                .build();

        virtualInterviewRepository.save(interview);

        return toResponse(interview);
    }

    @Override
    @Transactional(readOnly = true)
    public VirtualInterviewResponse getVirtualInterview(Long virtualInterviewId) {
        return toResponse(findById(virtualInterviewId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VirtualInterviewResponse> getUserVirtualInterviews(Long userId) {
        return virtualInterviewRepository.findByUserUserId(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public VirtualInterviewResponse advanceStage(Long virtualInterviewId) {
        VirtualInterview interview = findById(virtualInterviewId);

        if (interview.getStatus() == VirtualInterviewStatus.COMPLETED) {
            throw new BadRequestException("Virtual interview is already completed");
        }

        StageType[] stageOrder = {StageType.APTITUDE, StageType.DSA, StageType.TECHNICAL, StageType.BEHAVIORAL};
        String currentStage = interview.getCurrentStage();

        for (int i = 0; i < stageOrder.length - 1; i++) {
            if (stageOrder[i].name().equals(currentStage)) {
                interview.setCurrentStage(stageOrder[i + 1].name());
                interview.setStatus(VirtualInterviewStatus.IN_PROGRESS);
                virtualInterviewRepository.save(interview);
                return toResponse(interview);
            }
        }

        // All stages done
        interview.setStatus(VirtualInterviewStatus.COMPLETED);
        interview.setCurrentStage(null);
        virtualInterviewRepository.save(interview);
        return toResponse(interview);
    }

    private VirtualInterview findById(Long id) {
        return virtualInterviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VirtualInterview", id));
    }

    private VirtualInterviewResponse toResponse(VirtualInterview vi) {
        return VirtualInterviewResponse.builder()
                .virtualInterviewId(vi.getVirtualInterviewId())
                .status(vi.getStatus())
                .currentStage(vi.getCurrentStage())
                .finalScore(vi.getFinalScore())
                .createdAt(vi.getCreatedAt())
                .build();
    }
}
