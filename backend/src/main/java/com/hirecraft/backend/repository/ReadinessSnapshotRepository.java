package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.ReadinessSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReadinessSnapshotRepository extends JpaRepository<ReadinessSnapshot, UUID> {

    List<ReadinessSnapshot> findByUserUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<ReadinessSnapshot> findFirstByUserUserIdOrderByCreatedAtDesc(UUID userId);
}
