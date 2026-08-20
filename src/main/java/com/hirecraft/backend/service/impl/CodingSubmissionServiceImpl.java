package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.request.CodeSubmissionRequest;
import com.hirecraft.backend.dto.response.SubmissionResponse;
import com.hirecraft.backend.entity.CodingAssessment;
import com.hirecraft.backend.entity.CodingSubmission;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.CodingAssessmentRepository;
import com.hirecraft.backend.repository.CodingSubmissionRepository;
import com.hirecraft.backend.service.CodingSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CodingSubmissionServiceImpl implements CodingSubmissionService {

    private final CodingSubmissionRepository submissionRepository;
    private final CodingAssessmentRepository assessmentRepository;

    @Override
    @Transactional
    public SubmissionResponse submitCode(UUID assessmentId, CodeSubmissionRequest request) {
        CodingAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("CodingAssessment", assessmentId));

        long existingCount = submissionRepository
                .findByCodingAssessmentCodingAssessmentIdOrderBySubmissionNumber(assessmentId)
                .stream()
                .filter(s -> s.getQuestionNo().equals(request.getQuestionNo()))
                .count();

        CodingSubmission submission = CodingSubmission.builder()
                .codingAssessment(assessment)
                .questionNo(request.getQuestionNo())
                .language(request.getLanguage())
                .sourceCode(request.getSourceCode())
                .submissionNumber((int) existingCount + 1)
                .status("PENDING")
                .build();

        submissionRepository.save(submission);

        // Judge0 execution is dispatched asynchronously via CodeExecutionService (not yet implemented)
        // The submission token will be updated when Judge0 responds

        return toResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsForAssessment(UUID assessmentId) {
        return submissionRepository
                .findByCodingAssessmentCodingAssessmentIdOrderBySubmissionNumber(assessmentId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionByJudge0Token(String judge0Token) {
        return toResponse(submissionRepository.findByJudge0Token(judge0Token)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found for token: " + judge0Token)));
    }

    private SubmissionResponse toResponse(CodingSubmission s) {
        return SubmissionResponse.builder()
                .submissionId(s.getSubmissionId())
                .questionNo(s.getQuestionNo())
                .language(s.getLanguage())
                .submissionNumber(s.getSubmissionNumber())
                .status(s.getStatus())
                .judge0Token(s.getJudge0Token())
                .judge0StatusId(s.getJudge0StatusId())
                .stdout(s.getStdout())
                .stderr(s.getStderr())
                .compileOutput(s.getCompileOutput())
                .executionTimeMs(s.getExecutionTimeMs())
                .memoryKb(s.getMemoryKb())
                .exitCode(s.getExitCode())
                .testcasesPassed(s.getTestcasesPassed())
                .testcasesTotal(s.getTestcasesTotal())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
