package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.CreateCodingAssessmentRequest;
import com.hirecraft.backend.dto.response.CodingAssessmentResponse;

import java.util.List;


public interface CodingAssessmentService {

    CodingAssessmentResponse createAssessment(Long userId, CreateCodingAssessmentRequest request);

    CodingAssessmentResponse getAssessment(Long assessmentId);

    List<CodingAssessmentResponse> getUserAssessments(Long userId);

    CodingAssessmentResponse completeAssessment(Long assessmentId);
}
