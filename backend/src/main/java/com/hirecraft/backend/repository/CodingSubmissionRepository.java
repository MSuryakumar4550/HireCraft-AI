package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {

    List<CodingSubmission> findByCodingAssessmentCodingAssessmentIdOrderBySubmissionNumber(Long codingAssessmentId);

    Optional<CodingSubmission> findByJudge0Token(String judge0Token);

    List<CodingSubmission> findByCodingAssessmentUserUserId(Long userId);
}
