package ma.onssa.gsrv.service;

import ma.onssa.gsrv.entity.Report;
import ma.onssa.gsrv.entity.User;
import ma.onssa.gsrv.repository.ReportRepository;
import ma.onssa.gsrv.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import ma.onssa.gsrv.dto.ReportListDto;

@Service
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    public Report create(Report report) {
        logger.info("Creating new report: {}", report.getTitle());

        // Set created by user if not set
        if (report.getCreatedBy() == null) {
            // For now, set to a default user (you might want to get this from security
            // context)
            Optional<User> defaultUser = userRepository.findById(1L);
            defaultUser.ifPresent(report::setCreatedBy);
        }

        Report saved = reportRepository.save(report);
        logger.info("Report created successfully with ID: {}", saved.getId());
        return saved;
    }

    public List<Report> listAll() {
        return reportRepository.findAll();
    }

    public List<ReportListDto> listAllAsDto() {
        List<Report> reports = reportRepository.findAll();
        return reports.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ReportListDto convertToDto(Report report) {
        ReportListDto dto = new ReportListDto();
        dto.id = report.getId();
        dto.title = report.getTitle();
        dto.description = report.getDescription();
        dto.type = report.getType();
        dto.status = report.getStatus();
        dto.content = report.getContent();
        dto.filePath = report.getFilePath();
        dto.fileFormat = report.getFileFormat();
        dto.createdAt = report.getCreatedAt();
        dto.updatedAt = report.getUpdatedAt();
        dto.generatedAt = report.getGeneratedAt();
        dto.expiresAt = report.getExpiresAt();

        // Handle the lazy-loaded User association safely
        if (report.getCreatedBy() != null) {
            dto.createdByUsername = report.getCreatedBy().getUsername();
        } else {
            dto.createdByUsername = "Unknown";
        }

        return dto;
    }

    public Report getById(Long id) {
        Optional<Report> report = reportRepository.findById(id);
        return report.orElse(null);
    }

    public List<Report> getByType(String type) {
        try {
            Report.ReportType reportType = Report.ReportType.valueOf(type.toUpperCase());
            return reportRepository.findByType(reportType);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid report type: {}", type);
            return List.of();
        }
    }

    public List<Report> getByStatus(String status) {
        try {
            Report.ReportStatus reportStatus = Report.ReportStatus.valueOf(status.toUpperCase());
            return reportRepository.findByStatus(reportStatus);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid report status: {}", status);
            return List.of();
        }
    }

    public Report update(Long id, Report reportDetails) {
        Optional<Report> existingReport = reportRepository.findById(id);
        if (existingReport.isPresent()) {
            Report report = existingReport.get();
            report.setTitle(reportDetails.getTitle());
            report.setDescription(reportDetails.getDescription());
            report.setType(reportDetails.getType());
            report.setStatus(reportDetails.getStatus());
            report.setUpdatedAt(LocalDateTime.now());

            return reportRepository.save(report);
        }
        throw new RuntimeException("Report not found with id: " + id);
    }

    public Report updateStatus(Long id, String status) {
        Optional<Report> existingReport = reportRepository.findById(id);
        if (existingReport.isPresent()) {
            Report report = existingReport.get();
            try {
                Report.ReportStatus reportStatus = Report.ReportStatus.valueOf(status.toUpperCase());
                report.setStatus(reportStatus);
                report.setUpdatedAt(LocalDateTime.now());

                if (reportStatus == Report.ReportStatus.TERMINE) {
                    report.setGeneratedAt(LocalDateTime.now());
                }

                return reportRepository.save(report);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid report status: " + status);
            }
        }
        throw new RuntimeException("Report not found with id: " + id);
    }

    public Report generateReport(Long id) {
        logger.info("Starting report generation for ID: {}", id);

        Optional<Report> existingReport = reportRepository.findById(id);
        if (existingReport.isPresent()) {
            Report report = existingReport.get();
            logger.info("Found report: {} with status: {}", report.getTitle(), report.getStatus());

            // Check if report is already generated
            if (Report.ReportStatus.TERMINE.equals(report.getStatus())) {
                logger.info("Report {} is already generated", id);
                return report;
            }

            // Simulate report generation (reduced from 1000ms to 200ms for better UX)
            try {
                Thread.sleep(200); // Simulate processing time

                report.setStatus(Report.ReportStatus.TERMINE);
                report.setGeneratedAt(LocalDateTime.now());
                report.setContent("Generated report content for " + report.getTitle());
                report.setUpdatedAt(LocalDateTime.now());

                Report saved = reportRepository.save(report);
                logger.info("Report generated successfully with ID: {}", saved.getId());
                return saved;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.error("Report generation interrupted for ID: {}", id, e);
                throw new RuntimeException("Report generation interrupted: " + e.getMessage());
            } catch (Exception e) {
                logger.error("Error during report generation for ID: {}", id, e);
                throw new RuntimeException("Failed to generate report: " + e.getMessage());
            }
        } else {
            logger.error("Report not found with ID: {}", id);
            throw new RuntimeException("Report not found with id: " + id);
        }
    }

    public void delete(Long id) {
        if (reportRepository.existsById(id)) {
            reportRepository.deleteById(id);
            logger.info("Report deleted with ID: {}", id);
        } else {
            throw new RuntimeException("Report not found with id: " + id);
        }
    }

    public byte[] generateReportContent(String type, String startDate, String endDate, String format) {
        logger.info("Generating report content for type: {}, format: {}, from {} to {}", type, format, startDate,
                endDate);

        // This is a placeholder implementation
        // In a real application, you would:
        // 1. Query the database based on type, startDate, and endDate
        // 2. Generate the actual report content in the specified format
        // 3. Return the byte array of the generated report

        String content = String.format(
                "Report: %s\nPeriod: %s to %s\nGenerated on: %s\n\nThis is a sample report content.",
                type, startDate != null ? startDate : "N/A", endDate != null ? endDate : "N/A",
                java.time.LocalDateTime.now().toString());

        return content.getBytes();
    }
}
