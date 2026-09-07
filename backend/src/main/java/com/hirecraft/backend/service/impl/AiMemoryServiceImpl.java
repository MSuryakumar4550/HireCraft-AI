package com.hirecraft.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirecraft.backend.entity.AiMemoryItem;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.MemoryCategory;
import com.hirecraft.backend.enums.MemoryType;
import com.hirecraft.backend.repository.AiMemoryItemRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.AiMemoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiMemoryServiceImpl implements AiMemoryService {

    private final AiMemoryItemRepository aiMemoryItemRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.hirecraft.backend.repository.InterviewSessionRepository interviewSessionRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.hirecraft.backend.repository.InterviewAnswerRepository interviewAnswerRepository;

    @Override
    public List<AiMemoryItem> getMemoryForUser(Long userId) {
        List<AiMemoryItem> items = aiMemoryItemRepository.findByUserUserIdAndIsActiveTrue(userId);
        if ((items == null || items.isEmpty()) && interviewSessionRepository != null && interviewAnswerRepository != null) {
            try {
                List<com.hirecraft.backend.entity.InterviewSession> sessions = 
                        interviewSessionRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
                for (com.hirecraft.backend.entity.InterviewSession session : sessions) {
                    if (session.getStatus() == com.hirecraft.backend.enums.InterviewStatus.COMPLETED) {
                        int finalScore = session.getTotalScore() != null ? session.getTotalScore().intValue() : 0;
                        updateMemoryGraph(
                                userId,
                                MemoryCategory.TECHNICAL,
                                finalScore >= 70 ? MemoryType.STRENGTH : MemoryType.WEAKNESS,
                                (session.getSubject() != null ? session.getSubject() : "Technical") + " Mock Interview",
                                finalScore,
                                "Completed technical interview with overall score " + finalScore + "/100."
                        );

                        List<com.hirecraft.backend.entity.InterviewAnswer> answers =
                                interviewAnswerRepository.findByInterviewSessionInterviewSessionIdOrderByQuestionNo(session.getInterviewSessionId());
                        for (com.hirecraft.backend.entity.InterviewAnswer ans : answers) {
                            if (ans.getEvaluationScore() != null) {
                                int ansScore = ans.getEvaluationScore().multiply(java.math.BigDecimal.TEN).intValue();
                                String topic = ans.getExpectedTopic() != null ? ans.getExpectedTopic() : "Core Technical Concepts";
                                updateMemoryGraph(
                                        userId,
                                        MemoryCategory.TECHNICAL,
                                        ansScore >= 70 ? MemoryType.STRENGTH : MemoryType.WEAKNESS,
                                        topic,
                                        ansScore,
                                        (ans.getEvaluationFeedback() != null && !ans.getEvaluationFeedback().isBlank())
                                                ? ans.getEvaluationFeedback()
                                                : "Candidate evaluation for " + topic
                                );
                            }
                        }
                    }
                }
                items = aiMemoryItemRepository.findByUserUserIdAndIsActiveTrue(userId);
            } catch (Exception e) {
                log.warn("Could not backfill memory items: {}", e.getMessage());
            }
        }
        return items != null ? items : new ArrayList<>();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void updateMemoryGraph(Long userId, MemoryCategory category, MemoryType type, String key, int score, String feedback) {
        try {
            List<AiMemoryItem> existingItems = aiMemoryItemRepository.findByUserUserIdAndCategoryAndIsActiveTrue(userId, category);
            
            AiMemoryItem memoryItem = existingItems.stream()
                .filter(item -> item.getMemoryKey().equals(key))
                .findFirst()
                .orElse(null);

            List<Map<String, Object>> history = new ArrayList<>();
            
            if (memoryItem != null) {
                if (memoryItem.getMemoryValue() != null && !memoryItem.getMemoryValue().isEmpty()) {
                    try {
                        history = objectMapper.readValue(memoryItem.getMemoryValue(), new TypeReference<List<Map<String, Object>>>() {});
                    } catch (JsonProcessingException e) {
                        log.warn("Could not parse existing memory history for key: {}", key);
                    }
                }
            } else {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                    
                memoryItem = new AiMemoryItem();
                memoryItem.setUser(user);
                memoryItem.setCategory(category);
                memoryItem.setMemoryType(type);
                memoryItem.setMemoryKey(key);
                memoryItem.setIsActive(true);
            }

            // Create new data point
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("timestamp", LocalDateTime.now().toString());
            dataPoint.put("score", score);
            dataPoint.put("feedback", feedback);
            
            history.add(dataPoint);
            
            // Keep last 10 data points
            if (history.size() > 10) {
                history = history.subList(history.size() - 10, history.size());
            }

            memoryItem.setMemoryValue(objectMapper.writeValueAsString(history));
            
            // Update type if it shifted (e.g. they improved)
            if (history.size() >= 3) {
                double avgScore = history.stream().mapToInt(h -> {
                    Object s = h.get("score");
                    return (s instanceof Number) ? ((Number) s).intValue() : 0;
                }).average().orElse(0.0);

                if (avgScore >= 75) {
                    memoryItem.setMemoryType(MemoryType.STRENGTH);
                } else if (avgScore <= 40) {
                    memoryItem.setMemoryType(MemoryType.WEAKNESS);
                }
            } else {
                memoryItem.setMemoryType(type);
            }

            aiMemoryItemRepository.save(memoryItem);
            
        } catch (Exception e) {
            log.error("Failed to update AI Memory Graph: {}", e.getMessage());
        }
    }

    @Override
    public void saveInitialMemory(Long userId, MemoryCategory category, MemoryType type, String key, String value) {
        try {
            List<AiMemoryItem> existingItems = aiMemoryItemRepository.findByUserUserIdAndCategoryAndIsActiveTrue(userId, category);
            
            AiMemoryItem memoryItem = existingItems.stream()
                .filter(item -> item.getMemoryKey().equals(key))
                .findFirst()
                .orElse(null);

            if (memoryItem == null) {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                    
                memoryItem = new AiMemoryItem();
                memoryItem.setUser(user);
                memoryItem.setCategory(category);
                memoryItem.setMemoryType(type);
                memoryItem.setMemoryKey(key);
                memoryItem.setIsActive(true);
            } else {
                memoryItem.setMemoryType(type); // update type just in case
            }

            // Wrap the raw string value into the JSON history format the frontend expects
            List<Map<String, Object>> history = new ArrayList<>();
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("timestamp", LocalDateTime.now().toString());
            dataPoint.put("score", 100);
            dataPoint.put("feedback", value);
            history.add(dataPoint);

            memoryItem.setMemoryValue(objectMapper.writeValueAsString(history));
            aiMemoryItemRepository.save(memoryItem);
            
        } catch (Exception e) {
            log.error("Failed to save initial AI Memory: {}", e.getMessage());
        }
    }
}
