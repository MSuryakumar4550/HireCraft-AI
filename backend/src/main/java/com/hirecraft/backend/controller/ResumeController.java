package com.hirecraft.backend.controller;

import com.hirecraft.backend.dto.response.UserProfileResponse;
import com.hirecraft.backend.entity.User;
import com.hirecraft.backend.exception.InvalidFileException;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.UserRepository;
import com.hirecraft.backend.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirecraft.backend.dto.response.ParsedResumeDto;
import com.hirecraft.backend.dto.response.ParsedJdDto;
import com.hirecraft.backend.dto.response.AtsScoreDto;
import com.hirecraft.backend.service.ResumeParserService;
import com.hirecraft.backend.service.JdParserService;
import com.hirecraft.backend.service.AtsMatchingService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import com.hirecraft.backend.service.StorageService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;

import com.hirecraft.backend.service.AiMemoryService;
import com.hirecraft.backend.enums.MemoryCategory;
import com.hirecraft.backend.enums.MemoryType;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final com.hirecraft.backend.util.UserResolver userResolver;
    private final StorageService storageService;
    private final ResumeParserService resumeParserService;
    private final JdParserService jdParserService;
    private final AtsMatchingService atsMatchingService;
    private final AiMemoryService aiMemoryService;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @GetMapping("/status")
    public ResponseEntity<UserProfileResponse> getResumeStatus(
            @AuthenticationPrincipal UserDetails principal) {
        User user = userResolver.resolveUser(principal);
        return ResponseEntity.ok(resumeService.getResumeStatus(user.getUserId()));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobDescription", required = false) String jobDescription,
            @AuthenticationPrincipal UserDetails principal) {
        
        User user = userResolver.resolveUser(principal);

        validateResumeFile(file);
        
        // --- TEMPORARY PARSING TEST ---
        ParsedResumeDto parsedResume = null;
        ParsedJdDto parsedJd = null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            
            // Parse Resume
            String extractedText = extractText(file);
            parsedResume = resumeParserService.parseResume(extractedText);
            
            if (parsedResume != null) {
                if (parsedResume.getSkills() != null) {
                    for (String skill : parsedResume.getSkills()) {
                        aiMemoryService.saveInitialMemory(user.getUserId(), MemoryCategory.RESUME, MemoryType.SKILL, skill, "from resume");
                    }
                }
                if (parsedResume.getExperience() != null) {
                    for (ParsedResumeDto.Experience exp : parsedResume.getExperience()) {
                        aiMemoryService.saveInitialMemory(user.getUserId(), MemoryCategory.RESUME, MemoryType.EXPERIENCE, exp.getJobTitle(), exp.getCompany() + " - " + exp.getDescription());
                    }
                }
                if (parsedResume.getEducation() != null) {
                    for (ParsedResumeDto.Education edu : parsedResume.getEducation()) {
                        aiMemoryService.saveInitialMemory(user.getUserId(), MemoryCategory.RESUME, MemoryType.EDUCATION, edu.getDegree(), edu.getInstitution() + " - " + edu.getGraduationYear());
                    }
                }
            }
            
            System.out.println("\n\n\n=======================================================");
            System.out.println("                📄 PARSED RESUME JSON                  ");
            System.out.println("=======================================================\n");
            System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(parsedResume));
            System.out.println("\n=======================================================\n\n");
            
            // Parse JD if provided
            if (jobDescription != null && !jobDescription.trim().isEmpty()) {
                parsedJd = jdParserService.parseJd(jobDescription);
                System.out.println("\n=======================================================");
                System.out.println("              💼 PARSED JOB DESCRIPTION JSON           ");
                System.out.println("=======================================================\n");
                System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(parsedJd));
                System.out.println("\n=======================================================\n\n\n");
            }
            
            // Perform Matching if both exist
            AtsScoreDto atsScore = null;
            if (parsedResume != null && parsedJd != null) {
                atsScore = atsMatchingService.match(parsedJd, parsedResume);
                System.out.println("\n=======================================================");
                System.out.println("              🎯 ATS SCORE & MATCH RESULTS             ");
                System.out.println("=======================================================\n");
                System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(atsScore));
                System.out.println("\n=======================================================\n\n\n");
            }
            
        } catch (Exception e) {
            System.out.println("Failed to parse text: " + e.getMessage());
        }
        // ------------------------------
        
        String storedFilename = storageService.store(file);
        
        UserProfileResponse profileResponse = resumeService.updateResumeMetadata(
                user.getUserId(),
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                storedFilename, // objectKey is the stored file name locally
                "LOCAL",
                "resumes"
        );
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("profile", profileResponse);
        if (parsedResume != null) {
            response.put("parsedResume", parsedResume);
        }
        if (parsedJd != null) {
            response.put("parsedJd", parsedJd);
        }
        if (parsedResume != null && parsedJd != null) {
            response.put("atsScore", atsMatchingService.match(parsedJd, parsedResume));
        }
        
        return ResponseEntity.ok(response);
    }

    private String extractText(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (filename.endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
                return stripper.getText(document);
            }
        } else if (filename.endsWith(".docx")) {
            try (java.io.InputStream is = file.getInputStream();
                 org.apache.poi.xwpf.usermodel.XWPFDocument doc = new org.apache.poi.xwpf.usermodel.XWPFDocument(is);
                 org.apache.poi.xwpf.extractor.XWPFWordExtractor extractor = new org.apache.poi.xwpf.extractor.XWPFWordExtractor(doc)) {
                return extractor.getText();
            }
        } else if (filename.endsWith(".doc")) {
            try (java.io.InputStream is = file.getInputStream();
                 org.apache.poi.hwpf.HWPFDocument doc = new org.apache.poi.hwpf.HWPFDocument(is);
                 org.apache.poi.hwpf.extractor.WordExtractor extractor = new org.apache.poi.hwpf.extractor.WordExtractor(doc)) {
                return extractor.getText();
            }
        }
        return "";
    }

    private void validateResumeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidFileException("File is empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("File size exceeds the 5MB limit.");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        if (contentType == null) {
            throw new InvalidFileException("Content type is missing.");
        }

        if (originalFilename.endsWith(".pdf") && contentType.equals("application/pdf")) {
            validatePdf(file);
        } else if (originalFilename.endsWith(".docx") && contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            validateDocx(file);
        } else if (originalFilename.endsWith(".doc") && contentType.equals("application/msword")) {
            validateDoc(file);
        } else {
            throw new InvalidFileException("Only PDF, DOC, and DOCX files are allowed.");
        }
    }

    private void validatePdf(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            if (document.isEncrypted()) {
                throw new InvalidFileException("Password-protected or encrypted PDF files are not allowed.");
            }
        } catch (InvalidFileException e) {
            throw e;
        } catch (Exception e) {
            throw new InvalidFileException("The PDF file is either corrupted or not a valid document.", e);
        }
    }

    private void validateDocx(MultipartFile file) {
        try (java.io.InputStream is = file.getInputStream();
             org.apache.poi.xwpf.usermodel.XWPFDocument doc = new org.apache.poi.xwpf.usermodel.XWPFDocument(is)) {
            // Validates successfully
        } catch (org.apache.poi.EncryptedDocumentException e) {
            throw new InvalidFileException("Password-protected or encrypted DOCX files are not allowed.", e);
        } catch (Exception e) {
            throw new InvalidFileException("The DOCX file is either corrupted or not a valid document.", e);
        }
    }

    private void validateDoc(MultipartFile file) {
        try (java.io.InputStream is = file.getInputStream();
             org.apache.poi.hwpf.HWPFDocument doc = new org.apache.poi.hwpf.HWPFDocument(is)) {
            // Validates successfully
        } catch (org.apache.poi.EncryptedDocumentException e) {
            throw new InvalidFileException("Password-protected or encrypted DOC files are not allowed.", e);
        } catch (Exception e) {
            throw new InvalidFileException("The DOC file is either corrupted or not a valid document.", e);
        }
    }
}
