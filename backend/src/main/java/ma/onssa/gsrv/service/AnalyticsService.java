package ma.onssa.gsrv.service;

import ma.onssa.gsrv.repository.ProductRepository;
import ma.onssa.gsrv.repository.ReclamationRepository;
import ma.onssa.gsrv.repository.UserRepository;
import ma.onssa.gsrv.repository.TaskRepository;
import ma.onssa.gsrv.repository.ReportRepository;
import ma.onssa.gsrv.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class AnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReclamationRepository reclamationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ReportRepository reportRepository;

    public Map<String, Object> getGeneralAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        try {
            // Basic counts
            long totalProducts = productRepository.count();
            long totalReclamations = reclamationRepository.count();
            long totalUsers = userRepository.count();
            long totalTasks = taskRepository.count();
            long totalReports = reportRepository.count();

            analytics.put("totalProducts", totalProducts);
            analytics.put("totalReclamations", totalReclamations);
            analytics.put("totalUsers", totalUsers);
            analytics.put("totalTasks", totalTasks);
            analytics.put("totalReports", totalReports);

            // Recent activity (last 30 days) - using available methods
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            // TODO: Implement these methods in repositories or use alternative approaches
            long recentProducts = 0; // productRepository.countByCreatedAtAfter(thirtyDaysAgo);
            long recentReclamations = 0; // reclamationRepository.countByCreatedAtAfter(thirtyDaysAgo);
            long recentTasks = 0; // taskRepository.countByCreatedAtAfter(thirtyDaysAgo);

            analytics.put("recentProducts", recentProducts);
            analytics.put("recentReclamations", recentReclamations);
            analytics.put("recentTasks", recentTasks);

            logger.info("General analytics generated successfully");

        } catch (Exception e) {
            logger.error("Error generating general analytics: ", e);
            analytics.put("error", "Failed to generate analytics");
        }

        return analytics;
    }

    public Map<String, Object> getStockAnalytics() {
        Map<String, Object> stockAnalytics = new HashMap<>();

        try {
            // Low stock products - using available methods
            List<Product> lowStockProducts = productRepository.findByQuantityLessThanEqual(10); // Assuming 10 is low
                                                                                                // stock threshold
            stockAnalytics.put("lowStockProducts", lowStockProducts);

            // Stock by category - using available methods
            List<Product> stockByCategory = productRepository.findByCategory("VACCIN"); // Example category
            stockAnalytics.put("stockByCategory", stockByCategory);

            // Expiring products (next 30 days) - TODO: implement in repository
            LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
            List<Object[]> expiringProducts = List.of(); // productRepository.findExpiringProducts(thirtyDaysFromNow);
            stockAnalytics.put("expiringProducts", expiringProducts);

            logger.info("Stock analytics generated successfully");

        } catch (Exception e) {
            logger.error("Error generating stock analytics: ", e);
            stockAnalytics.put("error", "Failed to generate stock analytics");
        }

        return stockAnalytics;
    }

    public Map<String, Object> getReclamationAnalytics() {
        Map<String, Object> reclamationAnalytics = new HashMap<>();

        try {
            // Reclamations by status - TODO: implement in repository
            List<Object[]> reclamationsByStatus = List.of(); // reclamationRepository.findReclamationsByStatus();
            reclamationAnalytics.put("reclamationsByStatus", reclamationsByStatus);

            // Reclamations by product - TODO: implement in repository
            List<Object[]> reclamationsByProduct = List.of(); // reclamationRepository.findReclamationsByProduct();
            reclamationAnalytics.put("reclamationsByProduct", reclamationsByProduct);

            // Monthly trend - TODO: implement in repository
            List<Object[]> monthlyTrend = List.of(); // reclamationRepository.findMonthlyTrend();
            reclamationAnalytics.put("monthlyTrend", monthlyTrend);

            logger.info("Reclamation analytics generated successfully");

        } catch (Exception e) {
            logger.error("Error generating reclamation analytics: ", e);
            reclamationAnalytics.put("error", "Failed to generate reclamation analytics");
        }

        return reclamationAnalytics;
    }

    public Map<String, Object> getUserAnalytics() {
        Map<String, Object> userAnalytics = new HashMap<>();

        try {
            // Users by role - TODO: implement in repository
            List<Object[]> usersByRole = List.of(); // userRepository.findUsersByRole();
            userAnalytics.put("usersByRole", usersByRole);

            // Active vs inactive users - TODO: implement in repository
            long activeUsers = 0; // userRepository.countByActiveTrue();
            long inactiveUsers = 0; // userRepository.countByActiveFalse();

            userAnalytics.put("activeUsers", activeUsers);
            userAnalytics.put("inactiveUsers", inactiveUsers);

            // Recent registrations - TODO: implement in repository
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            long recentRegistrations = 0; // userRepository.countByCreatedAtAfter(thirtyDaysAgo);
            userAnalytics.put("recentRegistrations", recentRegistrations);

            logger.info("User analytics generated successfully");

        } catch (Exception e) {
            logger.error("Error generating user analytics: ", e);
            userAnalytics.put("error", "Failed to generate user analytics");
        }

        return userAnalytics;
    }

    public Map<String, Object> getPerformanceAnalytics() {
        Map<String, Object> performanceAnalytics = new HashMap<>();

        try {
            // Task completion rate
            long totalTasks = taskRepository.count();
            // TODO: implement countByStatus in TaskRepository
            long completedTasks = 0; // taskRepository.countByStatus(ma.onssa.gsrv.entity.Task.TaskStatus.TERMINE);
            double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

            performanceAnalytics.put("totalTasks", totalTasks);
            performanceAnalytics.put("completedTasks", completedTasks);
            performanceAnalytics.put("completionRate", Math.round(completionRate * 100.0) / 100.0);

            // Report generation time - TODO: implement in repository
            List<Object[]> reportGenerationTimes = List.of(); // reportRepository.findReportGenerationTimes();
            performanceAnalytics.put("reportGenerationTimes", reportGenerationTimes);

            // System uptime (mock data for now)
            performanceAnalytics.put("systemUptime", "99.9%");
            performanceAnalytics.put("averageResponseTime", "150ms");

            logger.info("Performance analytics generated successfully");

        } catch (Exception e) {
            logger.error("Error generating performance analytics: ", e);
            performanceAnalytics.put("error", "Failed to generate performance analytics");
        }

        return performanceAnalytics;
    }
}
