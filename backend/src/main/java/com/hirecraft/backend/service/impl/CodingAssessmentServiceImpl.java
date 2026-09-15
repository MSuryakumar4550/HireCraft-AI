package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.request.CreateCodingAssessmentRequest;
import com.hirecraft.backend.dto.response.CodingAssessmentResponse;
import com.hirecraft.backend.dto.response.CodingQuestionResponse;
import com.hirecraft.backend.entity.CodingAssessment;
import com.hirecraft.backend.entity.CodingSubmission;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.AssessmentStatus;
import com.hirecraft.backend.enums.DifficultyLevel;
import com.hirecraft.backend.exception.BadRequestException;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.CodingAssessmentRepository;
import com.hirecraft.backend.repository.CodingSubmissionRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.AiMemoryService;
import com.hirecraft.backend.service.CodingAssessmentService;
import com.hirecraft.backend.dto.response.CodingQuestion;
import com.hirecraft.backend.service.QuestionEngineService;
import com.hirecraft.backend.util.Question;
import com.hirecraft.backend.util.QuestionBankLoader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodingAssessmentServiceImpl implements CodingAssessmentService {

    private final CodingAssessmentRepository codingAssessmentRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final UserRepository userRepository;
    private final AiMemoryService aiMemoryService;
    private final QuestionEngineService questionEngineService;
    private final QuestionBankLoader questionBankLoader;

    @Override
    @Transactional
    public CodingAssessmentResponse createAssessment(Long userId, CreateCodingAssessmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        DifficultyLevel selectedDifficulty = request.getDifficultyLevel();
        if (selectedDifficulty == null) {
            throw new BadRequestException("Difficulty level is required");
        }

        // 1. Determine user question history: Solved vs Failed
        Set<Integer> solvedQuestionIds = new HashSet<>();
        Set<Integer> failedQuestionIds = new HashSet<>();
        resolveUserQuestionHistory(userId, solvedQuestionIds, failedQuestionIds);

        // 2. Determine distribution based on selected difficulty
        // EASY: 5 Easy
        // MEDIUM: 3 Easy + 2 Medium
        // HARD: 1 Easy + 2 Medium + 2 Hard
        Map<DifficultyLevel, Integer> distribution = getDistribution(selectedDifficulty);

        // 3. Deterministically select unique questions per difficulty bucket
        List<Question> selectedQuestions = new ArrayList<>();
        Set<Integer> alreadyChosenIds = new HashSet<>();

        for (Map.Entry<DifficultyLevel, Integer> entry : distribution.entrySet()) {
            DifficultyLevel bucketDifficulty = entry.getKey();
            int countNeeded = entry.getValue();

            List<Question> picked = selectQuestionsForBucket(
                    bucketDifficulty, countNeeded, solvedQuestionIds, failedQuestionIds, alreadyChosenIds);

            selectedQuestions.addAll(picked);
            for (Question q : picked) {
                alreadyChosenIds.add(q.getId());
            }
        }


        if (selectedQuestions.size() != 5) {
            throw new BadRequestException("Failed to select exactly 5 questions. Selected: " + selectedQuestions.size());
        }

        // Store selected question IDs as comma-separated string in questionSource
        String questionIdsCsv = selectedQuestions.stream()
                .map(q -> String.valueOf(q.getId()))
                .collect(Collectors.joining(","));

        CodingAssessment assessment = CodingAssessment.builder()
                .user(user)
                .assessmentMode(request.getAssessmentMode())
                .difficultyLevel(selectedDifficulty)
                .questionSource(questionIdsCsv)
                .status(AssessmentStatus.NOT_STARTED)
                .totalQuestions(5)
                .build();

        codingAssessmentRepository.save(assessment);
        return toResponse(assessment, selectedQuestions);
    }

    private Map<DifficultyLevel, Integer> getDistribution(DifficultyLevel difficulty) {
        Map<DifficultyLevel, Integer> dist = new LinkedHashMap<>();
        switch (difficulty) {
            case EASY -> dist.put(DifficultyLevel.EASY, 5);
            case MEDIUM -> {
                dist.put(DifficultyLevel.EASY, 3);
                dist.put(DifficultyLevel.MEDIUM, 2);
            }
            case HARD -> {
                dist.put(DifficultyLevel.EASY, 1);
                dist.put(DifficultyLevel.MEDIUM, 2);
                dist.put(DifficultyLevel.HARD, 2);
            }
        }
        return dist;
    }

    private List<Question> selectQuestionsForBucket(
            DifficultyLevel difficulty,
            int countNeeded,
            Set<Integer> solvedQuestionIds,
            Set<Integer> failedQuestionIds,
            Set<Integer> alreadyChosenIds) {

        List<Question> pool = questionBankLoader.getQuestionsByDifficulty(difficulty);

        // Filter out solved and already chosen questions.
        // Questions without test cases are still eligible — the Judge0 pipeline
        // handles them gracefully by marking submissions as NO_TEST_CASES.
        List<Question> eligible = pool.stream()
                .filter(q -> q.getId() != null)
                .filter(q -> !solvedQuestionIds.contains(q.getId()))
                .filter(q -> !alreadyChosenIds.contains(q.getId()))
                .toList();

        // Partition into Failed and Unattempted
        List<Question> failedList = new ArrayList<>();
        List<Question> unattemptedList = new ArrayList<>();

        for (Question q : eligible) {
            if (failedQuestionIds.contains(q.getId())) {
                failedList.add(q);
            } else {
                unattemptedList.add(q);
            }
        }

        Collections.shuffle(failedList);
        Collections.shuffle(unattemptedList);

        List<Question> selected = new ArrayList<>();

        // 1. Pick from Failed first
        for (Question q : failedList) {
            if (selected.size() < countNeeded) {
                selected.add(q);
            }
        }

        // 2. Fill remaining from Unattempted
        for (Question q : unattemptedList) {
            if (selected.size() < countNeeded) {
                selected.add(q);
            }
        }

        if (selected.size() < countNeeded) {
            throw new BadRequestException("Not enough eligible questions available for difficulty " + difficulty
                    + ". Required: " + countNeeded + ", Available: " + selected.size());
        }

        return selected;
    }

    private void resolveUserQuestionHistory(Long userId, Set<Integer> solvedQuestionIds, Set<Integer> failedQuestionIds) {
        List<CodingAssessment> pastAssessments = codingAssessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId);

        for (CodingAssessment assessment : pastAssessments) {
            List<Integer> assignedIds = parseQuestionIds(assessment.getQuestionSource());
            List<CodingSubmission> submissions = codingSubmissionRepository
                    .findByCodingAssessmentCodingAssessmentIdOrderBySubmissionNumber(assessment.getCodingAssessmentId());

            Set<Integer> solvedInAssessment = new HashSet<>();

            for (CodingSubmission submission : submissions) {
                Integer qId = null;
                if (submission.getQuestionNo() != null) {
                    int qIndex = submission.getQuestionNo() - 1;
                    if (qIndex >= 0 && qIndex < assignedIds.size()) {
                        qId = assignedIds.get(qIndex);
                    } else if (questionBankLoader.getQuestionById(submission.getQuestionNo()).isPresent()) {
                        qId = submission.getQuestionNo();
                    }
                }

                if (qId != null) {
                    boolean isPassed = isSubmissionAccepted(submission);
                    if (isPassed) {
                        solvedInAssessment.add(qId);
                        solvedQuestionIds.add(qId);
                        failedQuestionIds.remove(qId);
                    }
                }
            }

            // For completed or attempted assessments, mark assigned questions that were not solved as failed
            for (Integer assignedId : assignedIds) {
                if (!solvedQuestionIds.contains(assignedId) && !solvedInAssessment.contains(assignedId)) {
                    if (assessment.getStatus() == AssessmentStatus.COMPLETED || !submissions.isEmpty()) {
                        failedQuestionIds.add(assignedId);
                    }
                }
            }
        }
    }

    private boolean isSubmissionAccepted(CodingSubmission submission) {
        if ("ACCEPTED".equalsIgnoreCase(submission.getStatus()) || "PASSED".equalsIgnoreCase(submission.getStatus())) {
            return true;
        }
        return submission.getTestcasesPassed() != null
                && submission.getTestcasesTotal() != null
                && submission.getTestcasesTotal() > 0
                && submission.getTestcasesPassed().equals(submission.getTestcasesTotal());
    }

    private List<Integer> parseQuestionIds(String questionSource) {
        if (questionSource == null || questionSource.isBlank()) {
            return Collections.emptyList();
        }
        List<Integer> ids = new ArrayList<>();
        for (String part : questionSource.split(",")) {
            try {
                ids.add(Integer.parseInt(part.trim()));
            } catch (NumberFormatException ignored) {}
        }
        return ids;
    }

    @Override
    @Transactional(readOnly = true)
    public CodingAssessmentResponse getAssessment(UUID assessmentId) {
        CodingAssessment assessment = findById(assessmentId);
        List<Question> questions = loadQuestionsForAssessment(assessment);
        return toResponse(assessment, questions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CodingAssessmentResponse> getUserAssessments(Long userId) {
        return codingAssessmentRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(a -> toResponse(a, loadQuestionsForAssessment(a)))
                .toList();
    }

    @Override
    @Transactional
    public CodingAssessmentResponse completeAssessment(UUID assessmentId) {
        CodingAssessment assessment = findById(assessmentId);
        if (assessment.getStatus() == AssessmentStatus.COMPLETED) {
            throw new BadRequestException("Assessment is already completed");
        }
        assessment.setStatus(AssessmentStatus.COMPLETED);
        
        // Calculate score from submissions
        List<CodingSubmission> submissions = assessment.getSubmissions();
        int total = assessment.getTotalQuestions() != null ? assessment.getTotalQuestions() : 5;
        int correct = 0;
        
        if (submissions != null && !submissions.isEmpty()) {
            Map<Integer, CodingSubmission> latestSubmissions = new HashMap<>();
            for (CodingSubmission sub : submissions) {
                CodingSubmission existing = latestSubmissions.get(sub.getQuestionNo());
                if (existing == null || sub.getSubmissionNumber() > existing.getSubmissionNumber()) {
                    latestSubmissions.put(sub.getQuestionNo(), sub);
                }
            }
            
            for (CodingSubmission sub : latestSubmissions.values()) {
                if ("ACCEPTED".equalsIgnoreCase(sub.getStatus())) {
                    correct++;
                }
            }
        }
        
        BigDecimal scoreValue = BigDecimal.valueOf((correct * 100.0) / total);
        assessment.setScore(scoreValue);
        assessment.setAccuracy(scoreValue);
        
        codingAssessmentRepository.save(assessment);
        
        // Update AI Memory
        Integer score = assessment.getScore() != null ? assessment.getScore().intValue() : 0;
        aiMemoryService.updateMemoryGraph(
                assessment.getUser().getUserId(),
                com.hirecraft.backend.enums.MemoryCategory.TECHNICAL, // Assuming coding is technical
                com.hirecraft.backend.enums.MemoryType.STRENGTH, // Default, logic handles re-classification
                "Data Structures and Algorithms",
                score,
                "Coding assessment completed."
        );
        
        return toResponse(assessment, loadQuestionsForAssessment(assessment));
    }

    private CodingAssessment findById(UUID id) {
        return codingAssessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CodingAssessment", id.toString()));
    }

    private List<Question> loadQuestionsForAssessment(CodingAssessment a) {
        List<Integer> ids = parseQuestionIds(a.getQuestionSource());
        List<Question> questions = new ArrayList<>();
        for (Integer id : ids) {
            questionBankLoader.getQuestionById(id).ifPresent(questions::add);
        }
        return questions;
    }

    private CodingAssessmentResponse toResponse(CodingAssessment a, List<Question> questions) {
        List<CodingQuestionResponse> questionResponses = new ArrayList<>();
        int totalMinutes = 0;

        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            int timeLimit = q.getTimeLimitMinutes();
            totalMinutes += timeLimit;

            DifficultyLevel diff = DifficultyLevel.EASY;
            if (q.getDifficulty() != null) {
                try {
                    diff = DifficultyLevel.valueOf(q.getDifficulty().toUpperCase());
                } catch (IllegalArgumentException ignored) {}
            }

            questionResponses.add(CodingQuestionResponse.builder()
                    .id(q.getId())
                    .questionNumber(i + 1)
                    .title(q.getTitle())
                    .difficulty(diff)
                    .timeLimitMinutes(timeLimit)
                    .description(q.getDescription())
                    .examples(q.getExamples())
                    .constraints(q.getConstraints())
                    .languages(q.getLanguages())
                    .starterCode(q.getStarterCode())
                    .build());
        }

        int answered = 0;
        int correct = 0;
        int wrong = 0;
        
        List<CodingSubmission> submissions = a.getSubmissions();
        if (submissions != null && !submissions.isEmpty()) {
            Map<Integer, CodingSubmission> latestSubmissions = new HashMap<>();
            for (CodingSubmission sub : submissions) {
                CodingSubmission existing = latestSubmissions.get(sub.getQuestionNo());
                if (existing == null || sub.getSubmissionNumber() > existing.getSubmissionNumber()) {
                    latestSubmissions.put(sub.getQuestionNo(), sub);
                }
            }
            answered = latestSubmissions.size();
            for (CodingSubmission sub : latestSubmissions.values()) {
                if (isSubmissionAccepted(sub)) {
                    correct++;
                } else {
                    wrong++;
                }
            }
        }

        return CodingAssessmentResponse.builder()
                .codingAssessmentId(a.getCodingAssessmentId())
                .assessmentMode(a.getAssessmentMode())
                .difficultyLevel(a.getDifficultyLevel())
                .status(a.getStatus())
                .totalQuestions(a.getTotalQuestions())
                .answeredQuestions(answered)
                .correctQuestions(correct)
                .wrongQuestions(wrong)
                .totalTimeLimitMinutes(totalMinutes > 0 ? totalMinutes : calculateDefaultTotalTime(a.getDifficultyLevel()))
                .score(a.getScore())
                .accuracy(a.getAccuracy())
                .questions(questionResponses)
                .createdAt(a.getCreatedAt())
                .build();
    }

    private int calculateDefaultTotalTime(DifficultyLevel level) {
        if (level == null) return 50;
        return switch (level) {
            case EASY -> 50;
            case MEDIUM -> 80;
            case HARD -> 140;
        };
    }
}
