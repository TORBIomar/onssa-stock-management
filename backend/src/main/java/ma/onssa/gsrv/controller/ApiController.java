package ma.onssa.gsrv.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = { "http://localhost:4200", "http://localhost:3000" })
public class ApiController {

    @GetMapping("/stock")
    public ResponseEntity<Map<String, Object>> getStock() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Stock data retrieved successfully");
        response.put("data", "Sample stock data - replace with actual database query");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/claims")
    public ResponseEntity<Map<String, Object>> getClaims() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Claims data retrieved successfully");
        response.put("data", "Sample claims data - replace with actual database query");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getAllData() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "All data retrieved successfully");
        response.put("stock", "Sample stock data");
        response.put("claims", "Sample claims data");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
