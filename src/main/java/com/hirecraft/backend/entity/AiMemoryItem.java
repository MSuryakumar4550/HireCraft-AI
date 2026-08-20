package com.hirecraft.backend.entity;

import com.hirecraft.backend.enums.MemoryCategory;
import com.hirecraft.backend.enums.MemoryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_memory_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMemoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "memory_id", nullable = false, updatable = false)
    private UUID memoryId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "memory_type", nullable = false, length = 20)
    private MemoryType memoryType;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private MemoryCategory category;

    @Column(name = "memory_key", nullable = false, length = 255)
    private String memoryKey;

    @Column(name = "memory_value", columnDefinition = "TEXT")
    private String memoryValue;

    @Column(name = "confidence_score", precision = 4, scale = 3)
    private BigDecimal confidenceScore;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
