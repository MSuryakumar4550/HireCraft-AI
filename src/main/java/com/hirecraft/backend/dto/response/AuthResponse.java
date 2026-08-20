package com.hirecraft.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private final String accessToken;
    private final String tokenType;
    private final String email;
    private final String fullName;

    public static AuthResponse of(String token, String email, String fullName) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .email(email)
                .fullName(fullName)
                .build();
    }
}
