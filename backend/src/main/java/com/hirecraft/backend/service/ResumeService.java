package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.UserProfileResponse;



public interface ResumeService {

    UserProfileResponse updateResumeMetadata(Long userId, String filename, String mimeType,
                                              Long fileSize, String objectKey,
                                              String storageProvider, String storageBucket);

    UserProfileResponse getResumeStatus(Long userId);
}
