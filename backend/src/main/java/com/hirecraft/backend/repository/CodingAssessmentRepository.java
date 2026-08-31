package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.CodingAssessment;
import com.hirecraft.backend.enums.AssessmentMode;
import com.hirecraft.backend.enums.AssessmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface CodingAssessmentRepository extends JpaRepository<CodingAssessment, Long> {

    List<CodingAssessment> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    List<CodingAssessment> findByUserUserIdAndAssessmentMode(Long userId, AssessmentMode mode);

    List<CodingAssessment> findByUserUserIdAndStatus(Long userId, AssessmentStatus status);
}
