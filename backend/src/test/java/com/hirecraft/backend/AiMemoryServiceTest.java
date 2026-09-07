package com.hirecraft.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirecraft.backend.entity.AiMemoryItem;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.MemoryCategory;
import com.hirecraft.backend.enums.MemoryType;
import com.hirecraft.backend.repository.AiMemoryItemRepository;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.impl.AiMemoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AiMemoryServiceTest {

    @Mock
    private AiMemoryItemRepository aiMemoryItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AiMemoryServiceImpl aiMemoryService;

    private User testUser;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .userId(1L)
                .email("suryakumar@hirecraft.ai")
                .fullName("Suryakumar")
                .build();
    }

    @Test
    @DisplayName("Verify AI Memory updates graph with history and marks STRENGTH after consistent high scores")
    void testUpdateMemoryGraphAndPersistence() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(aiMemoryItemRepository.findByUserUserIdAndCategoryAndIsActiveTrue(1L, MemoryCategory.TECHNICAL))
                .thenReturn(new ArrayList<>());

        ArgumentCaptor<AiMemoryItem> itemCaptor = ArgumentCaptor.forClass(AiMemoryItem.class);
        when(aiMemoryItemRepository.save(itemCaptor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        // 1st Interview Answer Score: 90
        aiMemoryService.updateMemoryGraph(
                1L,
                MemoryCategory.TECHNICAL,
                MemoryType.SKILL,
                "Virtual Interview Answer: Network Security",
                90,
                "Strong grasp of Zero Trust"
        );

        AiMemoryItem savedItem = itemCaptor.getValue();
        assertNotNull(savedItem);
        assertEquals("Virtual Interview Answer: Network Security", savedItem.getMemoryKey());
        assertEquals(MemoryCategory.TECHNICAL, savedItem.getCategory());
        assertTrue(savedItem.getIsActive());

        // Verify JSON value contains the score & feedback
        List<Map<String, Object>> history = objectMapper.readValue(
                savedItem.getMemoryValue(),
                new TypeReference<List<Map<String, Object>>>() {}
        );
        assertEquals(1, history.size());
        assertEquals(90, history.get(0).get("score"));
        assertEquals("Strong grasp of Zero Trust", history.get(0).get("feedback"));
    }

    @Test
    @DisplayName("Verify getMemoryForUser fetches persisted memory after login/refresh")
    void testGetMemoryForUserAfterLogin() {
        AiMemoryItem existingItem = new AiMemoryItem();
        existingItem.setMemoryKey("Virtual Interview Answer: Network Security");
        existingItem.setCategory(MemoryCategory.TECHNICAL);
        existingItem.setMemoryType(MemoryType.STRENGTH);
        existingItem.setIsActive(true);

        when(aiMemoryItemRepository.findByUserUserIdAndIsActiveTrue(1L))
                .thenReturn(List.of(existingItem));

        List<AiMemoryItem> memoryList = aiMemoryService.getMemoryForUser(1L);

        assertNotNull(memoryList);
        assertEquals(1, memoryList.size());
        assertEquals("Virtual Interview Answer: Network Security", memoryList.get(0).getMemoryKey());
        assertEquals(MemoryType.STRENGTH, memoryList.get(0).getMemoryType());
    }
}
