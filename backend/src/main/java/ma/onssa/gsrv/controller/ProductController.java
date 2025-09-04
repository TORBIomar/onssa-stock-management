package ma.onssa.gsrv.controller;

import jakarta.validation.Valid;
import ma.onssa.gsrv.dto.ProductDto;
import ma.onssa.gsrv.entity.Product;

import ma.onssa.gsrv.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = { "http://localhost:4200" })
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> create(@Valid @RequestBody ProductDto dto) {
        logger.info("Creating product with DTO: {}", dto);
        try {
            Product p = new Product();
            p.setName(dto.name);
            p.setCategory(dto.category);
            p.setQuantity(dto.quantity);
            p.setMinimumThreshold(dto.minimumThreshold);
            p.setExpiryDate(dto.expiryDate);
            logger.info("Product entity created: {}", p);
            Product created = productService.create(p);
            logger.info("Product created successfully with ID: {}", created.getId());
            return ResponseEntity.created(URI.create("/products/" + created.getId())).body(created);
        } catch (Exception e) {
            logger.error("Error creating product: ", e);
            throw e;
        }
    }

    @GetMapping("/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product controller is working");
        response.put("timestamp", System.currentTimeMillis());
        response.put("productCount", productService.listAll().size());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<Product> list() {
        logger.info("Received request to list all products");
        List<Product> products = productService.listAll();
        logger.info("Returning {} products", products.size());
        return products;
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<Product> lowStock() {
        return productService.lowStock();
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<Product> byCategory(@PathVariable String category) {
        return productService.findByCategory(category);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product update(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        Product p = new Product();
        p.setName(dto.name);
        p.setCategory(dto.category);
        p.setQuantity(dto.quantity);
        p.setMinimumThreshold(dto.minimumThreshold);
        p.setExpiryDate(dto.expiryDate);
        return productService.update(id, p);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        logger.info("Received request to delete product with ID: {}", id);

        // Check if user has ADMIN role
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            logger.warn("User {} attempted to delete product without ADMIN role",
                    auth != null ? auth.getName() : "unknown");
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Forbidden",
                    "message", "Access denied: ADMIN role required to delete products"));
        }

        try {
            productService.delete(id);
            logger.info("Product deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Product not found: {}", e.getMessage());
            return ResponseEntity.status(404).body(Map.of(
                    "error", "Product not found",
                    "message", e.getMessage()));
        } catch (IllegalStateException e) {
            logger.error("Cannot delete product due to constraints: {}", e.getMessage());
            return ResponseEntity.status(409).body(Map.of(
                    "error", "Conflict",
                    "message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error deleting product: ", e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Internal server error",
                    "message", "An unexpected error occurred while deleting the product"));
        }
    }
}
