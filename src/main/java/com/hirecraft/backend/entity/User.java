package com.hirecraft.backend.entity;

import com.hirecraft.backend.enums.AccountStatus;
import com.hirecraft.backend.enums.ExperienceLevel;
import com.hirecraft.backend.enums.ResumeProcessingStatus;
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
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false, length = 20)
    private AccountStatus accountStatus;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(name = "college_name", length = 255)
    private String collegeName;

    @Column(name = "degree", length = 100)
    private String degree;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "cgpa", precision = 4, scale = 2)
    private BigDecimal cgpa;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 20)
    private ExperienceLevel experienceLevel;

    @Column(name = "target_role", length = 255)
    private String targetRole;

    @Column(name = "career_interests", columnDefinition = "TEXT")
    private String careerInterests;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;

    // Resume metadata — stored inline per DATABASE.md design decision
    @Column(name = "resume_filename", length = 500)
    private String resumeFilename;

    @Column(name = "resume_storage_provider", length = 50)
    private String resumeStorageProvider;

    @Column(name = "resume_storage_bucket", length = 255)
    private String resumeStorageBucket;

    @Column(name = "resume_object_key", length = 1000)
    private String resumeObjectKey;

    @Column(name = "resume_mime_type", length = 100)
    private String resumeMimeType;

    @Column(name = "resume_file_size")
    private Long resumeFileSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "resume_processing_status", length = 20)
    private ResumeProcessingStatus resumeProcessingStatus;

    @Column(name = "resume_ats_score")
    private Integer resumeAtsScore;

    @Column(name = "resume_analysis", columnDefinition = "TEXT")
    private String resumeAnalysis;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
