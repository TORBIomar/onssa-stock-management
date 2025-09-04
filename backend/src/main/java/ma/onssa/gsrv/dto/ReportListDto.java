package ma.onssa.gsrv.dto;

import ma.onssa.gsrv.entity.Report;
import java.time.LocalDateTime;

public class ReportListDto {
    public Long id;
    public String title;
    public String description;
    public Report.ReportType type;
    public Report.ReportStatus status;
    public String content;
    public String filePath;
    public String fileFormat;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public LocalDateTime generatedAt;
    public LocalDateTime expiresAt;
    public String createdByUsername; // Just the username, not the full User object
}
