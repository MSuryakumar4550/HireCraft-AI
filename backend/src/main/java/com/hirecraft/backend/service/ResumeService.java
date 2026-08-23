package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.UserProfileResponse;

import java.util.UUID;

public interface ResumeService {

    UserProfileResponse updateResumeMetadata(UUID userId, String filename, String mimeType,
                                              Long fileSize, String objectKey,
                                              String storageProvider, String storageBucket);

    UserProfileResponse getResumeStatus(UUID userId);
}
