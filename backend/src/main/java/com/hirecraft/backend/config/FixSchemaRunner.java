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
            entityManager.createNativeQuery("ALTER TABLE aptitude_assessments ALTER COLUMN score TYPE NUMERIC(5,2)").executeUpdate();
            log.info("Successfully altered score column to NUMERIC");
        } catch (Exception e) {
            log.warn("Could not alter score column: {}", e.getMessage());
        }
    }
}
