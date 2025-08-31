package ma.onssa.gsrv.repository;

import ma.onssa.gsrv.entity.Product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByName(String name);
    List<Product> findByCategory(String category);
    List<Product> findByQuantityLessThanEqual(int quantity);
}


