package com.hirecraft.backend;

import com.hirecraft.backend.dto.InterviewQuestion;
import com.hirecraft.backend.service.QuestionBankService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class QuestionBankServiceTest {

    private QuestionBankService questionBankService;

    @BeforeEach
    void setUp() {
        questionBankService = new QuestionBankService(new DefaultResourceLoader());
        questionBankService.init();
    }

    @Test
    void testQuestionBankLoadsAllSubjectsFromJSON() {
        // 1. Core Subjects
        assertSubjectLoaded("Operating Systems", "OPERATING_SYSTEMS");
        assertSubjectLoaded("DBMS", "DATABASE_MANAGEMENT_SYSTEMS");
        assertSubjectLoaded("Computer Networks", "COMPUTER_NETWORKS");
        assertSubjectLoaded("OOP", "OOPS_DATA_STRUCTURES");

        // 2. Technical Interview Domains
        assertSubjectLoaded("System Design", "SYSTEM_DESIGN");
        assertSubjectLoaded("Backend Engineering", "BACKEND_DEVELOPMENT");
        assertSubjectLoaded("Cloud & Infrastructure", "DEVOPS_CLOUD");
        assertSubjectLoaded("API Security & Design", "SECURITY_APIS");

        // 3. Behavioral Competency Tracks
        assertSubjectLoaded("Leadership & Initiative", "LEADERSHIP_INITIATIVE");
        assertSubjectLoaded("Teamwork & Conflict Resolution", "TEAMWORK_CONFLICT");
        assertSubjectLoaded("Problem Solving & Adaptability", "PROBLEM_SOLVING_ADAPTABILITY");
        assertSubjectLoaded("Goal Achievement & Impact", "GOAL_ACHIEVEMENT");
    }

    private void assertSubjectLoaded(String canonicalSubject, String rawFrontendId) {
        List<String> canonicalTopics = questionBankService.getAvailableTopics(canonicalSubject);
        assertFalse(canonicalTopics.isEmpty(), canonicalSubject + " topics should not be empty");

        InterviewQuestion q = questionBankService.getNextQuestion(canonicalSubject, canonicalTopics.get(0), "MEDIUM", List.of());
        assertNotNull(q, "Should find a question for " + canonicalSubject + " first topic");

        List<String> normalizedTopics = questionBankService.getAvailableTopics(rawFrontendId);
        assertEquals(canonicalTopics, normalizedTopics, rawFrontendId + " key should normalize to " + canonicalSubject);
    }
}
