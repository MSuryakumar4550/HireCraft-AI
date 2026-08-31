package com.hirecraft.backend.repository;

import com.hirecraft.backend.entity.Report;
import com.hirecraft.backend.enums.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByUserUserIdOrderByGeneratedAtDesc(Long userId);

    List<Report> findByUserUserIdAndReportType(Long userId, ReportType reportType);
}
