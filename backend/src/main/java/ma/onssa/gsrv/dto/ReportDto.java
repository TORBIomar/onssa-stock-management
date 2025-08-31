package ma.onssa.gsrv.dto;

import ma.onssa.gsrv.entity.Report;

public class ReportDto {
    public String title;
    public String description;
    public Report.ReportType type;
    public Report.ReportStatus status;
    public Long createdByUserId;
}
