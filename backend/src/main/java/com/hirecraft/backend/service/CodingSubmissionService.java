package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.CodeSubmissionRequest;
import com.hirecraft.backend.dto.response.SubmissionResponse;

import java.util.List;


public interface CodingSubmissionService {

    SubmissionResponse submitCode(Long assessmentId, CodeSubmissionRequest request);

    List<SubmissionResponse> getSubmissionsForAssessment(Long assessmentId);

    SubmissionResponse getSubmissionByJudge0Token(String judge0Token);

    SubmissionResponse updateSubmissionStatus(Long submissionId, String status, int testcasesPassed, int testcasesTotal);
}
