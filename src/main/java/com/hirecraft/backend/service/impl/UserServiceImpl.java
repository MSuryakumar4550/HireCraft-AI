package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.request.UpdateProfileRequest;
import com.hirecraft.backend.dto.response.UserProfileResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(UUID userId) {
        User user = findUserById(userId);
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserById(userId);

        if (request.getCollegeName() != null) user.setCollegeName(request.getCollegeName());
        if (request.getDegree() != null) user.setDegree(request.getDegree());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getCgpa() != null) user.setCgpa(request.getCgpa());
        if (request.getGraduationYear() != null) user.setGraduationYear(request.getGraduationYear());
        if (request.getExperienceLevel() != null) user.setExperienceLevel(request.getExperienceLevel());
        if (request.getTargetRole() != null) user.setTargetRole(request.getTargetRole());
        if (request.getCareerInterests() != null) user.setCareerInterests(request.getCareerInterests());
        if (request.getStrengths() != null) user.setStrengths(request.getStrengths());
        if (request.getWeaknesses() != null) user.setWeaknesses(request.getWeaknesses());

        userRepository.save(user);
        return toResponse(user);
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    private UserProfileResponse toResponse(User user) {
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .accountStatus(user.getAccountStatus())
                .collegeName(user.getCollegeName())
                .degree(user.getDegree())
                .department(user.getDepartment())
                .cgpa(user.getCgpa())
                .graduationYear(user.getGraduationYear())
                .experienceLevel(user.getExperienceLevel())
                .targetRole(user.getTargetRole())
                .careerInterests(user.getCareerInterests())
                .strengths(user.getStrengths())
                .weaknesses(user.getWeaknesses())
                .resumeFilename(user.getResumeFilename())
                .resumeProcessingStatus(user.getResumeProcessingStatus())
                .resumeAtsScore(user.getResumeAtsScore())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
