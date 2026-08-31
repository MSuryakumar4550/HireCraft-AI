package com.hirecraft.backend.controller;

import com.hirecraft.backend.entity.AiMemoryItem;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.AiMemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/memory")
@RequiredArgsConstructor
public class AiMemoryController {

    private final AiMemoryService aiMemoryService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<AiMemoryItem>> getAiMemory(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<AiMemoryItem> memoryItems = aiMemoryService.getMemoryForUser(user.getUserId());
        return ResponseEntity.ok(memoryItems);
    }
}
