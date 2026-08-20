package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.AptitudeAssessmentResponse;
import com.hirecraft.backend.dto.request.SubmitAptitudeAnswerRequest;

import java.util.List;
import java.util.UUID;

public interface AptitudeAssessmentService {

    AptitudeAssessmentResponse createAssessment(UUID userId);

    AptitudeAssessmentResponse getAssessment(UUID assessmentId);

    List<AptitudeAssessmentResponse> getUserAssessments(UUID userId);

    void submitAnswer(UUID assessmentId, SubmitAptitudeAnswerRequest request);

    AptitudeAssessmentResponse completeAssessment(UUID assessmentId);
}
