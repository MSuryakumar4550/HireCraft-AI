package com.hirecraft.backend.coding;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Externalised configuration for the Judge0 self-hosted instance.
 *
 * <p>All Judge0 coordinates are bound from {@code application.properties} under the
 * {@code judge0} prefix, so the base URL is never hardcoded in service or client code.
 *
 * <p>Example properties:
 * <pre>
 *   judge0.api.url=http://localhost:2358
 *   judge0.poll.max-attempts=20
 *   judge0.poll.interval-ms=1000
 * </pre>
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "judge0")
public class Judge0Properties {

    /** Full base URL of the Judge0 CE instance, e.g. {@code http://localhost:2358}. */
    private Api api = new Api();

    /** Polling configuration for async result retrieval. */
    private Poll poll = new Poll();

    @Getter
    @Setter
    public static class Api {
        /** Judge0 base URL (no trailing slash). */
        private String url = "http://localhost:2358";
    }

    @Getter
    @Setter
    public static class Poll {
        /** Maximum number of polling attempts before giving up. */
        private int maxAttempts = 20;

        /** Milliseconds to wait between consecutive poll attempts. */
        private long intervalMs = 1500;
    }
}
