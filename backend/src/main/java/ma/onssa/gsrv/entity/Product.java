package ma.onssa.gsrv.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull; // Unused import
import java.time.LocalDate;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 40)
    private String category; // Changed from ProductCategory enum to String

    @Min(0)
    @Column(nullable = false)
    private int quantity;

    @Min(0)
    @Column(name = "minimum_threshold", nullable = false)
    private int minimumThreshold;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    } // Changed return type

    public void setCategory(String category) {
        this.category = category;
    } // Changed parameter type

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getMinimumThreshold() {
        return minimumThreshold;
    }

    public void setMinimumThreshold(int minimumThreshold) {
        this.minimumThreshold = minimumThreshold;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", category='" + category + '\'' + // Changed to use quotes for string
                ", quantity=" + quantity +
                ", minimumThreshold=" + minimumThreshold +
                ", expiryDate=" + expiryDate +
                '}';
    }
}
