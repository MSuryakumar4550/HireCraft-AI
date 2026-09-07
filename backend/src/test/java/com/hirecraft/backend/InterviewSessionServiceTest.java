package com.hirecraft.backend;

import com.hirecraft.backend.dto.EvaluationResult;
import com.hirecraft.backend.dto.InterviewQuestion;
import com.hirecraft.backend.dto.request.CreateInterviewSessionRequest;
import com.hirecraft.backend.dto.request.SubmitInterviewAnswerRequest;
import com.hirecraft.backend.dto.response.InterviewSessionResponse;
import com.hirecraft.backend.entity.AiMemoryItem;
import com.hirecraft.backend.entity.InterviewAnswer;
import com.hirecraft.backend.entity.InterviewSession;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.entity.VirtualInterview;
import com.hirecraft.backend.enums.InterviewStatus;
import com.hirecraft.backend.enums.InterviewType;
import com.hirecraft.backend.enums.MemoryCategory;
import com.hirecraft.backend.enums.MemoryType;
import com.hirecraft.backend.repository.AiMemoryItemRepository;
import com.hirecraft.backend.repository.InterviewAnswerRepository;
import com.hirecraft.backend.repository.InterviewSessionRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.repository.VirtualInterviewRepository;
import com.hirecraft.backend.service.AdaptiveFlowService;
import com.hirecraft.backend.service.AiMemoryService;
import com.hirecraft.backend.service.InterviewEvaluatorService;
import com.hirecraft.backend.service.QuestionBankService;
import com.hirecraft.backend.service.impl.AiMemoryServiceImpl;
import com.hirecraft.backend.service.impl.InterviewSessionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InterviewSessionServiceTest {

    @Mock
    private InterviewSessionRepository sessionRepository;

    @Mock
    private InterviewAnswerRepository answerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VirtualInterviewRepository virtualInterviewRepository;

    @Mock
    private AiMemoryService aiMemoryService;

    @Mock
    private QuestionBankService questionBankService;

    @Mock
    private InterviewEvaluatorService interviewEvaluatorService;

    @Mock
    private AdaptiveFlowService adaptiveFlowService;

    @Mock
    private com.hirecraft.backend.service.ReadinessService readinessService;

    @InjectMocks
    private InterviewSessionServiceImpl sessionService;

    private User testUser;
    private InterviewSession session;
    private InterviewQuestion question1;
    private InterviewQuestion question2;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .userId(1L)
                .email("suryakumar@hirecraft.ai")
                .fullName("Suryakumar")
                .build();

        session = InterviewSession.builder()
                .interviewSessionId(100L)
                .user(testUser)
                .subject("Computer Networks")
                .interviewType(InterviewType.TECHNICAL)
                .status(InterviewStatus.IN_PROGRESS)
                .currentTopic("Network Security")
                .currentTopicQuestionCount(1)
                .consecutiveWeakAnswers(0)
                .answers(new ArrayList<>())
                .build();

        question1 = new InterviewQuestion();
        question1.setId("CN-250");
        question1.setQuestion("How does Zero Trust Network Access (ZTNA) fundamentally differ from traditional perimeter-based VPN architectures?");
        question1.setTopic("Network Security");
        question1.setDifficulty("HARD");
        question1.setConcepts(List.of("Zero Trust Architecture", "ZTNA", "micro-segmentation", "least privilege"));
        question1.setCriteria(List.of("critiques perimeter model", "states Never Trust Always Verify"));

        question2 = new InterviewQuestion();
        question2.setId("CN-249");
        question2.setQuestion("What is DNS rebinding and how do modern browsers mitigate it?");
        question2.setTopic("Network Security");
        question2.setDifficulty("HARD");
    }

    @Test
    @DisplayName("Test Full Interview Flow: Ask Question -> Submit Answer -> AI Memory Update -> Next Question")
    void testSubmitAnswerAndAiMemoryUpdate() {
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
        when(questionBankService.getQuestionById("CN-250")).thenReturn(question1);

        // Simulate AI Evaluator scoring
        EvaluationResult evalResult = new EvaluationResult();
        evalResult.setScore(BigDecimal.valueOf(9.0));
        evalResult.setFeedback("Exceptional explanation of Zero Trust principles and micro-segmentation.");

        when(interviewEvaluatorService.evaluateAnswer(anyString(), eq(question1))).thenReturn(evalResult);
        when(answerRepository.save(any(InterviewAnswer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Simulate Adaptive flow returning next question
        when(adaptiveFlowService.getNextQuestion(eq(session), any(InterviewAnswer.class), eq(evalResult), any()))
                .thenReturn(question2);

        // Submit answer
        SubmitInterviewAnswerRequest request = new SubmitInterviewAnswerRequest();
        request.setQuestionNo(1);
        request.setQuestionId("CN-250");
        request.setAnswerText("Zero Trust follows 'Never Trust, Always Verify' and uses micro-segmentation instead of open VPN subnets.");

        InterviewQuestion nextQ = sessionService.submitAnswer(100L, request);

        // Verify next question is returned
        assertNotNull(nextQ);
        assertEquals("CN-249", nextQ.getId());

        // Verify answer was saved to DB
        verify(answerRepository, times(1)).save(any(InterviewAnswer.class));

        // VERIFY AI MEMORY IS UPDATED WITH TECHNICAL SKILL, TOPIC, SCORE (90), AND FEEDBACK
        ArgumentCaptor<Integer> scoreCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<String> feedbackCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);

        verify(aiMemoryService, times(1)).updateMemoryGraph(
                eq(1L),
                eq(MemoryCategory.TECHNICAL),
                eq(MemoryType.SKILL),
                keyCaptor.capture(),
                scoreCaptor.capture(),
                feedbackCaptor.capture()
        );

        assertEquals("Virtual Interview Answer: Network Security", keyCaptor.getValue());
        assertEquals(90, scoreCaptor.getValue()); // 9.0 * 10 = 90
        assertTrue(feedbackCaptor.getValue().contains("Zero Trust"));
    }

    @Test
    @DisplayName("Test Session Refresh / Resume: Candidate refreshes or logs back in")
    void testRefreshOrResumeSession() {
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));

        InterviewAnswer pastAnswer = InterviewAnswer.builder()
                .interviewAnswerId(501L)
                .questionId("CN-250")
                .questionNo(1)
                .evaluationScore(BigDecimal.valueOf(9.0))
                .build();

        // Database returns previously saved answer
        when(answerRepository.findByInterviewSessionInterviewSessionIdOrderByQuestionNo(100L))
                .thenReturn(List.of(pastAnswer));

        when(adaptiveFlowService.getNextQuestion(eq(session), eq(pastAnswer), isNull(), any()))
                .thenReturn(question2);

        // Candidate hits page refresh (triggers getCurrentQuestion)
        InterviewQuestion resumedQuestion = sessionService.getCurrentQuestion(100L);

        assertNotNull(resumedQuestion);
        assertEquals("CN-249", resumedQuestion.getId());
        assertEquals("Network Security", resumedQuestion.getTopic());

        // Session was preserved and updated in repository
        verify(sessionRepository, times(1)).save(session);
    }
}
