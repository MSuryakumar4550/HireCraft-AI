package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.request.CreateInterviewSessionRequest;
import com.hirecraft.backend.dto.request.SubmitInterviewAnswerRequest;
import com.hirecraft.backend.dto.response.InterviewSessionResponse;
import com.hirecraft.backend.entity.InterviewAnswer;
import com.hirecraft.backend.entity.InterviewSession;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.InterviewStatus;
import com.hirecraft.backend.exception.BadRequestException;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.InterviewAnswerRepository;
import com.hirecraft.backend.repository.InterviewSessionRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.InterviewSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;


@Service
@RequiredArgsConstructor
public class InterviewSessionServiceImpl implements InterviewSessionService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final com.hirecraft.backend.service.AiMemoryService aiMemoryService;

    @Override
    @Transactional
    public InterviewSessionResponse createSession(Long userId, CreateInterviewSessionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .interviewType(request.getInterviewType())
                .status(InterviewStatus.NOT_STARTED)
                .transcriptAvailable(false)
                .sessionIdentifier(java.util.UUID.randomUUID().toString())
                .build();

        sessionRepository.save(session);
        return toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewSessionResponse getSession(Long sessionId) {
        return toResponse(findById(sessionId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewSessionResponse> getUserSessions(Long userId) {
        return sessionRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void submitAnswer(Long sessionId, SubmitInterviewAnswerRequest request) {
        InterviewSession session = findById(sessionId);
        if (session.getStatus() == InterviewStatus.COMPLETED) {
            throw new BadRequestException("Cannot submit answer to a completed session");
        }

        if (session.getStatus() == InterviewStatus.NOT_STARTED) {
            session.setStatus(InterviewStatus.IN_PROGRESS);
            sessionRepository.save(session);
        }

        InterviewAnswer answer = InterviewAnswer.builder()
                .interviewSession(session)
                .questionNo(request.getQuestionNo())
                .answerText(request.getAnswerText())
                .transcript(request.getTranscript())
                .responseDurationSeconds(request.getResponseDurationSeconds() != null
                        ? BigDecimal.valueOf(request.getResponseDurationSeconds()) : null)
                .responseLatencySeconds(request.getResponseLatencySeconds() != null
                        ? BigDecimal.valueOf(request.getResponseLatencySeconds()) : null)
                .build();

        answerRepository.save(answer);

        // Dynamically update AI memory for each voice/behavioral question
        // Assume score 50 for behavioral by default (can be updated by actual AI evaluation layer)
        aiMemoryService.updateMemoryGraph(
                session.getUser().getUserId(),
                com.hirecraft.backend.enums.MemoryCategory.BEHAVIORAL,
                com.hirecraft.backend.enums.MemoryType.BEHAVIOR,
                "Behavioral Question " + request.getQuestionNo(),
                50,
                "Answer submitted: " + (request.getAnswerText() != null ? request.getAnswerText() : "Recorded audio")
        );
    }

    @Override
    @Transactional
    public InterviewSessionResponse completeSession(Long sessionId) {
        InterviewSession session = findById(sessionId);
        if (session.getStatus() == InterviewStatus.COMPLETED) {
            throw new BadRequestException("Session is already completed");
        }

        long answerCount = answerRepository
                .findByInterviewSessionInterviewSessionIdOrderByQuestionNo(sessionId).size();

        session.setStatus(InterviewStatus.COMPLETED);
        session.setTotalQuestions((int) answerCount);
        session.setTranscriptAvailable(true);
        sessionRepository.save(session);

        return toResponse(session);
    }

    private InterviewSession findById(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", id));
    }

    private InterviewSessionResponse toResponse(InterviewSession s) {
        return InterviewSessionResponse.builder()
                .interviewSessionId(s.getInterviewSessionId())
                .interviewType(s.getInterviewType())
                .status(s.getStatus())
                .sessionIdentifier(s.getSessionIdentifier())
                .transcriptAvailable(s.getTranscriptAvailable())
                .totalQuestions(s.getTotalQuestions())
                .totalScore(s.getTotalScore())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
