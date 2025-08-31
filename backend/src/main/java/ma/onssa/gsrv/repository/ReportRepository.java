package ma.onssa.gsrv.repository;

import ma.onssa.gsrv.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByType(Report.ReportType type);
    List<Report> findByStatus(Report.ReportStatus status);
    List<Report> findByCreatedById(Long userId);
}
