package com.hirecraft.backend.coding;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Typed DTO for a single Judge0 submission request payload.
 *
 * <p>Maps to the JSON body accepted by:
 * <pre>POST /submissions?base64_encoded=false&wait=false</pre>
 *
 * <p>Only the fields actually used by HireCraft are included; additional Judge0 fields
 * are silently ignored on deserialisation thanks to {@link JsonIgnoreProperties}.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Judge0SubmissionRequest {

    /**
     * Judge0 language ID.
     * Common values used in HireCraft:
     * <ul>
     *   <li>71 – Python 3</li>
     *   <li>62 – Java</li>
     *   <li>54 – C++ (GCC 9.2)</li>
     *   <li>50 – C (GCC 9.2)</li>
     *   <li>63 – JavaScript (Node.js)</li>
     * </ul>
     */
    @JsonProperty("language_id")
    private int languageId;

    /** Source code to execute. */
    @JsonProperty("source_code")
    private String sourceCode;

    /** Standard input to feed to the program (may be {@code null}). */
    @JsonProperty("stdin")
    private String stdin;

    /**
     * Expected output for automatic acceptance evaluation by Judge0.
     * When non-null, Judge0 itself marks the result as Accepted/Wrong Answer.
     */
    @JsonProperty("expected_output")
    private String expectedOutput;

    /** CPU time limit in seconds (overrides Judge0 defaults when set). */
    @JsonProperty("cpu_time_limit")
    private Double cpuTimeLimit;

    /** Memory limit in kilobytes (overrides Judge0 defaults when set). */
    @JsonProperty("memory_limit")
    private Integer memoryLimit;
}
