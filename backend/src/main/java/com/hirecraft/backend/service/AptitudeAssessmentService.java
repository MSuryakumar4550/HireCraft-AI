package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.AptitudeAssessmentResponse;
import com.hirecraft.backend.dto.request.SubmitAptitudeAnswerRequest;

import java.util.List;


public interface AptitudeAssessmentService {

    AptitudeAssessmentResponse createAssessment(Long userId);

    AptitudeAssessmentResponse getAssessment(Long assessmentId);

    List<AptitudeAssessmentResponse> getUserAssessments(Long userId);

    void submitAnswer(Long assessmentId, SubmitAptitudeAnswerRequest request);

    AptitudeAssessmentResponse completeAssessment(Long assessmentId);

    AptitudeAssessmentResponse saveScore(Long userId, com.hirecraft.backend.dto.request.SaveAptitudeScoreRequest request);

    List<com.hirecraft.backend.dto.response.AptitudeQuestion> getQuestions();
}
