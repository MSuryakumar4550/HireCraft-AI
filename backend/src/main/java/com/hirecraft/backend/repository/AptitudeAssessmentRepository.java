package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.AptitudeAssessment;
import com.hirecraft.backend.enums.AssessmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AptitudeAssessmentRepository extends JpaRepository<AptitudeAssessment, Long> {

    List<AptitudeAssessment> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    List<AptitudeAssessment> findByUserUserIdAndStatus(Long userId, AssessmentStatus status);
}
