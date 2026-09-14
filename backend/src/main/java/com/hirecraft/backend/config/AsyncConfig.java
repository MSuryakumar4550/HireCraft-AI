package com.hirecraft.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Enables Spring's {@code @Async} support and configures a dedicated thread pool
 * for background tasks such as Judge0 polling.
 *
 * <p>Using a named executor ("judge0Executor") keeps Judge0 I/O work isolated from
 * the web worker threads and makes it straightforward to tune pool size without
 * affecting other async tasks in the future.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Thread pool dedicated to Judge0 polling tasks.
     *
     * <p>Sizing rationale:
     * <ul>
     *   <li>Core size 4 — allows 4 submissions to be polled concurrently at rest.</li>
     *   <li>Max size 20 — handles bursts (e.g. many candidates submitting at once).</li>
     *   <li>Queue 100 — buffers requests when all threads are busy.</li>
     * </ul>
     */
    @Bean(name = "judge0Executor")
    public Executor judge0Executor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("judge0-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
