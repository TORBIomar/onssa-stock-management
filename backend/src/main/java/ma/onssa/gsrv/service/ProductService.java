package ma.onssa.gsrv.service;

import ma.onssa.gsrv.entity.Product;

import ma.onssa.gsrv.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ProductService {

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
        return productRepository.findAll();
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
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


