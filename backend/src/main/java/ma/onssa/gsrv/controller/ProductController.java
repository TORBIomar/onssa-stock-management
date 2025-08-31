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

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<Product> list() {
        return productService.listAll();
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
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
