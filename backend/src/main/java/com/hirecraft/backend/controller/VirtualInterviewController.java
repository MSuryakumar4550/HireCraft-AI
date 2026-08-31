package com.hirecraft.backend.controller;

import com.hirecraft.backend.dto.response.VirtualInterviewResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.VirtualInterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/virtual-interviews")
@RequiredArgsConstructor
public class VirtualInterviewController {

    private final VirtualInterviewService virtualInterviewService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<VirtualInterviewResponse> createVirtualInterview(
            @AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(virtualInterviewService.createVirtualInterview(user.getUserId()));
    }

    @GetMapping
    public ResponseEntity<List<VirtualInterviewResponse>> getMyVirtualInterviews(
            @AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        return ResponseEntity.ok(virtualInterviewService.getUserVirtualInterviews(user.getUserId()));
    }

    @GetMapping("/{virtualInterviewId}")
    public ResponseEntity<VirtualInterviewResponse> getVirtualInterview(
            @PathVariable Long virtualInterviewId) {
        return ResponseEntity.ok(virtualInterviewService.getVirtualInterview(virtualInterviewId));
    }

    @PostMapping("/{virtualInterviewId}/advance")
    public ResponseEntity<VirtualInterviewResponse> advanceStage(
            @PathVariable Long virtualInterviewId) {
        return ResponseEntity.ok(virtualInterviewService.advanceStage(virtualInterviewId));
    }

    private User resolveUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
