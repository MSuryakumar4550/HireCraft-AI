package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.InterviewSession;
import com.hirecraft.backend.enums.InterviewStatus;
import com.hirecraft.backend.enums.InterviewType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {

    List<InterviewSession> findByUserUserIdOrderByCreatedAtDesc(UUID userId);

    List<InterviewSession> findByUserUserIdAndInterviewType(UUID userId, InterviewType type);

    List<InterviewSession> findByUserUserIdAndStatus(UUID userId, InterviewStatus status);

    Optional<InterviewSession> findBySessionIdentifier(String sessionIdentifier);
}
