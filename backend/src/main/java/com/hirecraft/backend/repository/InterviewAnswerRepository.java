package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, Long> {

    List<InterviewAnswer> findByInterviewSessionInterviewSessionIdOrderByQuestionNo(Long interviewSessionId);
}
