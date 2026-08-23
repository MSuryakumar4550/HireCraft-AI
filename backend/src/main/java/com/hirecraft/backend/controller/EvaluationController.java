package com.hirecraft.backend.controller;

import com.hirecraft.backend.dto.response.EvaluationResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<EvaluationResponse>> getMyEvaluations(
            @AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        return ResponseEntity.ok(evaluationService.getUserEvaluations(user.getUserId()));
    }

    @GetMapping("/{evaluationId}")
    public ResponseEntity<EvaluationResponse> getEvaluation(@PathVariable UUID evaluationId) {
        return ResponseEntity.ok(evaluationService.getEvaluation(evaluationId));
    }

    private User resolveUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
