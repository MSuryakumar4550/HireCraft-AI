package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.Report;
import com.hirecraft.backend.enums.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {

    List<Report> findByUserUserIdOrderByCreatedAtDesc(UUID userId);

    List<Report> findByUserUserIdAndReportType(UUID userId, ReportType reportType);
}
