package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.CreateCodingAssessmentRequest;
import com.hirecraft.backend.dto.response.CodingAssessmentResponse;

import java.util.List;
import java.util.UUID;


public interface CodingAssessmentService {

    CodingAssessmentResponse createAssessment(Long userId, CreateCodingAssessmentRequest request);

    CodingAssessmentResponse getAssessment(UUID assessmentId);

    List<CodingAssessmentResponse> getUserAssessments(Long userId);

    CodingAssessmentResponse completeAssessment(UUID assessmentId);
}
