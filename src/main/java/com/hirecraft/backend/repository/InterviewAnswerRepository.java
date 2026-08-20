package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, UUID> {

    List<InterviewAnswer> findByInterviewSessionInterviewSessionIdOrderByQuestionNo(UUID interviewSessionId);
}
