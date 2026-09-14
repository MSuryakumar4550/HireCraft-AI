package com.hirecraft.backend.coding;

import lombok.Getter;

/**
 * Maps Judge0 status IDs to HireCraft-meaningful names.
 *
 * <p>Judge0 CE v1.13.1 status IDs (from the official API docs):
 * <pre>
 *  1  – In Queue
 *  2  – Processing
 *  3  – Accepted
 *  4  – Wrong Answer
 *  5  – Time Limit Exceeded
 *  6  – Compilation Error
 *  7  – Runtime Error (SIGSEGV)
 *  8  – Runtime Error (SIGXFSZ)
 *  9  – Runtime Error (SIGFPE)
 *  10 – Runtime Error (SIGABRT)
 *  11 – Runtime Error (NZEC)
 *  12 – Runtime Error (Other)
 *  13 – Internal Error
 *  14 – Exec Format Error
 * </pre>
 */
@Getter
public enum Judge0Status {

    IN_QUEUE(1, "IN_QUEUE"),
    PROCESSING(2, "PROCESSING"),
    ACCEPTED(3, "ACCEPTED"),
    WRONG_ANSWER(4, "WRONG_ANSWER"),
    TIME_LIMIT_EXCEEDED(5, "TIME_LIMIT_EXCEEDED"),
    COMPILATION_ERROR(6, "COMPILATION_ERROR"),
    RUNTIME_ERROR_SIGSEGV(7, "RUNTIME_ERROR"),
    RUNTIME_ERROR_SIGXFSZ(8, "RUNTIME_ERROR"),
    RUNTIME_ERROR_SIGFPE(9, "RUNTIME_ERROR"),
    RUNTIME_ERROR_SIGABRT(10, "RUNTIME_ERROR"),
    RUNTIME_ERROR_NZEC(11, "RUNTIME_ERROR"),
    RUNTIME_ERROR_OTHER(12, "RUNTIME_ERROR"),
    INTERNAL_ERROR(13, "INTERNAL_ERROR"),
    EXEC_FORMAT_ERROR(14, "EXEC_FORMAT_ERROR");

    private final int id;

    /** The status string stored in {@code CodingSubmission.status}. */
    private final String submissionStatus;

    Judge0Status(int id, String submissionStatus) {
        this.id = id;
        this.submissionStatus = submissionStatus;
    }

    /**
     * Resolves a numeric Judge0 status ID to its HireCraft submission status string.
     * Falls back to {@code "UNKNOWN"} for unmapped IDs.
     */
    public static String toSubmissionStatus(int statusId) {
        for (Judge0Status s : values()) {
            if (s.id == statusId) return s.submissionStatus;
        }
        return "UNKNOWN";
    }

    /** Returns {@code true} if this status is a terminal (non-pending) state. */
    public boolean isTerminal() {
        return this != IN_QUEUE && this != PROCESSING;
    }
}
