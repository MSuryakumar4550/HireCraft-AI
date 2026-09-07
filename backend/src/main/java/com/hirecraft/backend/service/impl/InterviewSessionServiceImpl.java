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
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class InterviewSessionServiceImpl implements InterviewSessionService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final com.hirecraft.backend.repository.VirtualInterviewRepository virtualInterviewRepository;
    private final com.hirecraft.backend.service.AiMemoryService aiMemoryService;
    private final com.hirecraft.backend.service.QuestionBankService questionBankService;
    private final com.hirecraft.backend.service.InterviewEvaluatorService interviewEvaluatorService;
    private final com.hirecraft.backend.service.AdaptiveFlowService adaptiveFlowService;
    private final com.hirecraft.backend.service.ReadinessService readinessService;

    @Override
    @Transactional
    public InterviewSessionResponse createSession(Long userId, CreateInterviewSessionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        com.hirecraft.backend.entity.VirtualInterview virtualInterview = virtualInterviewRepository
                .findByUserUserIdAndStatus(userId, com.hirecraft.backend.enums.VirtualInterviewStatus.IN_PROGRESS)
                .stream().findFirst()
                .orElseGet(() -> virtualInterviewRepository.save(com.hirecraft.backend.entity.VirtualInterview.builder()
                        .user(user)
                        .status(com.hirecraft.backend.enums.VirtualInterviewStatus.IN_PROGRESS)
                        .currentStage("TECHNICAL")
                        .build()));

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .virtualInterview(virtualInterview)
                .interviewType(request.getInterviewType())
                .subject(request.getSubject())
                .status(InterviewStatus.NOT_STARTED)
                .transcriptAvailable(false)
                .sessionIdentifier(java.util.UUID.randomUUID().toString())
                .build();

        sessionRepository.save(session);
        return toResponse(session);
    }

    @Override
    @Transactional
    public InterviewSessionResponse startSession(Long sessionId) {
        InterviewSession session = findById(sessionId);
        if (session.getStatus() == InterviewStatus.NOT_STARTED) {
            session.setStatus(InterviewStatus.IN_PROGRESS);
            session.setStartedAt(java.time.Instant.now());
            sessionRepository.save(session);
        }
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
    public com.hirecraft.backend.dto.InterviewQuestion getCurrentQuestion(Long sessionId) {
        InterviewSession session = findById(sessionId);
        if (session.getStatus() == InterviewStatus.COMPLETED) {
            return null;
        }

        List<InterviewAnswer> answers = answerRepository
                .findByInterviewSessionInterviewSessionIdOrderByQuestionNo(sessionId);
        
        List<String> askedIds = new ArrayList<>();
        if (answers != null) {
            for (InterviewAnswer a : answers) {
                if (a != null && a.getQuestionId() != null) {
                    askedIds.add(a.getQuestionId());
                }
            }
        }

        if (answers == null || answers.isEmpty()) {
            // First question of the session
            if (session.getStatus() == InterviewStatus.NOT_STARTED) {
                session.setStatus(InterviewStatus.IN_PROGRESS);
                session.setStartedAt(java.time.Instant.now());
            }
            com.hirecraft.backend.dto.InterviewQuestion firstQ = adaptiveFlowService.getNextQuestion(session, null, null, askedIds);
            sessionRepository.save(session);
            return firstQ;
        }

        InterviewAnswer lastAnswer = answers.get(answers.size() - 1);
        com.hirecraft.backend.dto.InterviewQuestion nextQ = adaptiveFlowService.getNextQuestion(session, lastAnswer, null, askedIds);
        sessionRepository.save(session);
        return nextQ;
    }

    @Override
    @Transactional
    public com.hirecraft.backend.dto.InterviewQuestion submitAnswer(Long sessionId, SubmitInterviewAnswerRequest request) {
        InterviewSession session = findById(sessionId);
        if (session.getStatus() == InterviewStatus.COMPLETED) {
            throw new BadRequestException("Cannot submit answer to a completed session");
        }

        if (session.getStatus() == InterviewStatus.NOT_STARTED) {
            session.setStatus(InterviewStatus.IN_PROGRESS);
            sessionRepository.save(session);
        }

        com.hirecraft.backend.dto.InterviewQuestion askedQuestion = null;
        if (request.getQuestionId() != null && !request.getQuestionId().isEmpty()) {
             askedQuestion = questionBankService.getQuestionById(request.getQuestionId());
        }

        String actualAnswerText = request.getTranscript() != null ? request.getTranscript() : request.getAnswerText();
        
        com.hirecraft.backend.dto.EvaluationResult evalResult = null;
        if (askedQuestion != null && actualAnswerText != null && !actualAnswerText.trim().isEmpty()) {
             evalResult = interviewEvaluatorService.evaluateAnswer(actualAnswerText, askedQuestion);
        }

        InterviewAnswer answer = InterviewAnswer.builder()
                .interviewSession(session)
                .questionNo(request.getQuestionNo())
                .questionId(request.getQuestionId())
                .answerText(request.getAnswerText())
                .transcript(request.getTranscript())
                .expectedTopic(askedQuestion != null ? askedQuestion.getTopic() : null)
                .difficultyLevel(askedQuestion != null ? askedQuestion.getDifficulty() : null)
                .evaluationScore(evalResult != null ? evalResult.getScore() : null)
                .evaluationFeedback(evalResult != null ? evalResult.getFeedback() : null)
                .responseDurationSeconds(request.getResponseDurationSeconds() != null
                        ? BigDecimal.valueOf(request.getResponseDurationSeconds()) : null)
                .responseLatencySeconds(request.getResponseLatencySeconds() != null
                        ? BigDecimal.valueOf(request.getResponseLatencySeconds()) : null)
                .answeredAt(java.time.Instant.now())
                .build();

        answer = answerRepository.save(answer);

        if (evalResult != null) {
            try {
                Long targetUserId = (session.getUser() != null) ? session.getUser().getUserId() : null;
                if (targetUserId != null) {
                    int scoreValue = (evalResult.getScore() != null)
                            ? evalResult.getScore().multiply(BigDecimal.TEN).intValue()
                            : 50;
                    String topicName = (askedQuestion != null && askedQuestion.getTopic() != null)
                            ? askedQuestion.getTopic()
                            : "General";

                    aiMemoryService.updateMemoryGraph(
                            targetUserId,
                            com.hirecraft.backend.enums.MemoryCategory.TECHNICAL,
                            com.hirecraft.backend.enums.MemoryType.SKILL,
                            "Virtual Interview Answer: " + topicName,
                            scoreValue,
                            evalResult.getFeedback()
                    );
                }
            } catch (Exception e) {
                log.warn("Could not update AI memory graph: {}", e.getMessage());
            }
        }

        // Fetch existing asked question IDs from DB directly
        List<InterviewAnswer> allAnswers = answerRepository
                .findByInterviewSessionInterviewSessionIdOrderByQuestionNo(sessionId);
        List<String> askedQuestionIds = new ArrayList<>();
        if (allAnswers != null) {
            for (InterviewAnswer a : allAnswers) {
                if (a != null && a.getQuestionId() != null) {
                    askedQuestionIds.add(a.getQuestionId());
                }
            }
        }
        if (request.getQuestionId() != null && !askedQuestionIds.contains(request.getQuestionId())) {
            askedQuestionIds.add(request.getQuestionId());
        }

        // Get the next question using Adaptive Flow
        com.hirecraft.backend.dto.InterviewQuestion nextQuestion = adaptiveFlowService.getNextQuestion(session, answer, evalResult, askedQuestionIds);
        
        sessionRepository.save(session); // Save updated adaptive flow tracking fields
        
        if (nextQuestion == null) {
            // End of interview
            completeSession(sessionId);
        }
        
        return nextQuestion;
    }

    @Override
    @Transactional
    public InterviewSessionResponse completeSession(Long sessionId) {
        InterviewSession session = findById(sessionId);
        if (session.getStatus() == InterviewStatus.COMPLETED) {
            return toResponse(session);
        }

        List<InterviewAnswer> answers = answerRepository
                .findByInterviewSessionInterviewSessionIdOrderByQuestionNo(sessionId);

        BigDecimal totalScore = BigDecimal.ZERO;
        int count = 0;
        for (InterviewAnswer a : answers) {
            if (a.getEvaluationScore() != null) {
                totalScore = totalScore.add(a.getEvaluationScore());
                count++;
            }
        }

        BigDecimal averageScore = count > 0 
                ? totalScore.divide(BigDecimal.valueOf(count), 1, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        session.setStatus(InterviewStatus.COMPLETED);
        session.setTotalQuestions(answers.size());
        session.setTotalScore(averageScore.multiply(BigDecimal.TEN)); // 0-100 scale
        session.setTranscriptAvailable(true);
        session.setEndedAt(java.time.Instant.now());
        sessionRepository.save(session);

        if (session.getVirtualInterview() != null) {
            try {
                com.hirecraft.backend.entity.VirtualInterview vi = session.getVirtualInterview();
                vi.setFinalScore(session.getTotalScore());
                vi.setStatus(com.hirecraft.backend.enums.VirtualInterviewStatus.COMPLETED);
                virtualInterviewRepository.save(vi);
            } catch (Exception e) {
                log.warn("Could not sync VirtualInterview status: {}", e.getMessage());
            }
        }

        if (session.getUser() != null) {
            try {
                readinessService.calculateAndSaveReadiness(session.getUser().getUserId());
            } catch (Exception e) {
                log.warn("Could not sync readiness snapshot: {}", e.getMessage());
            }

            try {
                int finalScoreVal = session.getTotalScore() != null ? session.getTotalScore().intValue() : 0;
                aiMemoryService.updateMemoryGraph(
                        session.getUser().getUserId(),
                        com.hirecraft.backend.enums.MemoryCategory.TECHNICAL,
                        finalScoreVal >= 70 ? com.hirecraft.backend.enums.MemoryType.STRENGTH : com.hirecraft.backend.enums.MemoryType.WEAKNESS,
                        session.getSubject() != null ? session.getSubject() + " Overall" : "Technical Interview Overall",
                        finalScoreVal,
                        "Completed mock interview in " + session.getSubject() + " with score " + finalScoreVal + "/100."
                );
            } catch (Exception e) {
                log.warn("Could not update AI memory on session completion: {}", e.getMessage());
            }
        }

        return toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public com.hirecraft.backend.dto.response.InterviewSummaryResponse getSessionSummary(Long sessionId) {
        InterviewSession session = findById(sessionId);
        List<InterviewAnswer> answers = answerRepository
                .findByInterviewSessionInterviewSessionIdOrderByQuestionNo(sessionId);

        BigDecimal totalScore = BigDecimal.ZERO;
        int scoredCount = 0;
        List<String> strengths = new java.util.ArrayList<>();
        List<String> areasForImprovement = new java.util.ArrayList<>();
        List<com.hirecraft.backend.dto.response.InterviewSummaryResponse.QuestionEvaluationSummary> evalSummaries = new java.util.ArrayList<>();

        for (InterviewAnswer a : answers) {
            com.hirecraft.backend.dto.InterviewQuestion q = null;
            if (a.getQuestionId() != null) {
                q = questionBankService.getQuestionById(a.getQuestionId());
            }

            BigDecimal score = a.getEvaluationScore() != null ? a.getEvaluationScore() : BigDecimal.valueOf(5.0);
            totalScore = totalScore.add(score);
            scoredCount++;

            String topic = a.getExpectedTopic() != null ? a.getExpectedTopic() : (q != null ? q.getTopic() : "General");
            if (score.compareTo(BigDecimal.valueOf(7.0)) >= 0) {
                strengths.add("Strong technical depth in " + topic);
            } else if (score.compareTo(BigDecimal.valueOf(4.5)) < 0) {
                areasForImprovement.add("Needs foundational review in " + topic);
            }

            evalSummaries.add(com.hirecraft.backend.dto.response.InterviewSummaryResponse.QuestionEvaluationSummary.builder()
                    .answerId(a.getInterviewAnswerId())
                    .questionNo(a.getQuestionNo())
                    .questionId(a.getQuestionId())
                    .questionText(q != null ? q.getQuestion() : "Question #" + a.getQuestionNo())
                    .topic(topic)
                    .difficultyLevel(a.getDifficultyLevel())
                    .transcript(a.getTranscript() != null ? a.getTranscript() : a.getAnswerText())
                    .score(score)
                    .feedback((a.getEvaluationFeedback() != null && !a.getEvaluationFeedback().trim().isEmpty())
                            ? a.getEvaluationFeedback()
                            : (score.compareTo(BigDecimal.valueOf(7.0)) >= 0 ? "Well-structured answer addressing key criteria." : "Some core concepts were missing from the explanation."))
                    .build());
        }

        BigDecimal averageScore = scoredCount > 0 
                ? totalScore.divide(BigDecimal.valueOf(scoredCount), 1, java.math.RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;

        String summaryFeedback = averageScore.compareTo(BigDecimal.valueOf(7.0)) >= 0
                ? "Excellent performance across technical interview topics. Clear verbal communication and good conceptual grounding."
                : (averageScore.compareTo(BigDecimal.valueOf(5.0)) >= 0
                ? "Decent foundational clarity, but deeper technical rigor is recommended on weaker topics before campus interviews."
                : "Foundational concepts require focused revision and practice before placement interviews.");

        if (strengths.isEmpty()) {
            strengths.add("Completed technical questions and engaged with adaptive prompts.");
        }
        if (areasForImprovement.isEmpty()) {
            areasForImprovement.add("Continue practicing complex architecture trade-offs.");
        }

        return com.hirecraft.backend.dto.response.InterviewSummaryResponse.builder()
                .sessionId(session.getInterviewSessionId())
                .candidateId(session.getUser().getUserId())
                .candidateName(session.getUser().getFullName())
                .interviewType(session.getInterviewType().name())
                .subject(session.getSubject())
                .status(session.getStatus().name())
                .overallScore(averageScore.multiply(BigDecimal.TEN)) // 0-100 scale for UI
                .summaryFeedback(summaryFeedback)
                .overallStrengths(strengths.stream().distinct().toList())
                .areasForImprovement(areasForImprovement.stream().distinct().toList())
                .questionEvaluations(evalSummaries)
                .createdAt(session.getCreatedAt())
                .build();
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
                .currentTopic(s.getCurrentTopic())
                .subject(s.getSubject())
                .remainingTopics(s.getRemainingTopics())
                .consecutiveWeakAnswers(s.getConsecutiveWeakAnswers())
                .currentTopicQuestionCount(s.getCurrentTopicQuestionCount())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
