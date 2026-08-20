package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.LoginRequest;
import com.hirecraft.backend.dto.request.RegisterRequest;
import com.hirecraft.backend.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
