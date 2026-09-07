package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.InterviewQuestion;
import com.hirecraft.backend.dto.request.CreateInterviewSessionRequest;
import com.hirecraft.backend.dto.request.SubmitInterviewAnswerRequest;
import com.hirecraft.backend.dto.response.InterviewSessionResponse;
import com.hirecraft.backend.dto.response.InterviewSummaryResponse;

import java.util.List;


public interface InterviewSessionService {

    InterviewSessionResponse createSession(Long userId, CreateInterviewSessionRequest request);

    InterviewSessionResponse startSession(Long sessionId);

    InterviewSessionResponse getSession(Long sessionId);

    List<InterviewSessionResponse> getUserSessions(Long userId);

    InterviewQuestion getCurrentQuestion(Long sessionId);

    InterviewQuestion submitAnswer(Long sessionId, SubmitInterviewAnswerRequest request);

    InterviewSessionResponse completeSession(Long sessionId);

    InterviewSummaryResponse getSessionSummary(Long sessionId);
}
