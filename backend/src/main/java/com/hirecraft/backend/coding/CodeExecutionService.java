package com.hirecraft.backend.coding;

import java.util.Map;

/**
 * Code execution service abstraction.
 *
 * <p>The concrete implementation ({@link Judge0ExecutionServiceImpl}) calls the Judge0 CE
 * REST API over HTTP. User code is NEVER executed inside the Spring Boot JVM.
 *
 * <p>The interface preserves the original raw-Map contract so that existing callers
 * (if any) continue to compile, while also exposing typed overloads that the new
 * asynchronous execution pipeline uses.
 */
public interface CodeExecutionService {

    // -----------------------------------------------------------------------
    // Original contract (raw Map) — kept for backward compatibility
    // -----------------------------------------------------------------------

    /**
     * Submits source code to Judge0 for execution.
     *
     * @param sourceCode the program source code
     * @param language   the programming language name (e.g. "python", "java")
     * @param stdin      standard input to supply to the program (may be {@code null})
     * @return the Judge0 submission token
     */
    String submitCode(String sourceCode, String language, String stdin);

    /**
     * Retrieves the execution result from Judge0 using the submission token.
     *
     * @param judge0Token the token returned by {@link #submitCode}
     * @return raw Judge0 result map (keys: token, status, stdout, stderr, …)
     */
    Map<String, Object> getResult(String judge0Token);

    // -----------------------------------------------------------------------
    // Typed overloads used by the async execution pipeline
    // -----------------------------------------------------------------------

    /**
     * Submits source code to Judge0 and returns a typed response.
     *
     * @param sourceCode     the program source code
     * @param languageId     the Judge0 numeric language ID (e.g. 71 for Python 3)
     * @param stdin          standard input (may be {@code null})
     * @param expectedOutput expected program output used by Judge0 for auto-grading
     *                       (may be {@code null} to skip Judge0-side grading)
     * @return a typed {@link Judge0SubmissionResponse} with at least the token field set
     */
    Judge0SubmissionResponse submit(String sourceCode, int languageId, String stdin, String expectedOutput);

    /**
     * Polls Judge0 for the execution result until it reaches a terminal state.
     *
     * @param judge0Token the submission token
     * @return the final {@link Judge0SubmissionResponse} in a terminal status
     * @throws Judge0ExecutionException if polling times out or the HTTP call fails
     */
    Judge0SubmissionResponse pollUntilDone(String judge0Token);
}
