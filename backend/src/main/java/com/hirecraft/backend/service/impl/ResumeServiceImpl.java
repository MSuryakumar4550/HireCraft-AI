package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.response.UserProfileResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.ResumeProcessingStatus;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserProfileResponse updateResumeMetadata(UUID userId, String filename, String mimeType,
                                                     Long fileSize, String objectKey,
                                                     String storageProvider, String storageBucket) {
        User user = findUserById(userId);

        user.setResumeFilename(filename);
        user.setResumeMimeType(mimeType);
        user.setResumeFileSize(fileSize);
        user.setResumeObjectKey(objectKey);
        user.setResumeStorageProvider(storageProvider);
        user.setResumeStorageBucket(storageBucket);
        user.setResumeProcessingStatus(ResumeProcessingStatus.PENDING);

        userRepository.save(user);
        return toProfileResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getResumeStatus(UUID userId) {
        return toProfileResponse(findUserById(userId));
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .accountStatus(user.getAccountStatus())
                .resumeFilename(user.getResumeFilename())
                .resumeProcessingStatus(user.getResumeProcessingStatus())
                .resumeAtsScore(user.getResumeAtsScore())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
