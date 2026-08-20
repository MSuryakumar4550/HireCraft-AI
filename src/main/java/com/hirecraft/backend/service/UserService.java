package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.UpdateProfileRequest;
import com.hirecraft.backend.dto.response.UserProfileResponse;

import java.util.UUID;

public interface UserService {

    UserProfileResponse getUserProfile(UUID userId);

    UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);
}
