package com.hirecraft.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirecraft.backend.dto.EvaluationResult;
import com.hirecraft.backend.dto.InterviewQuestion;
import com.hirecraft.backend.entity.InterviewAnswer;
import com.hirecraft.backend.entity.InterviewSession;
import com.hirecraft.backend.service.AdaptiveFlowService;
import com.hirecraft.backend.service.QuestionBankService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdaptiveFlowServiceTest {

    @Mock
    private QuestionBankService questionBankService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AdaptiveFlowService adaptiveFlowService;

    private InterviewSession session;

    @BeforeEach
    void setUp() {
        session = new InterviewSession();
        session.setAnswers(new ArrayList<>());
        session.setRemainingTopics(new ArrayList<>(List.of("Process Management", "Memory Management")));
        session.setCurrentTopic("OS Fundamentals");
        session.setCurrentTopicQuestionCount(0);
        session.setConsecutiveWeakAnswers(0);
    }

    @Test
    void testInitialQuestion() {
        when(questionBankService.getAvailableTopics("Operating Systems"))
                .thenReturn(new ArrayList<>(List.of("OS Fundamentals", "Process Management")));

        InterviewQuestion mockQuestion = new InterviewQuestion();
        mockQuestion.setId("OS-001");
        mockQuestion.setDifficulty("MEDIUM");
        
        when(questionBankService.getNextQuestion(eq("Operating Systems"), eq("OS Fundamentals"), eq("MEDIUM"), any()))
                .thenReturn(mockQuestion);

        InterviewQuestion result = adaptiveFlowService.getNextQuestion(session, null, null);

        assertNotNull(result);
        assertEquals("OS-001", result.getId());
        assertEquals("OS Fundamentals", session.getCurrentTopic());
        assertEquals(0, session.getCurrentTopicQuestionCount());
        assertEquals(0, session.getConsecutiveWeakAnswers());
    }

    @Test
    void testThresholdStepUp() {
        InterviewAnswer lastAnswer = new InterviewAnswer();
        lastAnswer.setDifficultyLevel("MEDIUM");
        lastAnswer.setQuestionId("OS-001");
        session.getAnswers().add(lastAnswer);

        EvaluationResult lastEvaluation = new EvaluationResult();
        lastEvaluation.setScore(BigDecimal.valueOf(8.5)); // Strong score

        InterviewQuestion mockNextQuestion = new InterviewQuestion();
        mockNextQuestion.setId("OS-002");
        mockNextQuestion.setDifficulty("HARD");

        when(questionBankService.getNextQuestion(eq("Operating Systems"), eq("OS Fundamentals"), eq("HARD"), any()))
                .thenReturn(mockNextQuestion);

        InterviewQuestion result = adaptiveFlowService.getNextQuestion(session, lastAnswer, lastEvaluation);

        assertNotNull(result);
        assertEquals("HARD", result.getDifficulty());
        assertEquals(1, session.getCurrentTopicQuestionCount());
        assertEquals(0, session.getConsecutiveWeakAnswers());
    }

    @Test
    void testThresholdStepDownAndPivotRule() {
        // First weak answer
        InterviewAnswer answer1 = new InterviewAnswer();
        answer1.setDifficultyLevel("MEDIUM");
        answer1.setQuestionId("OS-001");
        session.getAnswers().add(answer1);

        EvaluationResult eval1 = new EvaluationResult();
        eval1.setScore(BigDecimal.valueOf(3.0)); // Weak score
        
        InterviewQuestion mockNextQ1 = new InterviewQuestion();
        mockNextQ1.setId("OS-002");
        mockNextQ1.setDifficulty("EASY");
        
        when(questionBankService.getNextQuestion(eq("Operating Systems"), eq("OS Fundamentals"), eq("EASY"), any()))
                .thenReturn(mockNextQ1);

        InterviewQuestion result1 = adaptiveFlowService.getNextQuestion(session, answer1, eval1);
        assertEquals("EASY", result1.getDifficulty());
        assertEquals(1, session.getConsecutiveWeakAnswers());
        assertEquals(1, session.getCurrentTopicQuestionCount());
        assertEquals("OS Fundamentals", session.getCurrentTopic());

        // Second weak answer triggers pivot
        InterviewAnswer answer2 = new InterviewAnswer();
        answer2.setDifficultyLevel("EASY");
        answer2.setQuestionId("OS-002");
        session.getAnswers().add(answer2);

        EvaluationResult eval2 = new EvaluationResult();
        eval2.setScore(BigDecimal.valueOf(2.5)); // Weak score again

        InterviewQuestion mockNextQ2 = new InterviewQuestion();
        mockNextQ2.setId("OS-003");
        mockNextQ2.setDifficulty("MEDIUM");

        // Expect it to pivot to "Process Management" with "MEDIUM" difficulty
        when(questionBankService.getNextQuestion(eq("Operating Systems"), eq("Process Management"), eq("MEDIUM"), any()))
                .thenReturn(mockNextQ2);

        InterviewQuestion result2 = adaptiveFlowService.getNextQuestion(session, answer2, eval2);

        assertNotNull(result2);
        assertEquals("Process Management", session.getCurrentTopic()); // Pivot happened
        assertEquals(0, session.getConsecutiveWeakAnswers()); // Reset
        assertEquals(0, session.getCurrentTopicQuestionCount()); // Reset
    }

    @Test
    void testDepthCapRule() {
        session.setCurrentTopicQuestionCount(3); // 3 questions already asked

        InterviewAnswer lastAnswer = new InterviewAnswer();
        lastAnswer.setDifficultyLevel("MEDIUM");
        lastAnswer.setQuestionId("OS-004");
        session.getAnswers().add(lastAnswer);

        EvaluationResult eval = new EvaluationResult();
        eval.setScore(BigDecimal.valueOf(5.0)); // Borderline, normally stays in topic

        InterviewQuestion mockNextQ = new InterviewQuestion();
        mockNextQ.setId("OS-005");
        mockNextQ.setDifficulty("MEDIUM");

        // Expect it to pivot to "Process Management" because of depth cap (4)
        when(questionBankService.getNextQuestion(eq("Operating Systems"), eq("Process Management"), eq("MEDIUM"), any()))
                .thenReturn(mockNextQ);

        InterviewQuestion result = adaptiveFlowService.getNextQuestion(session, lastAnswer, eval);

        assertNotNull(result);
        assertEquals("Process Management", session.getCurrentTopic()); // Pivot happened
        assertEquals(0, session.getCurrentTopicQuestionCount());
    }
}
