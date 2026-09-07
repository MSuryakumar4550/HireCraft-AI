package com.hirecraft.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirecraft.backend.dto.EvaluationResult;
import com.hirecraft.backend.dto.InterviewQuestion;
import com.hirecraft.backend.entity.InterviewAnswer;
import com.hirecraft.backend.entity.InterviewSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdaptiveFlowService {

    private final QuestionBankService questionBankService;
    private final ObjectMapper objectMapper;

    private static final int MAX_QUESTIONS_PER_TOPIC = 4;
    private static final int MAX_CONSECUTIVE_WEAK = 2;

    public InterviewQuestion getNextQuestion(InterviewSession session, InterviewAnswer lastAnswer, EvaluationResult lastEvaluation) {
        return getNextQuestion(session, lastAnswer, lastEvaluation, null);
    }

    public InterviewQuestion getNextQuestion(InterviewSession session, InterviewAnswer lastAnswer, EvaluationResult lastEvaluation, List<String> explicitAskedQuestionIds) {
        List<String> askedQuestionIds = new ArrayList<>();
        if (explicitAskedQuestionIds != null && !explicitAskedQuestionIds.isEmpty()) {
            askedQuestionIds.addAll(explicitAskedQuestionIds);
        } else if (session != null && session.getAnswers() != null) {
            try {
                for (InterviewAnswer a : session.getAnswers()) {
                    if (a != null && a.getQuestionId() != null) {
                        askedQuestionIds.add(a.getQuestionId());
                    }
                }
            } catch (Exception e) {
                log.warn("Could not lazily read session answers: {}", e.getMessage());
            }
        }
        if (lastAnswer != null && lastAnswer.getQuestionId() != null && !askedQuestionIds.contains(lastAnswer.getQuestionId())) {
            askedQuestionIds.add(lastAnswer.getQuestionId());
        }
        
        if (lastAnswer == null || lastEvaluation == null) {
            // First question of the interview
            return initializeFirstQuestion(session, askedQuestionIds);
        }

        // Process the last evaluation
        BigDecimal score = lastEvaluation.getScore();
        String currentTopic = session.getCurrentTopic();
        String currentDifficulty = lastAnswer.getDifficultyLevel() != null ? lastAnswer.getDifficultyLevel() : "MEDIUM";
        
        String nextTopic = currentTopic;
        String nextDifficulty = currentDifficulty;

        int currentCount = session.getCurrentTopicQuestionCount() != null ? session.getCurrentTopicQuestionCount() : 0;
        int weakCount = session.getConsecutiveWeakAnswers() != null ? session.getConsecutiveWeakAnswers() : 0;

        currentCount++;
        session.setCurrentTopicQuestionCount(currentCount);

        boolean needsPivot = false;

        // 1. Threshold Logic
        if (score.compareTo(BigDecimal.valueOf(7.0)) >= 0) {
            // Strong
            weakCount = 0;
            nextDifficulty = stepUp(currentDifficulty);
        } else if (score.compareTo(BigDecimal.valueOf(4.0)) >= 0) {
            // Borderline
            weakCount = 0;
            // Keep same difficulty
        } else {
            // Weak
            weakCount++;
            nextDifficulty = stepDown(currentDifficulty);
        }
        
        session.setConsecutiveWeakAnswers(weakCount);

        // 2. Pivot Rules
        if (weakCount >= MAX_CONSECUTIVE_WEAK) {
            log.info("Pivot Rule triggered: {} consecutive weak answers in topic {}", weakCount, currentTopic);
            needsPivot = true;
        } else if (currentCount >= MAX_QUESTIONS_PER_TOPIC) {
            log.info("Depth Cap triggered: {} questions asked in topic {}", currentCount, currentTopic);
            needsPivot = true;
        }

        if (needsPivot) {
            nextTopic = pivotToNextTopic(session);
            if (nextTopic == null) {
                log.info("No remaining topics. Interview complete.");
                return null; // Signals end of interview
            }
            nextDifficulty = "MEDIUM"; // Reset difficulty for new topic
        }

        // 3. Fetch Question
        String subject = resolveSubject(session);

        InterviewQuestion nextQ = questionBankService.getNextQuestion(subject, nextTopic, nextDifficulty, askedQuestionIds);
        
        if (nextQ == null) {
            // Fallback: If we ran out of questions for this difficulty, force pivot
            log.warn("Ran out of questions for Subject: {}, Topic: {}, Difficulty: {}. Forcing pivot.", subject, nextTopic, nextDifficulty);
            nextTopic = pivotToNextTopic(session);
            if (nextTopic == null) return null;
            nextDifficulty = "MEDIUM";
            nextQ = questionBankService.getNextQuestion(subject, nextTopic, nextDifficulty, askedQuestionIds);
        }

        return nextQ;
    }

    private InterviewQuestion initializeFirstQuestion(InterviewSession session, List<String> askedQuestionIds) {
        String subject = resolveSubject(session);
        List<String> availableTopics = questionBankService.getAvailableTopics(subject);
        
        if (availableTopics.isEmpty()) return null;

        String firstTopic = availableTopics.get(0);
        
        availableTopics.remove(0);
        setRemainingTopics(session, availableTopics);
        
        session.setCurrentTopic(firstTopic);
        session.setConsecutiveWeakAnswers(0);
        session.setCurrentTopicQuestionCount(0);

        InterviewQuestion q = questionBankService.getNextQuestion(subject, firstTopic, "MEDIUM", askedQuestionIds);
        while (q == null && !availableTopics.isEmpty()) {
            String nextTopic = availableTopics.remove(0);
            setRemainingTopics(session, availableTopics);
            session.setCurrentTopic(nextTopic);
            q = questionBankService.getNextQuestion(subject, nextTopic, "MEDIUM", askedQuestionIds);
        }
        return q;
    }

    private String resolveSubject(InterviewSession session) {
        String sub = session.getSubject();
        if (sub == null || sub.trim().isEmpty()) {
            return "Operating Systems";
        }
        return questionBankService.normalizeSubject(sub);
    }

    private String pivotToNextTopic(InterviewSession session) {
        List<String> remaining = getRemainingTopics(session);
        if (remaining == null || remaining.isEmpty()) {
            return null;
        }
        String nextTopic = remaining.remove(0);
        setRemainingTopics(session, remaining);
        
        session.setCurrentTopic(nextTopic);
        session.setConsecutiveWeakAnswers(0);
        session.setCurrentTopicQuestionCount(0);
        
        return nextTopic;
    }

    private String stepUp(String difficulty) {
        if ("EASY".equalsIgnoreCase(difficulty)) return "MEDIUM";
        return "HARD";
    }

    private String stepDown(String difficulty) {
        if ("HARD".equalsIgnoreCase(difficulty)) return "MEDIUM";
        return "EASY";
    }

    private List<String> getRemainingTopics(InterviewSession session) {
        if (session.getRemainingTopics() == null) return new ArrayList<>();
        return new ArrayList<>(session.getRemainingTopics());
    }

    private void setRemainingTopics(InterviewSession session, List<String> topics) {
        session.setRemainingTopics(new ArrayList<>(topics));
    }
}
