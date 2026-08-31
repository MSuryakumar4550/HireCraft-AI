package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.ReadinessSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ReadinessSnapshotRepository extends JpaRepository<ReadinessSnapshot, Long> {

    List<ReadinessSnapshot> findByUserUserIdOrderBySnapshotAtDesc(Long userId);

    Optional<ReadinessSnapshot> findFirstByUserUserIdOrderBySnapshotAtDesc(Long userId);
}
