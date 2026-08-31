package com.hirecraft.backend;

import com.hirecraft.backend.dto.request.SaveAptitudeScoreRequest;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.AptitudeAssessmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

@SpringBootTest
class SaveScoreTest {

    @Autowired
    private AptitudeAssessmentService assessmentService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveScore() {
        System.out.println("Starting testSaveScore...");
        try {
            User user = userRepository.findAll().stream().findFirst().orElseThrow();
            SaveAptitudeScoreRequest req = new SaveAptitudeScoreRequest();
            req.setScore(10);
            req.setTotalQuestions(15);
            req.setAccuracy(new BigDecimal("66.67"));
            
            assessmentService.saveScore(user.getUserId(), req);
            System.out.println("SAVE SCORE SUCCESSFUL!");
        } catch (Exception e) {
            System.err.println("SAVE SCORE FAILED: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
