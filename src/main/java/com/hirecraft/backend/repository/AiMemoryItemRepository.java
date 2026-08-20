package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.AiMemoryItem;
import com.hirecraft.backend.enums.MemoryCategory;
import com.hirecraft.backend.enums.MemoryType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AiMemoryItemRepository extends JpaRepository<AiMemoryItem, UUID> {

    List<AiMemoryItem> findByUserUserIdAndIsActiveTrue(UUID userId);

    List<AiMemoryItem> findByUserUserIdAndMemoryTypeAndIsActiveTrue(UUID userId, MemoryType memoryType);

    List<AiMemoryItem> findByUserUserIdAndCategoryAndIsActiveTrue(UUID userId, MemoryCategory category);
}
