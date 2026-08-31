package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.UpdateProfileRequest;
import com.hirecraft.backend.dto.response.UserProfileResponse;



public interface UserService {

    UserProfileResponse getUserProfile(Long userId);

    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
}
