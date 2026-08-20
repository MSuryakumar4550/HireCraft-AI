package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.VirtualInterviewResponse;

import java.util.List;
import java.util.UUID;

public interface VirtualInterviewService {

    VirtualInterviewResponse createVirtualInterview(UUID userId);

    VirtualInterviewResponse getVirtualInterview(UUID virtualInterviewId);

    List<VirtualInterviewResponse> getUserVirtualInterviews(UUID userId);

    VirtualInterviewResponse advanceStage(UUID virtualInterviewId);
}
