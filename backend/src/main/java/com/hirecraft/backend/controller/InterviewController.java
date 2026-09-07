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


@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewSessionService sessionService;
    private final com.hirecraft.backend.util.UserResolver userResolver;

    @PostMapping("/sessions")
    public ResponseEntity<InterviewSessionResponse> createSession(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateInterviewSessionRequest request) {
        User user = userResolver.resolveUser(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.createSession(user.getUserId(), request));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<InterviewSessionResponse>> getMySessions(
            @AuthenticationPrincipal UserDetails principal) {
        User user = userResolver.resolveUser(principal);
        return ResponseEntity.ok(sessionService.getUserSessions(user.getUserId()));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<InterviewSessionResponse> getSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSession(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/start")
    public ResponseEntity<InterviewSessionResponse> startSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.startSession(sessionId));
    }

    @GetMapping("/sessions/{sessionId}/current-question")
    public ResponseEntity<com.hirecraft.backend.dto.InterviewQuestion> getCurrentQuestion(@PathVariable Long sessionId) {
        com.hirecraft.backend.dto.InterviewQuestion currentQuestion = sessionService.getCurrentQuestion(sessionId);
        if (currentQuestion == null) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.ok(currentQuestion);
    }

    @PostMapping("/sessions/{sessionId}/answers")
    public ResponseEntity<com.hirecraft.backend.dto.InterviewQuestion> submitAnswer(
            @PathVariable Long sessionId,
            @Valid @RequestBody SubmitInterviewAnswerRequest request) {
        com.hirecraft.backend.dto.InterviewQuestion nextQuestion = sessionService.submitAnswer(sessionId, request);
        if (nextQuestion == null) {
            // Interview is over or no more questions
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.ok(nextQuestion);
    }

    @PostMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<InterviewSessionResponse> completeSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.completeSession(sessionId));
    }

    @GetMapping("/sessions/{sessionId}/summary")
    public ResponseEntity<com.hirecraft.backend.dto.response.InterviewSummaryResponse> getSessionSummary(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionSummary(sessionId));
    }
}
