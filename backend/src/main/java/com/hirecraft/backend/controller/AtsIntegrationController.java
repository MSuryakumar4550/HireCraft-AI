package com.hirecraft.backend.controller;

import com.hirecraft.backend.dto.response.PythonAtsResponseDto;
import com.hirecraft.backend.service.PythonAtsIntegrationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/ats")
public class AtsIntegrationController {

    private final PythonAtsIntegrationService pythonAtsIntegrationService;

    public AtsIntegrationController(PythonAtsIntegrationService pythonAtsIntegrationService) {
        this.pythonAtsIntegrationService = pythonAtsIntegrationService;
    }

    @PostMapping(value = "/python-score", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PythonAtsResponseDto> scoreResume(
            @RequestParam("resume_file") MultipartFile resumeFile,
            @RequestParam(value = "job_description", required = false) String jobDescription,
            @RequestParam(value = "required_skills", required = false) String requiredSkills,
            @RequestParam("user_id") Long userId) {
        try {
            PythonAtsResponseDto response = pythonAtsIntegrationService.scoreResume(resumeFile, jobDescription, requiredSkills, userId);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        } catch (RuntimeException e) {
            System.err.println("Exception in AtsIntegrationController.scoreResume: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
