package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.ReadinessResponse;

import java.util.List;
import java.util.UUID;

public interface ReadinessService {

    ReadinessResponse calculateAndSaveReadiness(UUID userId);

    ReadinessResponse getCurrentReadiness(UUID userId);

    List<ReadinessResponse> getReadinessHistory(UUID userId);
}
