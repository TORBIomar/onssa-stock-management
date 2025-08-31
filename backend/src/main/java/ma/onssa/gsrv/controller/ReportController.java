package ma.onssa.gsrv.controller;

import ma.onssa.gsrv.dto.ReportDto;
import ma.onssa.gsrv.entity.Report;
import ma.onssa.gsrv.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = { "http://localhost:4200" })
public class ReportController {

    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);

    @Autowired
    private ReportService reportService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Report> create(@Valid @RequestBody ReportDto dto) {
        logger.info("Creating report with DTO: {}", dto);
        try {
            Report report = new Report();
            report.setTitle(dto.title);
            report.setDescription(dto.description);
            report.setType(dto.type);
            report.setStatus(dto.status);

            Report created = reportService.create(report);
            logger.info("Report created successfully with ID: {}", created.getId());
            return ResponseEntity.created(URI.create("/reports/" + created.getId())).body(created);
        } catch (Exception e) {
            logger.error("Error creating report: ", e);
            throw e;
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<Report> list() {
        return reportService.listAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Report> getById(@PathVariable Long id) {
        Report report = reportService.getById(id);
        if (report != null) {
            return ResponseEntity.ok(report);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<Report> getByType(@PathVariable String type) {
        return reportService.getByType(type);
    }

    @GetMapping("/status/{status}")
    public List<Report> getByStatus(@PathVariable String status) {
        return reportService.getByStatus(status);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Report> update(@PathVariable Long id, @Valid @RequestBody ReportDto dto) {
        try {
            Report report = new Report();
            report.setTitle(dto.title);
            report.setDescription(dto.description);
            report.setType(dto.type);
            report.setStatus(dto.status);

            Report updated = reportService.update(id, report);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating report: ", e);
            throw e;
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Report> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Report updated = reportService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating report status: ", e);
            throw e;
        }
    }

    @PostMapping("/{id}/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Report> generateReport(@PathVariable Long id) {
        try {
            logger.info("Generating report with ID: {}", id);
            Report generated = reportService.generateReport(id);
            logger.info("Report generated successfully with ID: {}", generated.getId());
            return ResponseEntity.ok(generated);
        } catch (Exception e) {
            logger.error("Error generating report with ID {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    @PostMapping("/{type}/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Report> generateReportByType(@PathVariable String type, @RequestBody ReportDto dto) {
        try {
            logger.info("Generating report of type: {} with DTO: {}", type, dto);
            
            // Validate report type
            Report.ReportType reportType;
            try {
                reportType = Report.ReportType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.error("Invalid report type: {}", type);
                return ResponseEntity.badRequest().body(null);
            }
            
            Report report = new Report();
            report.setTitle(dto.title);
            report.setDescription(dto.description);
            report.setType(reportType);
            report.setStatus(Report.ReportStatus.EN_COURS);

            Report created = reportService.create(report);
            // Generate the report content
            Report generated = reportService.generateReport(created.getId());
            logger.info("Report generated successfully with ID: {}", generated.getId());
            return ResponseEntity.ok(generated);
        } catch (Exception e) {
            logger.error("Error generating report by type: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    @GetMapping("/{type}/download/{format}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<byte[]> downloadReport(@PathVariable String type, @PathVariable String format,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            logger.info("Downloading report of type: {} in format: {}", type, format);
            // This is a placeholder - you would implement actual report generation logic
            // here
            byte[] reportContent = reportService.generateReportContent(type, startDate, endDate, format);

            String filename = String.format("report_%s_%s.%s", type,
                    java.time.LocalDate.now().toString(), format);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .header("Content-Type", getContentType(format))
                    .body(reportContent);
        } catch (Exception e) {
            logger.error("Error downloading report: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    private String getContentType(String format) {
        switch (format.toLowerCase()) {
            case "pdf":
                return "application/pdf";
            case "excel":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "csv":
                return "text/csv";
            default:
                return "application/octet-stream";
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
