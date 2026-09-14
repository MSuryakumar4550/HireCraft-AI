package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.CreateCodingAssessmentRequest;
import com.hirecraft.backend.dto.response.CodingAssessmentResponse;
import com.hirecraft.backend.dto.response.CodingQuestionResponse;
import com.hirecraft.backend.entity.CodingAssessment;
import com.hirecraft.backend.entity.CodingSubmission;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.AssessmentMode;
import com.hirecraft.backend.enums.AssessmentStatus;
import com.hirecraft.backend.enums.DifficultyLevel;
import com.hirecraft.backend.repository.CodingAssessmentRepository;
import com.hirecraft.backend.repository.CodingSubmissionRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.impl.CodingAssessmentServiceImpl;
import com.hirecraft.backend.util.Question;
import com.hirecraft.backend.util.QuestionBankLoader;
import tools.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CodingAssessmentServiceTest {

    @Mock
    private CodingAssessmentRepository codingAssessmentRepository;

    @Mock
    private CodingSubmissionRepository codingSubmissionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AiMemoryService aiMemoryService;

    @Mock
    private QuestionEngineService questionEngineService;

    private QuestionBankLoader questionBankLoader;
    private CodingAssessmentService codingAssessmentService;

    private User testUser;
    private Long userId;

    @BeforeEach
    void setUp() {
        JsonMapper mapper = JsonMapper.builder().build();
        questionBankLoader = new QuestionBankLoader(mapper);
        questionBankLoader.loadAll();

        codingAssessmentService = new CodingAssessmentServiceImpl(
                codingAssessmentRepository,
                codingSubmissionRepository,
                userRepository,
                aiMemoryService,
                questionEngineService,
                questionBankLoader
        );

        userId = 1L;
        testUser = User.builder()
                .userId(userId)
                .email("candidate@hirecraft.ai")
                .fullName("Test Candidate")
                .build();
    }

    @Test
    @DisplayName("QuestionBankLoader loads all JSON files correctly")
    void testQuestionBankLoaderLoadsFiles() {
        assertFalse(questionBankLoader.getEasyQuestions().isEmpty(), "Easy questions should not be empty");
        assertFalse(questionBankLoader.getMediumQuestions().isEmpty(), "Medium questions should not be empty");
        assertFalse(questionBankLoader.getHardQuestions().isEmpty(), "Hard questions should not be empty");

        Question q1 = questionBankLoader.getQuestionById(1).orElse(null);
        assertNotNull(q1, "Question ID 1 should exist");
        assertEquals("Two Sum", q1.getTitle());
        assertEquals("EASY", q1.getDifficulty().toUpperCase());
        assertEquals(10, q1.getTimeLimitMinutes());
    }

    @Test
    @DisplayName("Create Assessment with EASY difficulty selects 5 Easy questions and 50 min total")
    void testCreateAssessmentEasy() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(codingAssessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId)).thenReturn(Collections.emptyList());
        when(codingAssessmentRepository.save(any(CodingAssessment.class))).thenAnswer(i -> {
            CodingAssessment a = i.getArgument(0);
            a.setCodingAssessmentId(UUID.randomUUID());
            return a;
        });

        CreateCodingAssessmentRequest request = new CreateCodingAssessmentRequest();
        request.setDifficultyLevel(DifficultyLevel.EASY);
        request.setAssessmentMode(AssessmentMode.TOPIC_WISE);

        CodingAssessmentResponse response = codingAssessmentService.createAssessment(userId, request);

        assertNotNull(response);
        assertEquals(5, response.getTotalQuestions());
        assertEquals(5, response.getQuestions().size());
        assertEquals(50, response.getTotalTimeLimitMinutes());

        for (CodingQuestionResponse q : response.getQuestions()) {
            assertEquals(DifficultyLevel.EASY, q.getDifficulty());
            assertEquals(10, q.getTimeLimitMinutes());
            assertNotNull(q.getDescription());
        }

        Set<Integer> uniqueIds = new HashSet<>();
        for (CodingQuestionResponse q : response.getQuestions()) {
            uniqueIds.add(q.getId());
        }
        assertEquals(5, uniqueIds.size(), "All 5 selected questions must be unique");
    }

    @Test
    @DisplayName("Create Assessment with MEDIUM difficulty selects 3 Easy + 2 Medium and 80 min total")
    void testCreateAssessmentMedium() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(codingAssessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId)).thenReturn(Collections.emptyList());
        when(codingAssessmentRepository.save(any(CodingAssessment.class))).thenAnswer(i -> {
            CodingAssessment a = i.getArgument(0);
            a.setCodingAssessmentId(UUID.randomUUID());
            return a;
        });

        CreateCodingAssessmentRequest request = new CreateCodingAssessmentRequest();
        request.setDifficultyLevel(DifficultyLevel.MEDIUM);

        CodingAssessmentResponse response = codingAssessmentService.createAssessment(userId, request);

        assertNotNull(response);
        assertEquals(5, response.getTotalQuestions());
        assertEquals(5, response.getQuestions().size());
        assertEquals(80, response.getTotalTimeLimitMinutes());

        long easyCount = response.getQuestions().stream()
                .filter(q -> q.getDifficulty() == DifficultyLevel.EASY)
                .count();
        long mediumCount = response.getQuestions().stream()
                .filter(q -> q.getDifficulty() == DifficultyLevel.MEDIUM)
                .count();

        assertEquals(3, easyCount, "Medium assessment must have exactly 3 Easy questions");
        assertEquals(2, mediumCount, "Medium assessment must have exactly 2 Medium questions");
    }

    @Test
    @DisplayName("Create Assessment with HARD difficulty selects 1 Easy + 2 Medium + 2 Hard and 140 min total")
    void testCreateAssessmentHard() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(codingAssessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId)).thenReturn(Collections.emptyList());
        when(codingAssessmentRepository.save(any(CodingAssessment.class))).thenAnswer(i -> {
            CodingAssessment a = i.getArgument(0);
            a.setCodingAssessmentId(UUID.randomUUID());
            return a;
        });

        CreateCodingAssessmentRequest request = new CreateCodingAssessmentRequest();
        request.setDifficultyLevel(DifficultyLevel.HARD);

        CodingAssessmentResponse response = codingAssessmentService.createAssessment(userId, request);

        assertNotNull(response);
        assertEquals(5, response.getTotalQuestions());
        assertEquals(5, response.getQuestions().size());
        assertEquals(140, response.getTotalTimeLimitMinutes());

        long easyCount = response.getQuestions().stream()
                .filter(q -> q.getDifficulty() == DifficultyLevel.EASY)
                .count();
        long mediumCount = response.getQuestions().stream()
                .filter(q -> q.getDifficulty() == DifficultyLevel.MEDIUM)
                .count();
        long hardCount = response.getQuestions().stream()
                .filter(q -> q.getDifficulty() == DifficultyLevel.HARD)
                .count();

        assertEquals(1, easyCount, "Hard assessment must have exactly 1 Easy question");
        assertEquals(2, mediumCount, "Hard assessment must have exactly 2 Medium questions");
        assertEquals(2, hardCount, "Hard assessment must have exactly 2 Hard questions");
    }

    @Test
    @DisplayName("Solved questions are NEVER selected and Failed questions are PRIORITIZED")
    void testQuestionHistoryFilteringAndPrioritization() {
        // Setup past assessment with question 1 (solved) and question 1768 (failed)
        UUID pastAssessmentId = UUID.randomUUID();
        CodingAssessment pastAssessment = CodingAssessment.builder()
                .codingAssessmentId(pastAssessmentId)
                .user(testUser)
                .questionSource("1,1768,99999")
                .status(AssessmentStatus.COMPLETED)
                .build();

        // Question 1 submission: ACCEPTED (Solved)
        CodingSubmission sub1 = CodingSubmission.builder()
                .questionNo(1) // mapped to ID 1
                .status("ACCEPTED")
                .testcasesPassed(10)
                .testcasesTotal(10)
                .build();

        // Question 2 submission: FAILED (Failed)
        CodingSubmission sub2 = CodingSubmission.builder()
                .questionNo(2) // mapped to ID 1768
                .status("WRONG_ANSWER")
                .testcasesPassed(2)
                .testcasesTotal(10)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(codingAssessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(List.of(pastAssessment));
        when(codingSubmissionRepository.findByCodingAssessmentCodingAssessmentIdOrderBySubmissionNumber(pastAssessmentId))
                .thenReturn(List.of(sub1, sub2));
        when(codingAssessmentRepository.save(any(CodingAssessment.class))).thenAnswer(i -> {
            CodingAssessment a = i.getArgument(0);
            a.setCodingAssessmentId(UUID.randomUUID());
            return a;
        });

        CreateCodingAssessmentRequest request = new CreateCodingAssessmentRequest();
        request.setDifficultyLevel(DifficultyLevel.EASY);

        CodingAssessmentResponse response = codingAssessmentService.createAssessment(userId, request);

        assertNotNull(response);
        assertEquals(5, response.getQuestions().size());

        List<Integer> selectedIds = response.getQuestions().stream()
                .map(CodingQuestionResponse::getId)
                .toList();

        // Question 1 was SOLVED -> MUST NOT be in selected questions
        assertFalse(selectedIds.contains(1), "Solved question (ID 1) must never be re-selected");

        // Question 1768 was FAILED -> MUST be prioritized and included
        assertTrue(selectedIds.contains(1768), "Failed question (ID 1768) must be prioritized and selected");
    }
}
