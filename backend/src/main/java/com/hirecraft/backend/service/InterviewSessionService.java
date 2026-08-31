package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.CreateInterviewSessionRequest;
import com.hirecraft.backend.dto.request.SubmitInterviewAnswerRequest;
import com.hirecraft.backend.dto.response.InterviewSessionResponse;

import java.util.List;


public interface InterviewSessionService {

    InterviewSessionResponse createSession(Long userId, CreateInterviewSessionRequest request);

    InterviewSessionResponse getSession(Long sessionId);

    List<InterviewSessionResponse> getUserSessions(Long userId);

    void submitAnswer(Long sessionId, SubmitInterviewAnswerRequest request);

    InterviewSessionResponse completeSession(Long sessionId);
}
