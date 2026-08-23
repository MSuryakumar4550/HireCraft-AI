package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.CreateInterviewSessionRequest;
import com.hirecraft.backend.dto.request.SubmitInterviewAnswerRequest;
import com.hirecraft.backend.dto.response.InterviewSessionResponse;

import java.util.List;
import java.util.UUID;

public interface InterviewSessionService {

    InterviewSessionResponse createSession(UUID userId, CreateInterviewSessionRequest request);

    InterviewSessionResponse getSession(UUID sessionId);

    List<InterviewSessionResponse> getUserSessions(UUID userId);

    void submitAnswer(UUID sessionId, SubmitInterviewAnswerRequest request);

    InterviewSessionResponse completeSession(UUID sessionId);
}
