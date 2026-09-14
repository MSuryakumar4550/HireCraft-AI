package com.hirecraft.backend.coding;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Concrete implementation of {@link CodeExecutionService} that delegates all
 * code execution to the self-hosted Judge0 CE instance configured via
 * {@link Judge0Properties}.
 *
 * <h2>How it works</h2>
 * <ol>
 *   <li>{@link #submit} POSTs a single test-case submission to {@code POST /submissions}
 *       and returns immediately with a Judge0 token (async mode, {@code wait=false}).</li>
 *   <li>{@link #pollUntilDone} GETs {@code /submissions/{token}} in a retry loop until
 *       Judge0 reports a terminal status (not In Queue / Processing).</li>
 *   <li>The original raw-Map methods ({@link #submitCode} / {@link #getResult}) are
 *       delegated to the typed methods so that the interface contract is fully satisfied.</li>
 * </ol>
 *
 * <p>No user code is ever executed inside the Spring Boot JVM.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class Judge0ExecutionServiceImpl implements CodeExecutionService {

    private final RestTemplate restTemplate;
    private final Judge0Properties judge0Properties;
    private final ObjectMapper objectMapper;

    // -----------------------------------------------------------------------
    // Public API — typed methods (used by CodingSubmissionServiceImpl)
    // -----------------------------------------------------------------------

    /**
     * Submits source code to Judge0 and returns a response containing the token.
     * The submission is asynchronous — Judge0 enqueues it and returns immediately.
     *
     * <p>The request body is built as a plain {@code Map<String, Object>} using
     * exact Judge0 snake_case field names. This bypasses any Jackson naming-strategy
     * ambiguity (camelCase vs snake_case) that can occur when using typed DTOs.
     */
    @Override
    public Judge0SubmissionResponse submit(String sourceCode,
                                           int languageId,
                                           String stdin,
                                           String expectedOutput) {
        String url = judge0Properties.getApi().getUrl() + "/submissions?base64_encoded=false&wait=false";

        // Build body with EXACT Judge0 snake_case field names.
        // Only include optional fields when non-null to keep the payload minimal.
        LinkedHashMap<String, Object> bodyMap = new LinkedHashMap<>();
        bodyMap.put("language_id", languageId);
        bodyMap.put("source_code", sourceCode);
        if (stdin != null)          bodyMap.put("stdin",           stdin);
        if (expectedOutput != null) bodyMap.put("expected_output", expectedOutput);

        // Serialize to a JSON string so WE control the exact bytes — no Jackson
        // naming strategy or annotation can interfere with plain Map keys.
        String jsonBody;
        try {
            jsonBody = objectMapper.writeValueAsString(bodyMap);
            log.info("[Judge0 OUTGOING] POST {} body={}", url, jsonBody);
        } catch (Exception e) {
            throw new Judge0ExecutionException("Failed to serialize Judge0 request body", e);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);

        // Send as a pre-serialized String — RestTemplate sends it verbatim.
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

        try {
            ResponseEntity<Judge0SubmissionResponse> response =
                    restTemplate.postForEntity(url, entity, Judge0SubmissionResponse.class);

            Judge0SubmissionResponse resp = response.getBody();
            if (resp == null || resp.getToken() == null) {
                throw new Judge0ExecutionException("Judge0 returned an empty response or missing token");
            }
            log.info("[Judge0 RESPONSE] token={}", resp.getToken());
            return resp;

        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            log.error("[Judge0 ERROR] {} — {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new Judge0ExecutionException(
                    "Judge0 submission failed: " + ex.getStatusCode() + " - " + ex.getResponseBodyAsString(), ex);
        } catch (ResourceAccessException ex) {
            log.error("Cannot reach Judge0 at {}: {}", url, ex.getMessage());
            throw new Judge0ExecutionException("Cannot reach Judge0 — is the VM running?", ex);
        }
    }

    /**
     * Polls {@code GET /submissions/{token}} until Judge0 returns a terminal status.
     *
     * <p>Uses the configured {@code judge0.poll.max-attempts} and
     * {@code judge0.poll.interval-ms} values. Throws {@link Judge0ExecutionException}
     * if the maximum number of attempts is exhausted without a terminal result.
     */
    @Override
    public Judge0SubmissionResponse pollUntilDone(String judge0Token) {
        String url = judge0Properties.getApi().getUrl()
                + "/submissions/" + judge0Token
                + "?base64_encoded=false&fields=token,status,stdout,stderr,compile_output,time,memory,exit_code";

        int maxAttempts = judge0Properties.getPoll().getMaxAttempts();
        long intervalMs = judge0Properties.getPoll().getIntervalMs();

        log.debug("Polling Judge0 for token={} (max {} attempts, interval {}ms)",
                judge0Token, maxAttempts, intervalMs);

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                ResponseEntity<Judge0SubmissionResponse> response =
                        restTemplate.getForEntity(url, Judge0SubmissionResponse.class);

                Judge0SubmissionResponse resp = response.getBody();
                if (resp == null) {
                    log.warn("Judge0 poll attempt {}/{} returned null body for token={}",
                            attempt, maxAttempts, judge0Token);
                } else {
                    log.debug("Poll attempt {}/{}: token={}, status={}",
                            attempt, maxAttempts, judge0Token, resp.getStatusDescription());

                    if (resp.isTerminal()) {
                        log.info("Judge0 token={} reached terminal status: {} (id={})",
                                judge0Token, resp.getStatusDescription(), resp.getStatusId());
                        return resp;
                    }
                }

                Thread.sleep(intervalMs);

            } catch (HttpClientErrorException | HttpServerErrorException ex) {
                log.error("Judge0 HTTP error on poll (attempt {}/{}): {} — {}",
                        attempt, maxAttempts, ex.getStatusCode(), ex.getResponseBodyAsString());
                throw new Judge0ExecutionException("Judge0 poll failed: " + ex.getStatusCode(), ex);
            } catch (ResourceAccessException ex) {
                log.error("Cannot reach Judge0 during poll: {}", ex.getMessage());
                throw new Judge0ExecutionException("Cannot reach Judge0 during polling", ex);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new Judge0ExecutionException("Polling interrupted for token=" + judge0Token, ex);
            }
        }

        throw new Judge0ExecutionException(
                "Judge0 polling timed out after " + maxAttempts + " attempts for token=" + judge0Token);
    }

    // -----------------------------------------------------------------------
    // Backward-compatible raw-Map methods (delegate to typed methods)
    // -----------------------------------------------------------------------

    /**
     * {@inheritDoc}
     *
     * <p>Delegates to {@link #submit(String, int, String, String)} after resolving
     * the language name to a Judge0 language ID.
     */
    @Override
    public String submitCode(String sourceCode, String language, String stdin) {
        int languageId = Judge0Language.toJudge0Id(language);
        if (languageId == -1) {
            throw new Judge0ExecutionException("Unsupported language: " + language);
        }
        return submit(sourceCode, languageId, stdin, null).getToken();
    }

    /**
     * {@inheritDoc}
     *
     * <p>Delegates to {@link #pollUntilDone(String)} and converts the typed response
     * to a raw map using Jackson for backward compatibility with any caller relying
     * on the original {@link CodeExecutionService#getResult(String)} contract.
     */
    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> getResult(String judge0Token) {
        Judge0SubmissionResponse response = pollUntilDone(judge0Token);
        // Convert via ObjectMapper to maintain exact JSON field names
        return objectMapper.convertValue(response, new TypeReference<Map<String, Object>>() {});
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
        return headers;
    }
}
