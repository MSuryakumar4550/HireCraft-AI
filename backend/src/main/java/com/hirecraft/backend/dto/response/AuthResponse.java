package com.hirecraft.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private final String accessToken;
    private final String tokenType;
    private final Long userId;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String role;

    public static AuthResponse of(String token, Long userId, String email, String fullName, String role) {
        String firstName = "";
        String lastName = "";
        if (fullName != null && !fullName.trim().isEmpty()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(userId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .build();
    }
}
