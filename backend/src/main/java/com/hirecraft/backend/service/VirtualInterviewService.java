package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.VirtualInterviewResponse;

import java.util.List;


public interface VirtualInterviewService {

    VirtualInterviewResponse createVirtualInterview(Long userId);

    VirtualInterviewResponse getVirtualInterview(Long virtualInterviewId);

    List<VirtualInterviewResponse> getUserVirtualInterviews(Long userId);

    VirtualInterviewResponse advanceStage(Long virtualInterviewId);
}
