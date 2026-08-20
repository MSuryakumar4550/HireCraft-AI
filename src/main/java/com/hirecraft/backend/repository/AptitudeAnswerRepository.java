package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.AptitudeAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AptitudeAnswerRepository extends JpaRepository<AptitudeAnswer, UUID> {

    List<AptitudeAnswer> findByAptitudeAssessmentAptitudeAssessmentId(UUID aptitudeAssessmentId);
}
