package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.InterviewSession;
import com.hirecraft.backend.enums.InterviewStatus;
import com.hirecraft.backend.enums.InterviewType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    List<InterviewSession> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    List<InterviewSession> findByUserUserIdAndInterviewType(Long userId, InterviewType type);

    List<InterviewSession> findByUserUserIdAndStatus(Long userId, InterviewStatus status);

    Optional<InterviewSession> findBySessionIdentifier(String sessionIdentifier);
}
