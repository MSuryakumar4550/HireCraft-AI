package com.hirecraft.backend.controller;

import com.hirecraft.backend.dto.response.ReadinessResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.service.ReadinessService;
import com.hirecraft.backend.util.UserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/readiness")
@RequiredArgsConstructor
public class ReadinessController {

    private final ReadinessService readinessService;
    private final UserResolver userResolver;

    @GetMapping("/current")
    public ResponseEntity<ReadinessResponse> getCurrentReadiness(
            @AuthenticationPrincipal UserDetails principal) {
        User user = userResolver.resolveUser(principal);
        ReadinessResponse response = readinessService.getCurrentReadiness(user.getUserId());
        if (response == null) {
            response = readinessService.calculateAndSaveReadiness(user.getUserId());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ReadinessResponse>> getReadinessHistory(
            @AuthenticationPrincipal UserDetails principal) {
        User user = userResolver.resolveUser(principal);
        return ResponseEntity.ok(readinessService.getReadinessHistory(user.getUserId()));
    }
}
