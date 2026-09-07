package com.hirecraft.backend.config;

import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class FixSchemaRunner implements CommandLineRunner {

    @Autowired
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            log.info("Running schema fix for aptitude_assessments...");
            entityManager.createNativeQuery("ALTER TABLE aptitude_assessments ALTER COLUMN virtual_interview_id DROP NOT NULL").executeUpdate();
            log.info("Successfully dropped NOT NULL constraint on virtual_interview_id");
        } catch (Exception e) {
            log.warn("Could not alter virtual_interview_id column: {}", e.getMessage());
        }
        
        try {
            log.info("Running schema fix for interview_answers...");
            entityManager.createNativeQuery("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS evaluation_score NUMERIC(5,2)").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS question_id VARCHAR(100)").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS expected_topic VARCHAR(100)").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50)").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ DEFAULT NOW()").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE interview_answers ALTER COLUMN created_at DROP NOT NULL").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE interview_answers ALTER COLUMN answered_at DROP NOT NULL").executeUpdate();
            log.info("Successfully patched interview_answers columns");
        } catch (Exception e) {
            log.warn("Could not patch interview_answers columns: {}", e.getMessage());
        }
    }
}
