package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.VirtualInterviewStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VirtualInterviewStageRepository extends JpaRepository<VirtualInterviewStage, UUID> {

    List<VirtualInterviewStage> findByVirtualInterviewVirtualInterviewIdOrderByStageOrder(UUID virtualInterviewId);
}
