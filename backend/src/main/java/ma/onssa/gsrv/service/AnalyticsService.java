package ma.onssa.gsrv.service;

import ma.onssa.gsrv.repository.ProductRepository;
import ma.onssa.gsrv.repository.ReclamationRepository;
import ma.onssa.gsrv.repository.UserRepository;
import ma.onssa.gsrv.repository.TaskRepository;
import ma.onssa.gsrv.repository.ReportRepository;
import ma.onssa.gsrv.entity.Product;
import ma.onssa.gsrv.entity.Reclamation;
import ma.onssa.gsrv.entity.User;
import ma.onssa.gsrv.entity.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

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
            // Get all data
            List<Product> allProducts = productRepository.findAll();
            List<Reclamation> allReclamations = reclamationRepository.findAll();
            List<User> allUsers = userRepository.findAll();
            List<Task> allTasks = taskRepository.findAll();

            // Stock Analytics
            Map<String, Object> stockAnalytics = new HashMap<>();
            stockAnalytics.put("totalProducts", allProducts.size());

            // Calculate low stock products (quantity <= minimum threshold)
            long lowStockCount = allProducts.stream()
                    .filter(p -> p.getQuantity() <= p.getMinimumThreshold())
                    .count();
            stockAnalytics.put("lowStockCount", lowStockCount);

            // Calculate critical stock (quantity = 0)
            long criticalStockCount = allProducts.stream()
                    .filter(p -> p.getQuantity() == 0)
                    .count();
            stockAnalytics.put("criticalStockCount", criticalStockCount);

            // Calculate expiring products (next 30 days)
            LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
            long expiringProducts = allProducts.stream()
                    .filter(p -> p.getExpiryDate() != null && !p.getExpiryDate().isAfter(thirtyDaysFromNow))
                    .count();
            stockAnalytics.put("expiringProducts", expiringProducts);

            // Products by category
            Map<String, Long> productsByCategory = allProducts.stream()
                    .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));
            stockAnalytics.put("productsByCategory", productsByCategory);

            // Reclamation Analytics
            Map<String, Object> reclamationAnalytics = new HashMap<>();
            reclamationAnalytics.put("totalReclamations", allReclamations.size());

            // Reclamations by status
            Map<String, Long> reclamationsByStatus = allReclamations.stream()
                    .collect(Collectors.groupingBy(Reclamation::getStatus, Collectors.counting()));
            reclamationAnalytics.put("reclamationsByStatus", reclamationsByStatus);

            // Calculate status counts
            long openReclamations = reclamationsByStatus.getOrDefault("OUVERTE", 0L);
            long inProgressReclamations = reclamationsByStatus.getOrDefault("EN_COURS", 0L);
            long resolvedReclamations = reclamationsByStatus.getOrDefault("TRAITEE", 0L);

            reclamationAnalytics.put("openReclamations", openReclamations);
            reclamationAnalytics.put("inProgressReclamations", inProgressReclamations);
            reclamationAnalytics.put("resolvedReclamations", resolvedReclamations);

            // User Analytics
            Map<String, Object> userAnalytics = new HashMap<>();
            userAnalytics.put("totalUsers", allUsers.size());

            // Users by role
            Map<String, Long> usersByRole = allUsers.stream()
                    .collect(Collectors.groupingBy(User::getRole, Collectors.counting()));
            userAnalytics.put("usersByRole", usersByRole);

            // Active vs inactive users
            long activeUsers = allUsers.stream().filter(User::isActive).count();
            long inactiveUsers = allUsers.stream().filter(u -> !u.isActive()).count();
            userAnalytics.put("activeUsers", activeUsers);
            userAnalytics.put("inactiveUsers", inactiveUsers);

            // Performance Metrics
            Map<String, Object> performanceMetrics = new HashMap<>();

            // Stock utilization (average)
            double avgStockUtilization = allProducts.stream()
                    .mapToDouble(
                            p -> p.getMinimumThreshold() > 0 ? (double) p.getQuantity() / p.getMinimumThreshold() * 100
                                    : 100)
                    .average()
                    .orElse(0.0);
            performanceMetrics.put("stockUtilization", String.format("%.1f%%", avgStockUtilization));

            // Reclamation resolution rate
            double resolutionRate = allReclamations.size() > 0
                    ? (double) resolvedReclamations / allReclamations.size() * 100
                    : 0;
            performanceMetrics.put("reclamationResolutionRate", String.format("%.1f%%", resolutionRate));

            // Compliance Rate (Taux de Conformité) - based on product compliance
            // Products are considered compliant if:
            // 1. Quantity is above minimum threshold
            // 2. Not expired
            // 3. No quality issues reported
            long compliantProducts = allProducts.stream()
                    .filter(p -> {
                        boolean aboveThreshold = p.getQuantity() > p.getMinimumThreshold();
                        boolean notExpired = p.getExpiryDate() == null || p.getExpiryDate().isAfter(LocalDate.now());
                        // For now, assume no quality issues unless there are reclamations
                        boolean noQualityIssues = allReclamations.stream()
                                .noneMatch(r -> r.getProduct().getId().equals(p.getId()) &&
                                        r.getReason().toLowerCase().contains("qualité"));
                        return aboveThreshold && notExpired && noQualityIssues;
                    })
                    .count();

            double complianceRate = allProducts.size() > 0 ? (double) compliantProducts / allProducts.size() * 100 : 0;
            performanceMetrics.put("complianceRate", String.format("%.1f%%", complianceRate));

            // System uptime (mock)
            performanceMetrics.put("systemUptime", "99.9%");

            // Data accuracy (mock)
            performanceMetrics.put("dataAccuracy", "98.5%");

            // Build the complete analytics response
            analytics.put("stockAnalytics", stockAnalytics);
            analytics.put("reclamationAnalytics", reclamationAnalytics);
            analytics.put("userAnalytics", userAnalytics);
            analytics.put("performanceMetrics", performanceMetrics);

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
            List<Product> allProducts = productRepository.findAll();

            // Low stock products
            List<Product> lowStockProducts = allProducts.stream()
                    .filter(p -> p.getQuantity() <= p.getMinimumThreshold())
                    .collect(Collectors.toList());
            stockAnalytics.put("lowStockProducts", lowStockProducts);

            // Stock by category
            Map<String, List<Product>> stockByCategory = allProducts.stream()
                    .collect(Collectors.groupingBy(Product::getCategory));
            stockAnalytics.put("stockByCategory", stockByCategory);

            // Expiring products (next 30 days)
            LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
            List<Product> expiringProducts = allProducts.stream()
                    .filter(p -> p.getExpiryDate() != null && !p.getExpiryDate().isAfter(thirtyDaysFromNow))
                    .collect(Collectors.toList());
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
            List<Reclamation> allReclamations = reclamationRepository.findAll();

            // Reclamations by status
            Map<String, Long> reclamationsByStatus = allReclamations.stream()
                    .collect(Collectors.groupingBy(Reclamation::getStatus, Collectors.counting()));
            reclamationAnalytics.put("reclamationsByStatus", reclamationsByStatus);

            // Reclamations by product
            Map<String, Long> reclamationsByProduct = allReclamations.stream()
                    .collect(Collectors.groupingBy(r -> r.getProduct().getName(), Collectors.counting()));
            reclamationAnalytics.put("reclamationsByProduct", reclamationsByProduct);

            // Monthly trend (last 6 months)
            Map<String, Long> monthlyTrend = new HashMap<>();
            for (int i = 5; i >= 0; i--) {
                LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0)
                        .withMinute(0).withSecond(0);
                LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);

                long count = allReclamations.stream()
                        .filter(r -> r.getCreatedAt() != null &&
                                r.getCreatedAt().isAfter(monthStart) &&
                                r.getCreatedAt().isBefore(monthEnd))
                        .count();

                String monthKey = monthStart.getMonth().toString().substring(0, 3) + " " + monthStart.getYear();
                monthlyTrend.put(monthKey, count);
            }
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
            List<User> allUsers = userRepository.findAll();

            // Users by role
            Map<String, Long> usersByRole = allUsers.stream()
                    .collect(Collectors.groupingBy(User::getRole, Collectors.counting()));
            userAnalytics.put("usersByRole", usersByRole);

            // Active vs inactive users
            long activeUsers = allUsers.stream().filter(User::isActive).count();
            long inactiveUsers = allUsers.stream().filter(u -> !u.isActive()).count();
            userAnalytics.put("activeUsers", activeUsers);
            userAnalytics.put("inactiveUsers", inactiveUsers);

            // Recent registrations (last 30 days) - mock data since we don't have createdAt
            // field
            userAnalytics.put("recentRegistrations", 0);

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
            List<Task> allTasks = taskRepository.findAll();

            // Task completion rate
            long totalTasks = allTasks.size();
            long completedTasks = allTasks.stream()
                    .filter(t -> "TERMINE".equals(t.getStatus()))
                    .count();
            double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

            performanceAnalytics.put("totalTasks", totalTasks);
            performanceAnalytics.put("completedTasks", completedTasks);
            performanceAnalytics.put("completionRate", Math.round(completionRate * 100.0) / 100.0);

            // Report generation time (mock data)
            performanceAnalytics.put("reportGenerationTimes", List.of());

            // System uptime (mock data)
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
