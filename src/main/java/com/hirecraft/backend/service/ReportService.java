package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.ReportResponse;

import java.util.List;
import java.util.UUID;

public interface ReportService {

    ReportResponse getReport(UUID reportId);

    List<ReportResponse> getUserReports(UUID userId);
}
