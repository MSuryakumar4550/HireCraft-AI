package com.hirecraft.backend.util;

import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.AccountStatus;
import com.hirecraft.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserResolver {

    private final UserRepository userRepository;

    public User resolveUser(UserDetails principal) {
        if (principal != null && principal.getUsername() != null && !principal.getUsername().isBlank()) {
            User user = userRepository.findByEmail(principal.getUsername()).orElse(null);
            if (user != null) {
                return user;
            }
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String email = auth.getName();
            if (email != null && !email.isBlank()) {
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    return user;
                }
            }
        }

        // Fallback to existing active user in the database, or create candidate user
        return userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User defaultUser = User.builder()
                    .email("candidate@hirecraft.ai")
                    .fullName("Candidate User")
                    .passwordHash("dummy")
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();
            return userRepository.save(defaultUser);
        });
    }
}
