package ma.onssa.gsrv.service;

import ma.onssa.gsrv.entity.Product;

import ma.onssa.gsrv.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product create(Product product) {
        if (product.getMinimumThreshold() <= 0) {
            product.setMinimumThreshold(10);
        }
        return productRepository.save(product);
    }

    public Product update(Long id, Product update) {
        Product existing = getById(id);
        existing.setName(update.getName());
        existing.setCategory(update.getCategory());
        existing.setQuantity(update.getQuantity());
        existing.setMinimumThreshold(update.getMinimumThreshold());
        existing.setExpiryDate(update.getExpiryDate());
        return productRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Product> listAll() {
        logger.info("ProductService.listAll() called");
        List<Product> products = productRepository.findAll();
        logger.info("Found {} products in database", products.size());
        return products;
    }

    public void delete(Long id) {
        logger.info("Attempting to delete product with ID: {}", id);

        // Check if product exists
        if (!productRepository.existsById(id)) {
            logger.error("Product not found with ID: {}", id);
            throw new IllegalArgumentException("Product not found with ID: " + id);
        }

        try {
            productRepository.deleteById(id);
            logger.info("Product deleted successfully with ID: {}", id);
        } catch (Exception e) {
            logger.error("Error deleting product with ID {}: {}", id, e.getMessage());
            if (e.getMessage().contains("foreign key constraint")) {
                throw new IllegalStateException(
                        "Cannot delete product: It is referenced by one or more reclamations. Please delete the associated reclamations first.");
            } else {
                throw new RuntimeException("Error deleting product: " + e.getMessage());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Product> findByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<Product> lowStock() {
        return productRepository.findAll().stream()
                .filter(p -> p.getQuantity() <= p.getMinimumThreshold())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Product> expiringSoon(int days) {
        LocalDate limit = LocalDate.now().plusDays(days);
        return productRepository.findAll().stream()
                .filter(p -> p.getExpiryDate() != null && !p.getExpiryDate().isAfter(limit))
                .toList();
    }
}
