package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.Evaluation;
import com.hirecraft.backend.enums.EvaluationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EvaluationRepository extends JpaRepository<Evaluation, UUID> {

    List<Evaluation> findByUserUserIdOrderByCreatedAtDesc(UUID userId);

    List<Evaluation> findByUserUserIdAndEvaluationType(UUID userId, EvaluationType evaluationType);

    Optional<Evaluation> findByCodingAssessmentCodingAssessmentId(UUID codingAssessmentId);

    Optional<Evaluation> findByAptitudeAssessmentAptitudeAssessmentId(UUID aptitudeAssessmentId);

    Optional<Evaluation> findByInterviewSessionInterviewSessionId(UUID interviewSessionId);

    Optional<Evaluation> findByVirtualInterviewVirtualInterviewId(UUID virtualInterviewId);
}
