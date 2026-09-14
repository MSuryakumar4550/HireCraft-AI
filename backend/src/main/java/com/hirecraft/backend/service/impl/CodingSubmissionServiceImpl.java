package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.coding.Judge0AsyncExecutionService;
import com.hirecraft.backend.dto.request.CodeSubmissionRequest;
import com.hirecraft.backend.dto.response.SubmissionResponse;
import com.hirecraft.backend.entity.CodingAssessment;
import com.hirecraft.backend.entity.CodingSubmission;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.CodingAssessmentRepository;
import com.hirecraft.backend.repository.CodingSubmissionRepository;
import com.hirecraft.backend.service.CodingSubmissionService;
import com.hirecraft.backend.util.Question;
import com.hirecraft.backend.util.QuestionBankLoader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirecraft.backend.service.AiMemoryService;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodingSubmissionServiceImpl implements CodingSubmissionService {

    private final CodingSubmissionRepository submissionRepository;
    private final CodingAssessmentRepository assessmentRepository;
    private final AiMemoryService aiMemoryService;
    private final Judge0AsyncExecutionService judge0AsyncExecutionService;
    private final QuestionBankLoader questionBankLoader;

    @Override
    @Transactional
    public SubmissionResponse submitCode(UUID assessmentId, CodeSubmissionRequest request) {
        CodingAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("CodingAssessment", assessmentId.toString()));

        long existingCount = submissionRepository
                .findByCodingAssessmentCodingAssessmentIdOrderBySubmissionNumber(assessmentId)
                .stream()
                .filter(s -> s.getQuestionNo().equals(request.getQuestionNo()))
                .count();

        CodingSubmission submission = CodingSubmission.builder()
                .codingAssessment(assessment)
                .questionNo(request.getQuestionNo())
                .language(request.getLanguage())
                .sourceCode(request.getSourceCode())
                .submissionNumber((int) existingCount + 1)
                .status("PENDING")
                .build();

        // saveAndFlush ensures the row is committed before the async thread starts
        submission = submissionRepository.saveAndFlush(submission);

        // Resolve the question from the question bank to obtain its test cases
        // The question number in the submission maps to the position in the assessment's questionSource CSV
        Question question = resolveQuestion(assessment, request.getQuestionNo());

        // Dispatch to Judge0 asynchronously on the judge0Executor thread pool.
        // Pass the submission OBJECT (not just its ID) to avoid the @Transactional+@Async
        // race condition where the async thread's findById runs before this transaction commits.
        log.info("Dispatching submissionId={} to Judge0AsyncExecutionService (async)", submission.getSubmissionId());
        judge0AsyncExecutionService.executeAsync(submission, question);

        return toResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsForAssessment(UUID assessmentId) {
        return submissionRepository
                .findByCodingAssessmentCodingAssessmentIdOrderBySubmissionNumber(assessmentId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionByJudge0Token(String judge0Token) {
        return toResponse(submissionRepository.findByJudge0Token(judge0Token)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found for token: " + judge0Token)));
    }

    @Override
    @Transactional
    public SubmissionResponse updateSubmissionStatus(UUID submissionId, String status, int testcasesPassed, int testcasesTotal) {
        CodingSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId.toString()));
        
        submission.setStatus(status);
        submission.setTestcasesPassed(testcasesPassed);
        submission.setTestcasesTotal(testcasesTotal);
        submissionRepository.save(submission);

        // Dynamically update AI Memory for this coding question attempt
        int score = (testcasesTotal > 0) ? (testcasesPassed * 100 / testcasesTotal) : 0;
        String feedback = score == 100 ? "All testcases passed." : "Failed some testcases (" + testcasesPassed + "/" + testcasesTotal + ").";
        
        aiMemoryService.updateMemoryGraph(
                submission.getCodingAssessment().getUser().getUserId(),
                com.hirecraft.backend.enums.MemoryCategory.TECHNICAL,
                com.hirecraft.backend.enums.MemoryType.STRENGTH,
                "Coding Question " + submission.getQuestionNo() + " (" + submission.getLanguage() + ")",
                score,
                feedback
        );
        
        return toResponse(submission);
    }

    /**
     * Resolves the {@link Question} corresponding to a submission's question number.
     *
     * <p>The assessment's {@code questionSource} field stores a comma-separated list of
     * question IDs (e.g. {@code "1,15,53"}). The submission's {@code questionNo} is
     * 1-indexed position within that list.
     *
     * <p>Falls back gracefully: if the position is out of range, or if the question ID is
     * not found in the question bank, a minimal dummy {@link Question} with no test cases
     * is returned so the async service can mark the submission as {@code NO_TEST_CASES}
     * rather than crashing.
     */
    private Question resolveQuestion(CodingAssessment assessment, Integer questionNo) {
        String questionSource = assessment.getQuestionSource();
        if (questionSource == null || questionSource.isBlank() || questionNo == null) {
            log.warn("Cannot resolve question: questionSource='{}', questionNo={}", questionSource, questionNo);
            return new Question(); // empty question — async service will mark NO_TEST_CASES
        }

        List<String> parts = Arrays.asList(questionSource.split(","));
        int zeroBasedIndex = questionNo - 1;

        if (zeroBasedIndex < 0 || zeroBasedIndex >= parts.size()) {
            log.warn("questionNo={} is out of range for questionSource='{}'", questionNo, questionSource);
            return new Question();
        }

        try {
            int questionId = Integer.parseInt(parts.get(zeroBasedIndex).trim());
            return questionBankLoader.getQuestionById(questionId)
                    .orElseGet(() -> {
                        log.warn("Question ID {} not found in question bank", questionId);
                        return new Question();
                    });
        } catch (NumberFormatException ex) {
            log.warn("Non-numeric question ID at position {} in questionSource='{}'", zeroBasedIndex, questionSource);
            return new Question();
        }
    }

    private SubmissionResponse toResponse(CodingSubmission s) {
        return SubmissionResponse.builder()
                .submissionId(s.getSubmissionId())
                .questionNo(s.getQuestionNo())
                .language(s.getLanguage())
                .submissionNumber(s.getSubmissionNumber())
                .status(s.getStatus())
                .judge0Token(s.getJudge0Token())
                .judge0StatusId(s.getJudge0StatusId())
                .stdout(s.getStdout())
                .stderr(s.getStderr())
                .compileOutput(s.getCompileOutput())
                .executionTimeMs(s.getExecutionTimeMs())
                .memoryKb(s.getMemoryKb())
                .exitCode(s.getExitCode())
                .testcasesPassed(s.getTestcasesPassed())
                .testcasesTotal(s.getTestcasesTotal())
                .createdAt(s.getSubmittedAt())
                .build();
    }
}
