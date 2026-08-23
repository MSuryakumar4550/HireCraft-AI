package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.request.CodeSubmissionRequest;
import com.hirecraft.backend.dto.response.SubmissionResponse;

import java.util.List;
import java.util.UUID;

public interface CodingSubmissionService {

    SubmissionResponse submitCode(UUID assessmentId, CodeSubmissionRequest request);

    List<SubmissionResponse> getSubmissionsForAssessment(UUID assessmentId);

    SubmissionResponse getSubmissionByJudge0Token(String judge0Token);
}
