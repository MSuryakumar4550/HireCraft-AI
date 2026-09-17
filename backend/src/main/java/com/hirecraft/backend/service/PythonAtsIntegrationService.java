package com.hirecraft.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirecraft.backend.dto.response.PythonAtsResponseDto;
import com.hirecraft.backend.dto.response.ParsedJdDto;
import com.hirecraft.backend.dto.response.ParsedResumeDto;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.enums.MemoryCategory;
import com.hirecraft.backend.enums.MemoryType;
import com.hirecraft.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PythonAtsIntegrationService {

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final JdParserService jdParserService;
    private final ResumeParserService resumeParserService;
    private final AiMemoryService aiMemoryService;
    
    @Value("${hirecraft.ats.service.url:https://msuryakumar-hirecraft-ats-scorer.hf.space/score-resume/}")
    private String pythonAtsUrl;

    public PythonAtsIntegrationService(RestTemplate restTemplate, UserRepository userRepository, JdParserService jdParserService, ResumeParserService resumeParserService, AiMemoryService aiMemoryService) {
        this.restTemplate = restTemplate;
        this.userRepository = userRepository;
        this.jdParserService = jdParserService;
        this.resumeParserService = resumeParserService;
        this.aiMemoryService = aiMemoryService;
    }

    @Transactional
    public PythonAtsResponseDto scoreResume(MultipartFile resumeFile, String jobDescription, String requiredSkills, Long userId) throws IOException {
        
        if (requiredSkills == null || requiredSkills.trim().isEmpty()) {
            if (jobDescription != null && !jobDescription.trim().isEmpty()) {
                ParsedJdDto parsedJd = jdParserService.parseJd(jobDescription);
                if (parsedJd != null && parsedJd.getRequiredSkills() != null) {
                    requiredSkills = String.join(", ", parsedJd.getRequiredSkills());
                }
            }
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        
        ByteArrayResource fileResource = new ByteArrayResource(resumeFile.getBytes()) {
            @Override
            public String getFilename() {
                return resumeFile.getOriginalFilename();
            }
        };

        body.add("resume_file", fileResource);
        body.add("job_description", jobDescription);
        body.add("required_skills", requiredSkills != null ? requiredSkills : "");
        
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        
        ResponseEntity<PythonAtsResponseDto> response = restTemplate.postForEntity(
                pythonAtsUrl, 
                requestEntity, 
                PythonAtsResponseDto.class
        );
        
        PythonAtsResponseDto atsResponse = response.getBody();
        
        if (atsResponse != null && userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
                    
            if (atsResponse.getFinalAtsScore() != null) {
                user.setResumeAtsScore(BigDecimal.valueOf(atsResponse.getFinalAtsScore()).setScale(2, RoundingMode.HALF_UP));
            }
            
            try {
                String analysisJson = objectMapper.writeValueAsString(atsResponse);
                user.setResumeAnalysis(analysisJson);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize ATS response", e);
            }
            
            userRepository.save(user);

            // Populate AI Memory automatically using the extracted text and our NLP parser!
            if (atsResponse.getBreakdown() != null && atsResponse.getBreakdown().getTextTheAiRead() != null) {
                try {
                    ParsedResumeDto parsedResume = resumeParserService.parseResume(atsResponse.getBreakdown().getTextTheAiRead());
                    if (parsedResume != null) {
                        if (parsedResume.getSkills() != null) {
                            for (String skill : parsedResume.getSkills()) {
                                aiMemoryService.saveInitialMemory(userId, MemoryCategory.RESUME, MemoryType.SKILL, skill, "from resume");
                            }
                        }
                        if (parsedResume.getExperience() != null) {
                            for (ParsedResumeDto.Experience exp : parsedResume.getExperience()) {
                                aiMemoryService.saveInitialMemory(userId, MemoryCategory.RESUME, MemoryType.EXPERIENCE, exp.getJobTitle(), exp.getCompany() + " - " + exp.getDescription());
                            }
                        }
                        if (parsedResume.getEducation() != null) {
                            for (ParsedResumeDto.Education edu : parsedResume.getEducation()) {
                                aiMemoryService.saveInitialMemory(userId, MemoryCategory.RESUME, MemoryType.EDUCATION, edu.getDegree(), edu.getInstitution() + " - " + edu.getGraduationYear());
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Failed to automatically populate AI Memory: " + e.getMessage());
                }
            }
        }
        
        return atsResponse;
    }
}
