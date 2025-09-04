package ma.onssa.gsrv.controller;

import ma.onssa.gsrv.service.DashboardService;
import ma.onssa.gsrv.service.UserService;
import ma.onssa.gsrv.service.ProductService;
import ma.onssa.gsrv.service.ReclamationService;
import ma.onssa.gsrv.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = { "http://localhost:4200" })
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    private final DashboardService dashboardService;
    private final UserService userService;
    private final ProductService productService;
    private final ReclamationService reclamationService;
    private final TaskService taskService;

    public DashboardController(DashboardService dashboardService, UserService userService,
            ProductService productService, ReclamationService reclamationService, TaskService taskService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.productService = productService;
        this.reclamationService = reclamationService;
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        logger.info("Dashboard data request received");

        Map<String, Object> data = new HashMap<>();

        try {
            // Get actual statistics from services
            long totalProducts = productService.listAll().size();
            long totalUsers = userService.listAll().size();
            long totalReclamations = reclamationService.listAll().size();
            long totalTasks = taskService.listAll().size();

            // Calculate critical products (quantity <= minimum threshold)
            long criticalProducts = productService.lowStock().size();

            // Calculate expired products
            long expiredProducts = productService.expiringSoon(0).size();

            // Calculate pending reclamations
            long pendingReclamations = reclamationService.listByStatus("OUVERTE").size();

            // Calculate pending tasks
            long pendingTasks = taskService.getByStatus("A_FAIRE").size();

            // Calculate compliance rate (same logic as AnalyticsService)
            var allProducts = productService.listAll();
            var allReclamations = reclamationService.listAll();
            
            long compliantProducts = allProducts.stream()
                .filter(p -> {
                    boolean aboveThreshold = p.getQuantity() > p.getMinimumThreshold();
                    boolean notExpired = p.getExpiryDate() == null || 
                        p.getExpiryDate().isAfter(java.time.LocalDate.now());
                    boolean noQualityIssues = allReclamations.stream()
                        .noneMatch(r -> r.getProduct().getId().equals(p.getId()) &&
                            r.getReason().toLowerCase().contains("qualité"));
                    return aboveThreshold && notExpired && noQualityIssues;
                })
                .count();
            
            double complianceRate = allProducts.size() > 0 ? 
                (double) compliantProducts / allProducts.size() * 100 : 0;
            complianceRate = Math.round(complianceRate * 10.0) / 10.0; // Round to 1 decimal place

            logger.info(
                    "Dashboard stats calculated - Products: {}, Users: {}, Reclamations: {}, Tasks: {}, Critical: {}, Expired: {}, Pending Reclamations: {}, Pending Tasks: {}, Compliance Rate: {}%",
                    totalProducts, totalUsers, totalReclamations, totalTasks, criticalProducts, expiredProducts,
                    pendingReclamations, pendingTasks, complianceRate);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalProducts", totalProducts);
            stats.put("criticalProducts", criticalProducts);
            stats.put("expiredProducts", expiredProducts);
            stats.put("totalReclamations", totalReclamations);
            stats.put("pendingReclamations", pendingReclamations);
            stats.put("totalUsers", totalUsers);
            stats.put("totalTasks", totalTasks);
            stats.put("pendingTasks", pendingTasks);
            stats.put("complianceRate", complianceRate);

            data.put("stats", stats);
            data.put("recentActivities", new Object[0]); // For now, empty array

            logger.info("Dashboard data prepared successfully");
            return ResponseEntity.ok(data);

        } catch (Exception e) {
            logger.error("Error preparing dashboard data", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to load dashboard data"));
        }
    }
}
