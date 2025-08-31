package ma.onssa.gsrv.controller;

import ma.onssa.gsrv.service.DashboardService;
import ma.onssa.gsrv.service.UserService;
import ma.onssa.gsrv.service.ProductService;
import ma.onssa.gsrv.service.ReclamationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = { "http://localhost:4200" })
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final ProductService productService;
    private final ReclamationService reclamationService;

    public DashboardController(DashboardService dashboardService, UserService userService, 
                             ProductService productService, ReclamationService reclamationService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.productService = productService;
        this.reclamationService = reclamationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> data = new HashMap<>();
        
        // Get actual statistics from services
        long totalProducts = productService.listAll().size();
        long totalUsers = userService.listAll().size();
        long totalReclamations = reclamationService.listAll().size();
        
        // Calculate critical products (quantity <= minimum threshold)
        long criticalProducts = productService.lowStock().size();
        
        // Calculate expired products
        long expiredProducts = productService.expiringSoon(0).size();
        
        // Calculate pending reclamations
        long pendingReclamations = reclamationService.listByStatus("OUVERTE").size();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("criticalProducts", criticalProducts);
        stats.put("expiredProducts", expiredProducts);
        stats.put("totalReclamations", totalReclamations);
        stats.put("pendingReclamations", pendingReclamations);
        stats.put("totalUsers", totalUsers);
        
        data.put("stats", stats);
        data.put("recentActivities", new Object[0]); // For now, empty array
        
        return ResponseEntity.ok(data);
    }
}
