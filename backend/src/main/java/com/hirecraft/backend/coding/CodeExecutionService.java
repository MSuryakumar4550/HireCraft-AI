package com.hirecraft.backend.coding;

import java.util.Map;

/**
 * Code execution service abstraction.
 * <p>
 * The concrete implementation will call Judge0 API over HTTP.
 * User code is NEVER executed inside the Spring Boot JVM.
 * <p>
 * NOT YET IMPLEMENTED — Judge0 HTTP client configuration will be added in a future phase.
 */
public interface CodeExecutionService {

    /**
     * Submits source code to Judge0 for execution.
     *
     * @return Judge0 submission token
     */
    String submitCode(String sourceCode, String language, String stdin);

    /**
     * Retrieves the execution result from Judge0 using the submission token.
     *
     * @return Raw Judge0 result map containing status, stdout, stderr, etc.
     */
    Map<String, Object> getResult(String judge0Token);
}
