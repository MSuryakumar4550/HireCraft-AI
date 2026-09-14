package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.Evaluation;
import com.hirecraft.backend.enums.EvaluationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    List<Evaluation> findByUserUserIdAndEvaluationType(Long userId, EvaluationType evaluationType);

    Optional<Evaluation> findByCodingAssessmentCodingAssessmentId(UUID codingAssessmentId);

    Optional<Evaluation> findByAptitudeAssessmentAptitudeAssessmentId(Long aptitudeAssessmentId);

    Optional<Evaluation> findByInterviewSessionInterviewSessionId(Long interviewSessionId);

    Optional<Evaluation> findByVirtualInterviewVirtualInterviewId(Long virtualInterviewId);
}
