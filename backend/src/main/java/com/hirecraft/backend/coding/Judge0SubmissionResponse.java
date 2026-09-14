package com.hirecraft.backend.coding;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Typed DTO for the Judge0 submission result returned by:
 * <pre>GET /submissions/{token}?base64_encoded=false&fields=*</pre>
 *
 * <p>Only the fields that HireCraft persists / acts on are modelled here.
 * Unknown JSON properties are ignored safely.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Judge0SubmissionResponse {

    /** Unique token assigned by Judge0 to this submission. */
    @JsonProperty("token")
    private String token;

    /** Execution status object. */
    @JsonProperty("status")
    private Status status;

    /** Standard output produced by the program. */
    @JsonProperty("stdout")
    private String stdout;

    /** Standard error produced by the program or runtime. */
    @JsonProperty("stderr")
    private String stderr;

    /** Compiler messages (non-null only when compilation fails). */
    @JsonProperty("compile_output")
    private String compileOutput;

    /** Wall-clock execution time in seconds (as a string, e.g. "0.032"). */
    @JsonProperty("time")
    private String time;

    /** Peak memory usage in kilobytes. */
    @JsonProperty("memory")
    private Integer memory;

    /** OS-level exit code of the user program. */
    @JsonProperty("exit_code")
    private Integer exitCode;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Returns {@code true} when Judge0 has finished processing this submission
     * (i.e., the status ID is not In Queue or Processing).
     */
    public boolean isTerminal() {
        if (status == null) return false;
        int id = status.getId();
        // 1 = In Queue, 2 = Processing  →  not terminal
        // 3+ = terminal (Accepted, WA, TLE, MLE, RE, CE, …)
        return id >= 3;
    }

    /** Convenience: returns the numeric Judge0 status ID, or -1 if unknown. */
    public int getStatusId() {
        return status != null ? status.getId() : -1;
    }

    /** Convenience: returns the human-readable Judge0 status description. */
    public String getStatusDescription() {
        return status != null ? status.getDescription() : "Unknown";
    }

    // -----------------------------------------------------------------------
    // Nested status
    // -----------------------------------------------------------------------

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Status {
        @JsonProperty("id")
        private int id;

        @JsonProperty("description")
        private String description;
    }
}
