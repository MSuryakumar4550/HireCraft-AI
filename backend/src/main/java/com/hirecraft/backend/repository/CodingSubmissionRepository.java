package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, UUID> {

    List<CodingSubmission> findByCodingAssessmentCodingAssessmentIdOrderBySubmissionNumber(UUID codingAssessmentId);

    Optional<CodingSubmission> findByJudge0Token(String judge0Token);
}
