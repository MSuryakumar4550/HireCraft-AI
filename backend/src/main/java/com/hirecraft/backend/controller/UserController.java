package com.hirecraft.backend.controller;

import com.hirecraft.backend.dto.request.UpdateProfileRequest;
import com.hirecraft.backend.dto.response.UserProfileResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.service.UserService;
import com.hirecraft.backend.util.UserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserResolver userResolver;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails principal) {
        User user = userResolver.resolveUser(principal);
        return ResponseEntity.ok(userService.getUserProfile(user.getUserId()));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = userResolver.resolveUser(principal);
        return ResponseEntity.ok(userService.updateProfile(user.getUserId(), request));
    }
}
