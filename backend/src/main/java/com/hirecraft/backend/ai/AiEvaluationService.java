package com.hirecraft.backend.ai;

import java.util.List;
import java.util.Map;

/**
 * AI evaluation service abstraction.
 * <p>
 * The concrete implementation will use Spring AI with Google Gemini (gemini-2.5-flash).
 * AI evaluation includes scoring, feedback generation, strengths/weaknesses analysis.
 * <p>
 * Gemini bean is already configured via Spring AI in application.properties.
 * Business evaluation logic will be implemented per module in a future phase.
 */
public interface AiEvaluationService {

    /**
     * Evaluates interview answers and returns structured feedback.
     *
     * @param context   Evaluation context (interview type, user profile)
     * @param answers   List of question-answer pairs
     * @return          Structured evaluation result
     */
    Map<String, Object> evaluateInterviewAnswers(Map<String, Object> context, List<Map<String, String>> answers);

    /**
     * Analyzes a resume text and returns ATS score and feedback.
     */
    Map<String, Object> analyzeResume(String resumeText, String targetRole);
}
