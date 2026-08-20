package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.AptitudeAssessment;
import com.hirecraft.backend.enums.AssessmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AptitudeAssessmentRepository extends JpaRepository<AptitudeAssessment, UUID> {

    List<AptitudeAssessment> findByUserUserIdOrderByCreatedAtDesc(UUID userId);

    List<AptitudeAssessment> findByUserUserIdAndStatus(UUID userId, AssessmentStatus status);
}
