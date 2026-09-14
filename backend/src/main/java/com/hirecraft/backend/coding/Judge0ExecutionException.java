package com.hirecraft.backend.coding;

/**
 * Thrown when the Judge0 HTTP client encounters an unrecoverable error —
 * for example when polling times out, or when Judge0 returns a non-2xx
 * response that cannot be retried.
 */
public class Judge0ExecutionException extends RuntimeException {

    public Judge0ExecutionException(String message) {
        super(message);
    }

    public Judge0ExecutionException(String message, Throwable cause) {
        super(message, cause);
    }
}
