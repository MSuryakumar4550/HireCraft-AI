package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.VirtualInterview;
import com.hirecraft.backend.enums.VirtualInterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface VirtualInterviewRepository extends JpaRepository<VirtualInterview, Long> {

    List<VirtualInterview> findByUserUserId(Long userId);

    List<VirtualInterview> findByUserUserIdAndStatus(Long userId, VirtualInterviewStatus status);
}
