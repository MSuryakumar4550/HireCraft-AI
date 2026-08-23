package com.hirecraft.backend.service.impl;

import com.hirecraft.backend.dto.response.ReportResponse;
import com.hirecraft.backend.entity.Report;
import com.hirecraft.backend.exception.ResourceNotFoundException;
import com.hirecraft.backend.repository.ReportRepository;
import com.hirecraft.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReport(UUID reportId) {
        return toResponse(reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", reportId)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getUserReports(UUID userId) {
        return reportRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    private ReportResponse toResponse(Report r) {
        return ReportResponse.builder()
                .reportId(r.getReportId())
                .reportType(r.getReportType())
                .overallScore(r.getOverallScore())
                .generatedContent(r.getGeneratedContent())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
