package com.hirecraft.backend.service;

import com.hirecraft.backend.entity.AiMemoryItem;
import com.hirecraft.backend.enums.MemoryCategory;
import com.hirecraft.backend.enums.MemoryType;
import java.util.List;

public interface AiMemoryService {
    List<AiMemoryItem> getMemoryForUser(Long userId);
    
    // Updates the memory for a category, tracking historical progress
    void updateMemoryGraph(Long userId, MemoryCategory category, MemoryType type, String key, int score, String feedback);
    
    // Saves simple key-value memory data (e.g. for resume extraction)
    void saveInitialMemory(Long userId, MemoryCategory category, MemoryType type, String key, String value);
}
