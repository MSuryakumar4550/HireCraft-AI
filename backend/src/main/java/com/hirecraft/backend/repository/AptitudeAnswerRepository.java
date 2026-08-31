package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.AptitudeAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AptitudeAnswerRepository extends JpaRepository<AptitudeAnswer, Long> {

    List<AptitudeAnswer> findByAptitudeAssessmentAptitudeAssessmentId(Long aptitudeAssessmentId);
    List<AptitudeAnswer> findByAptitudeAssessmentUserUserId(Long userId);
}
