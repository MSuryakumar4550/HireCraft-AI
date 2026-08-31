package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.ReadinessResponse;

import java.util.List;


public interface ReadinessService {

    ReadinessResponse calculateAndSaveReadiness(Long userId);

    ReadinessResponse getCurrentReadiness(Long userId);

    List<ReadinessResponse> getReadinessHistory(Long userId);
}
