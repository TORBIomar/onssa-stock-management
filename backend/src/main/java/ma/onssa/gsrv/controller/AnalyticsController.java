package ma.onssa.gsrv.controller;

import ma.onssa.gsrv.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = { "http://localhost:4200" })
public class AnalyticsController {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);
    
    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getGeneralAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            logger.error("Error getting analytics: ", e);
            throw e;
        }
    }

    @GetMapping("/stock")
    public ResponseEntity<Map<String, Object>> getStockAnalytics() {
        try {
            Map<String, Object> stockAnalytics = analyticsService.getStockAnalytics();
            return ResponseEntity.ok(stockAnalytics);
        } catch (Exception e) {
            logger.error("Error getting stock analytics: ", e);
            throw e;
        }
    }

    @GetMapping("/reclamations")
    public ResponseEntity<Map<String, Object>> getReclamationAnalytics() {
        try {
            Map<String, Object> reclamationAnalytics = analyticsService.getReclamationAnalytics();
            return ResponseEntity.ok(reclamationAnalytics);
        } catch (Exception e) {
            logger.error("Error getting reclamation analytics: ", e);
            throw e;
        }
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUserAnalytics() {
        try {
            Map<String, Object> userAnalytics = analyticsService.getUserAnalytics();
            return ResponseEntity.ok(userAnalytics);
        } catch (Exception e) {
            logger.error("Error getting user analytics: ", e);
            throw e;
        }
    }

    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceAnalytics() {
        try {
            Map<String, Object> performanceAnalytics = analyticsService.getPerformanceAnalytics();
            return ResponseEntity.ok(performanceAnalytics);
        } catch (Exception e) {
            logger.error("Error getting performance analytics: ", e);
            throw e;
        }
    }
}
