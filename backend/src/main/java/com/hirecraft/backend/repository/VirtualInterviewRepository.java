package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.VirtualInterview;
import com.hirecraft.backend.enums.VirtualInterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VirtualInterviewRepository extends JpaRepository<VirtualInterview, UUID> {

    List<VirtualInterview> findByUserUserId(UUID userId);

    List<VirtualInterview> findByUserUserIdAndStatus(UUID userId, VirtualInterviewStatus status);
}
