package com.hirecraft.backend.controller;

import com.hirecraft.backend.dto.request.CreateInterviewSessionRequest;
import com.hirecraft.backend.dto.request.SubmitInterviewAnswerRequest;
import com.hirecraft.backend.dto.response.InterviewSessionResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.InterviewSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewSessionService sessionService;
    private final UserRepository userRepository;

    @PostMapping("/sessions")
    public ResponseEntity<InterviewSessionResponse> createSession(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateInterviewSessionRequest request) {
        User user = resolveUser(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.createSession(user.getUserId(), request));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<InterviewSessionResponse>> getMySessions(
            @AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        return ResponseEntity.ok(sessionService.getUserSessions(user.getUserId()));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<InterviewSessionResponse> getSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.getSession(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/answers")
    public ResponseEntity<Void> submitAnswer(
            @PathVariable UUID sessionId,
            @Valid @RequestBody SubmitInterviewAnswerRequest request) {
        sessionService.submitAnswer(sessionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<InterviewSessionResponse> completeSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.completeSession(sessionId));
    }

    private User resolveUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
