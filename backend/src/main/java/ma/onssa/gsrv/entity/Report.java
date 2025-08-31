package ma.onssa.gsrv.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column
    private String filePath;
    
    @Column
    private String fileFormat;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @Column
    private LocalDateTime generatedAt;
    
    @Column
    private LocalDateTime expiresAt;
    
    // Constructors
    public Report() {
        this.createdAt = LocalDateTime.now();
        this.status = ReportStatus.EN_COURS;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public ReportType getType() {
        return type;
    }
    
    public void setType(ReportType type) {
        this.type = type;
    }
    
    public ReportStatus getStatus() {
        return status;
    }
    
    public void setStatus(ReportStatus status) {
        this.status = status;
        if (status == ReportStatus.TERMINE) {
            this.generatedAt = LocalDateTime.now();
        }
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getFileFormat() {
        return fileFormat;
    }
    
    public void setFileFormat(String fileFormat) {
        this.fileFormat = fileFormat;
    }
    
    public User getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }
    
    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum ReportType {
        INVENTAIRE, ACTIVITE, PERFORMANCE, QUALITE, STOCK, RECLAMATIONS, UTILISATEURS
    }
    
    public enum ReportStatus {
        EN_COURS, TERMINE, ERREUR, EXPIRE
    }
}
