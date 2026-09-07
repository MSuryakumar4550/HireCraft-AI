package com.hirecraft.backend;

import com.hirecraft.backend.dto.EvaluationResult;
import com.hirecraft.backend.dto.InterviewQuestion;
import com.hirecraft.backend.service.InterviewEvaluatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class InterviewEvaluatorServiceTest {

    private InterviewEvaluatorService evaluatorService;
    private InterviewQuestion question;

    @BeforeEach
    void setUp() {
        evaluatorService = new InterviewEvaluatorService();

        question = new InterviewQuestion();
        question.setId("DBMS-213");
        question.setQuestion("What is a database slow query log, and how does setting long_query_time thresholds help detect regressions?");
        question.setSubject("DBMS");
        question.setTopic("Database Monitoring");
        question.setDifficulty("EASY");
        question.setConcepts(List.of("slow query log", "long_query_time", "performance regression", "unindexed queries", "query profiling"));
        question.setCriteria(List.of(
            "defines slow query log: a diagnostic log file recording executed SQL queries exceeding long_query_time threshold",
            "explains parameters recorded: execution duration, lock wait time, rows examined",
            "identifies unindexed queries",
            "explains how monitoring tools aggregate slow query logs"
        ));
    }

    @Test
    @DisplayName("Verify 'no idea' or 'don't know' gets 0.0 score and refusal feedback")
    void testRefusalEvaluation() {
        EvaluationResult res1 = evaluatorService.evaluateAnswer("no idea", question);
        assertNotNull(res1);
        assertEquals(0, res1.getScore().compareTo(BigDecimal.valueOf(0.0)));
        assertTrue(res1.getFeedback().contains("No substantive technical answer provided"));
        assertTrue(res1.getFeedback().contains("slow query log"));

        EvaluationResult res2 = evaluatorService.evaluateAnswer("don't know", question);
        assertEquals(0, res2.getScore().compareTo(BigDecimal.valueOf(0.0)));
        assertTrue(res2.getFeedback().contains("don't know"));
    }

    @Test
    @DisplayName("Verify partial answer gets realistic low score and missing concepts breakdown")
    void testPartialAnswerEvaluation() {
        String partialAnswer = "if we give the query in non efficient way then it is considered as slow query log";
        EvaluationResult result = evaluatorService.evaluateAnswer(partialAnswer, question);

        assertNotNull(result);
        // Should NOT be hardcoded 5.0! Should be a low score reflecting partial concept match
        assertTrue(result.getScore().compareTo(BigDecimal.valueOf(4.0)) < 0, "Partial answer score should be < 4.0, got: " + result.getScore());
        assertTrue(result.getFeedback().contains("Covered concepts: slow query log"));
        assertTrue(result.getFeedback().contains("Missing core technical concepts"));
    }

    @Test
    @DisplayName("Verify strong comprehensive answer receives high score")
    void testStrongAnswerEvaluation() {
        String strongAnswer = "A slow query log is a diagnostic database log that captures SQL queries exceeding a configurable execution threshold specified by long_query_time. "
                + "It logs parameters including execution duration, lock wait time, and rows examined to detect performance regression and unindexed queries. "
                + "Monitoring tools like pt-query-digest aggregate these logs to identify top queries causing bottlenecks.";

        EvaluationResult result = evaluatorService.evaluateAnswer(strongAnswer, question);

        assertNotNull(result);
        assertTrue(result.getScore().compareTo(BigDecimal.valueOf(7.0)) >= 0, "Strong answer score should be >= 7.0, got: " + result.getScore());
        assertTrue(result.getFeedback().contains("Covered concepts"));
    }
}
