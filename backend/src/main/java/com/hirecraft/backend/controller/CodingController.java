package com.hirecraft.backend.controller;

import com.hirecraft.backend.dto.request.CodeSubmissionRequest;
import com.hirecraft.backend.dto.request.CreateCodingAssessmentRequest;
import com.hirecraft.backend.dto.response.CodingAssessmentResponse;
import com.hirecraft.backend.dto.response.SubmissionResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.CodingAssessmentService;
import com.hirecraft.backend.service.CodingSubmissionService;
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
@RequestMapping("/api/coding")
@RequiredArgsConstructor
public class CodingController {

    private final CodingAssessmentService assessmentService;
    private final CodingSubmissionService submissionService;
    private final UserRepository userRepository;

    @PostMapping("/assessments")
    public ResponseEntity<CodingAssessmentResponse> createAssessment(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateCodingAssessmentRequest request) {
        User user = resolveUser(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assessmentService.createAssessment(user.getUserId(), request));
    }

    @GetMapping("/assessments")
    public ResponseEntity<List<CodingAssessmentResponse>> getMyAssessments(
            @AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        return ResponseEntity.ok(assessmentService.getUserAssessments(user.getUserId()));
    }

    @GetMapping("/assessments/{assessmentId}")
    public ResponseEntity<CodingAssessmentResponse> getAssessment(
            @PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.getAssessment(assessmentId));
    }

    @PostMapping("/assessments/{assessmentId}/submit")
    public ResponseEntity<SubmissionResponse> submitCode(
            @PathVariable Long assessmentId,
            @Valid @RequestBody CodeSubmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submitCode(assessmentId, request));
    }

    @GetMapping("/assessments/{assessmentId}/submissions")
    public ResponseEntity<List<SubmissionResponse>> getSubmissions(
            @PathVariable Long assessmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForAssessment(assessmentId));
    }

    private User resolveUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
