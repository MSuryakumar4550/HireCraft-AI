package com.hirecraft.backend.controller;

import com.hirecraft.backend.dto.request.SubmitAptitudeAnswerRequest;
import com.hirecraft.backend.dto.response.AptitudeAssessmentResponse;
import com.hirecraft.backend.dto.response.AptitudeQuestion;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.AptitudeAssessmentService;
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
@RequestMapping("/api/aptitude")
@RequiredArgsConstructor
public class AptitudeController {

    private final AptitudeAssessmentService assessmentService;
    private final UserRepository userRepository;

    @PostMapping("/assessments")
    public ResponseEntity<AptitudeAssessmentResponse> createAssessment(
            @AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assessmentService.createAssessment(user.getUserId()));
    }

    @GetMapping("/questions")
    public ResponseEntity<List<AptitudeQuestion>> getQuestions() {
        List<AptitudeQuestion> safeQuestions = assessmentService.getQuestions().stream().map(q -> {
            AptitudeQuestion safeQ = new AptitudeQuestion();
            safeQ.setId(q.getId());
            safeQ.setTopic(q.getTopic());
            safeQ.setQuestionText(q.getQuestionText());
            safeQ.setOptions(q.getOptions());
            return safeQ;
        }).toList();
        return ResponseEntity.ok(safeQuestions);
    }

    @GetMapping("/assessments")
    public ResponseEntity<List<AptitudeAssessmentResponse>> getMyAssessments(
            @AuthenticationPrincipal UserDetails principal) {
        User user = resolveUser(principal);
        return ResponseEntity.ok(assessmentService.getUserAssessments(user.getUserId()));
    }

    @GetMapping("/assessments/{assessmentId}")
    public ResponseEntity<AptitudeAssessmentResponse> getAssessment(
            @PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.getAssessment(assessmentId));
    }

    @PostMapping("/assessments/{assessmentId}/answers")
    public ResponseEntity<Void> submitAnswer(
            @PathVariable Long assessmentId,
            @Valid @RequestBody SubmitAptitudeAnswerRequest request) {
        assessmentService.submitAnswer(assessmentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/assessments/{assessmentId}/complete")
    public ResponseEntity<AptitudeAssessmentResponse> completeAssessment(
            @PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.completeAssessment(assessmentId));
    }

    @PostMapping("/assessments/save-score")
    public ResponseEntity<AptitudeAssessmentResponse> saveScore(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody com.hirecraft.backend.dto.request.SaveAptitudeScoreRequest request) {
        User user = resolveUser(principal);
        return ResponseEntity.ok(assessmentService.saveScore(user.getUserId(), request));
    }

    private User resolveUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
