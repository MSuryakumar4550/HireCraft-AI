package com.hirecraft.backend.coding;

import com.hirecraft.backend.entity.CodingSubmission;
import com.hirecraft.backend.repository.CodingSubmissionRepository;
import com.hirecraft.backend.service.AiMemoryService;
import com.hirecraft.backend.util.Question;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Asynchronous Judge0 execution pipeline.
 *
 * <p>This service is intentionally separated from {@link com.hirecraft.backend.service.impl.CodingSubmissionServiceImpl}
 * to avoid the Spring @Async self-invocation trap: a method annotated with {@code @Async} must be
 * called through a Spring proxy, which is impossible when the call originates from a method in the
 * same class. By placing the async work here, the proxy is always used correctly.
 *
 * <h2>Execution flow</h2>
 * <ol>
 *   <li>Called by {@code CodingSubmissionServiceImpl.submitCode} immediately after saving
 *       the {@link CodingSubmission} as {@code PENDING}.</li>
 *   <li>Resolves the Judge0 language ID from the submission's language string.</li>
 *   <li>Iterates through each test case in the question:
 *       <ul>
 *         <li>Submits to Judge0 ({@code POST /submissions}) — gets a token.</li>
 *         <li>Polls Judge0 ({@code GET /submissions/{token}}) until terminal.</li>
 *         <li>Compares stdout to expected output.</li>
 *       </ul>
 *   </li>
 *   <li>Aggregates pass/fail counts across all test cases.</li>
 *   <li>Updates the {@link CodingSubmission} with the final status and result data.</li>
 *   <li>Delegates to {@link AiMemoryService} exactly as the original code did.</li>
 * </ol>
 *
 * <p>If the question has no test cases defined yet, the submission is marked
 * {@code NO_TEST_CASES} and the infrastructure remains ready for future test-case population.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class Judge0AsyncExecutionService {

    private final CodeExecutionService codeExecutionService;
    private final CodingSubmissionRepository submissionRepository;
    private final AiMemoryService aiMemoryService;
    private final SolutionWrapperService solutionWrapperService;

    // -----------------------------------------------------------------------
    // Async entry point
    // -----------------------------------------------------------------------

    /**
     * Executes the submission against all test cases asynchronously.
     *
     * <p>Accepts the already-persisted {@link CodingSubmission} object directly to avoid
     * the @Transactional + @Async race condition where findById() would run before the
     * calling transaction commits.
     *
     * @param submission the already-saved {@link CodingSubmission} (status=PENDING)
     * @param question   the question object containing hidden test cases
     */
    @Async("judge0Executor")
    @Transactional
    public void executeAsync(CodingSubmission submission, Question question) {
        UUID submissionId = submission.getSubmissionId();
        log.info("Judge0AsyncExecutionService: starting execution for submissionId={}", submissionId);

        // Mark submission as RUNNING — use saveAndFlush to re-attach the detached entity
        // to this thread's new transaction context (avoids the original findById race).
        submission.setStatus("RUNNING");
        submission = submissionRepository.saveAndFlush(submission);

        List<Question.TestCase> testCases = question.getTestCases();

        if (testCases.isEmpty()) {
            log.warn("No test cases defined for questionId={}. Marking submission as NO_TEST_CASES.", question.getId());
            submission.setStatus("NO_TEST_CASES");
            submission.setTestcasesPassed(0);
            submission.setTestcasesTotal(0);
            submission.setEvaluatedAt(Instant.now());
            submissionRepository.save(submission);
            return;
        }

        // Resolve language ID
        int languageId = Judge0Language.toJudge0Id(submission.getLanguage());
        if (languageId == -1) {
            log.error("Unsupported language '{}' for submissionId={}", submission.getLanguage(), submissionId);
            markSubmissionFailed(submission, "UNSUPPORTED_LANGUAGE",
                    "Language '" + submission.getLanguage() + "' is not supported by Judge0.", null, null);
            return;
        }

        // Execute against each test case
        executeTestCases(submission, question, testCases, languageId);
    }

    // -----------------------------------------------------------------------
    // Internal execution logic
    // -----------------------------------------------------------------------

    private void executeTestCases(CodingSubmission submission,
                                  Question question,
                                  List<Question.TestCase> testCases,
                                  int languageId) {
        int passed = 0;
        int total = testCases.size();

        // Use result data from the LAST test case for stdout/stderr display
        String lastStdout = null;
        String lastStderr = null;
        String lastCompileOutput = null;
        Integer lastExecutionTimeMs = null;
        Integer lastMemoryKb = null;

        // Track the token from the FIRST test case submission for the entity
        String firstToken = null;

        // Track the first non-Accepted status (to set overall status correctly)
        String overallStatus = "ACCEPTED";
        int overallStatusId = Judge0Status.ACCEPTED.getId();

        String language = submission.getLanguage();
        Integer questionId = question.getId();

        for (int i = 0; i < testCases.size(); i++) {
            Question.TestCase tc = testCases.get(i);
            int tcNum = i + 1;

            try {
                log.debug("submissionId={}: submitting test case {}/{} to Judge0",
                        submission.getSubmissionId(), tcNum, total);

                // Step 1: Wrap the user's Solution class into a complete executable program.
                // For questions without a wrapper, wrappedCode == submission.getSourceCode() unchanged.
                String wrappedCode = solutionWrapperService.wrap(
                        submission.getSourceCode(), language, questionId, tc.getInput());

                // Step 2: Submit to Judge0 (no expectedOutput — we do our own comparison below)
                Judge0SubmissionResponse submitResponse = codeExecutionService.submit(
                        wrappedCode,
                        languageId,
                        null,   // stdin not needed — test data is embedded in the wrapped code
                        null    // do NOT pass expectedOutput; we normalise & compare ourselves
                );

                String token = submitResponse.getToken();
                if (i == 0) {
                    firstToken = token;
                    // Persist token immediately so GET /submissions can surface it
                    submission.setJudge0Token(token);
                    submissionRepository.save(submission);
                }

                // Step 3: Poll until done
                Judge0SubmissionResponse result = codeExecutionService.pollUntilDone(token);

                // Step 4: Capture output data from this test case
                lastStdout = result.getStdout();
                lastStderr = result.getStderr();
                lastCompileOutput = result.getCompileOutput();
                lastExecutionTimeMs = parseTimeMs(result.getTime());
                lastMemoryKb = result.getMemory();

                int statusId = result.getStatusId();
                log.info("submissionId={} testCase={}/{}: Judge0 statusId={} ({})",
                        submission.getSubmissionId(), tcNum, total, statusId, result.getStatusDescription());

                // Step 5: Evaluate result
                if (statusId == Judge0Status.COMPILATION_ERROR.getId()) {
                    // Short-circuit on Compilation Error — no point running remaining cases
                    if (overallStatusId == Judge0Status.ACCEPTED.getId()) {
                        overallStatus = Judge0Status.toSubmissionStatus(statusId);
                        overallStatusId = statusId;
                    }
                    log.warn("submissionId={}: compilation error — skipping remaining test cases", submission.getSubmissionId());
                    break;
                } else if (statusId == Judge0Status.ACCEPTED.getId() ||
                           statusId == Judge0Status.WRONG_ANSWER.getId()) {
                    // For wrapped code we ignore Judge0's own Accept/WA decision
                    // (we submitted with no expectedOutput) and do our own comparison.
                    // Judge0 will return statusId=3 (Accepted) since no expected_output was set.
                    // We compare normalised stdout vs normalised expectedOutput ourselves.
                    String actualNorm   = normalise(result.getStdout());
                    String expectedNorm = normalise(tc.getExpectedOutput());
                    
                    boolean testPassed = false;
                    if (questionId != null && questionId == 4) {
                        try {
                            double actualVal = Double.parseDouble(actualNorm);
                            double expectedVal = Double.parseDouble(expectedNorm);
                            testPassed = Math.abs(actualVal - expectedVal) < 1e-5;
                        } catch (NumberFormatException e) {
                            testPassed = actualNorm.equals(expectedNorm);
                        }
                    } else {
                        testPassed = actualNorm.equals(expectedNorm);
                    }

                    log.debug("submissionId={} tc={}: actual='{}' expected='{}' match={}",
                            submission.getSubmissionId(), tcNum, actualNorm, expectedNorm, testPassed);

                    if (testPassed) {
                        passed++;
                    } else {
                        if (overallStatusId == Judge0Status.ACCEPTED.getId()) {
                            overallStatus = "WRONG_ANSWER";
                            overallStatusId = Judge0Status.WRONG_ANSWER.getId();
                        }
                        // Stop on first wrong answer (hidden tests must not be revealed)
                        break;
                    }
                } else {
                    // Runtime error, TLE, etc.
                    if (overallStatusId == Judge0Status.ACCEPTED.getId()) {
                        overallStatus = Judge0Status.toSubmissionStatus(statusId);
                        overallStatusId = statusId;
                    }
                    break;
                }

            } catch (Judge0ExecutionException ex) {
                log.error("Judge0ExecutionException for submissionId={} testCase={}/{}: {}",
                        submission.getSubmissionId(), tcNum, total, ex.getMessage());
                overallStatus = "EXECUTION_ERROR";
                overallStatusId = -1;
                lastStderr = ex.getMessage();
                break;
            }
        }

        // Determine final status
        String finalStatus = (passed == total) ? "ACCEPTED" : overallStatus;

        log.info("submissionId={}: execution complete — {}/{} test cases passed, final status={}",
                submission.getSubmissionId(), passed, total, finalStatus);

        // Persist final state
        submission.setStatus(finalStatus);
        submission.setJudge0StatusId(overallStatusId > 0 ? overallStatusId : null);
        submission.setJudge0Token(firstToken);
        submission.setStdout(lastStdout);
        submission.setStderr(lastStderr);
        submission.setCompileOutput(lastCompileOutput);
        submission.setExecutionTimeMs(lastExecutionTimeMs);
        submission.setMemoryKb(lastMemoryKb);
        submission.setTestcasesPassed(passed);
        submission.setTestcasesTotal(total);
        submission.setEvaluatedAt(Instant.now());

        submissionRepository.save(submission);

        // Delegate to AI memory — preserving the exact original behaviour from CodingSubmissionServiceImpl
        triggerAiMemoryUpdate(submission, passed, total);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private void markSubmissionFailed(CodingSubmission submission,
                                      String status,
                                      String stderr,
                                      String compileOutput,
                                      String stdout) {
        submission.setStatus(status);
        submission.setStderr(stderr);
        submission.setCompileOutput(compileOutput);
        submission.setStdout(stdout);
        submission.setTestcasesPassed(0);
        submission.setTestcasesTotal(0);
        submission.setEvaluatedAt(Instant.now());
        submissionRepository.save(submission);
    }

    /**
     * Updates the AI memory graph for this submission.
     * Replicates the exact logic that was in the original {@code CodingSubmissionServiceImpl.updateSubmissionStatus}.
     */
    private void triggerAiMemoryUpdate(CodingSubmission submission, int passed, int total) {
        try {
            int score = (total > 0) ? (passed * 100 / total) : 0;
            String feedback = score == 100
                    ? "All testcases passed."
                    : "Failed some testcases (" + passed + "/" + total + ").";

            aiMemoryService.updateMemoryGraph(
                    submission.getCodingAssessment().getUser().getUserId(),
                    com.hirecraft.backend.enums.MemoryCategory.TECHNICAL,
                    com.hirecraft.backend.enums.MemoryType.STRENGTH,
                    "Coding Question " + submission.getQuestionNo() + " (" + submission.getLanguage() + ")",
                    score,
                    feedback
            );
        } catch (Exception ex) {
            // AI memory update is non-critical — log and continue
            log.warn("AI memory update failed for submissionId={}: {}", submission.getSubmissionId(), ex.getMessage());
        }
    }

    /**
     * Converts a Judge0 time string (e.g. "0.032") from seconds to milliseconds.
     * Returns {@code null} if the string is null or unparseable.
     */
    private Integer parseTimeMs(String timeSeconds) {
        if (timeSeconds == null || timeSeconds.isBlank()) return null;
        try {
            return (int) (Double.parseDouble(timeSeconds.trim()) * 1000);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    /**
     * Normalises a program output string for comparison:
     * strips surrounding whitespace/newlines, collapses internal whitespace
     * after commas to a single space, and converts to lower-case so that
     * {@code "[0, 1]"} and {@code "[0,1]"} are treated as equivalent.
     *
     * <p>Strategy: remove all spaces, then compare — this handles Python's
     * {@code [0, 1]}, Java's {@code [0, 1]}, and C++'s {@code [0, 1]} formats.
     */
    private String normalise(String output) {
        if (output == null) return "";
        // Trim surrounding whitespace (including trailing newlines from the program)
        String s = output.strip();
        // Remove all internal whitespace for a canonical form: [0,1]
        s = s.replaceAll("\\s", "");
        return s;
    }
}
