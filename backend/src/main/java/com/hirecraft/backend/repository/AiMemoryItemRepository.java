package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.AiMemoryItem;
import com.hirecraft.backend.enums.MemoryCategory;
import com.hirecraft.backend.enums.MemoryType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AiMemoryItemRepository extends JpaRepository<AiMemoryItem, Long> {

    List<AiMemoryItem> findByUserUserIdAndIsActiveTrue(Long userId);

    List<AiMemoryItem> findByUserUserIdAndMemoryTypeAndIsActiveTrue(Long userId, MemoryType memoryType);

    List<AiMemoryItem> findByUserUserIdAndCategoryAndIsActiveTrue(Long userId, MemoryCategory category);
}
