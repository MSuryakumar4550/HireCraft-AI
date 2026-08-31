package com.hirecraft.backend.service;

import com.hirecraft.backend.dto.response.ReportResponse;

import java.util.List;


public interface ReportService {

    ReportResponse getReport(Long reportId);

    List<ReportResponse> getUserReports(Long userId);
}
