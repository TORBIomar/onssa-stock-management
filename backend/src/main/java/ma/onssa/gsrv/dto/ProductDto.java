package ma.onssa.gsrv.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull; // Unused import

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public class ProductDto {
    @NotBlank
    public String name;

    @NotBlank
    public String category;

    @Min(0)
    public int quantity;

    @Min(0)
    public int minimumThreshold;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    public LocalDate expiryDate;

    @Override
    public String toString() {
        return "ProductDto{" +
                "name='" + name + '\'' +
                ", category='" + category + '\'' +
                ", quantity=" + quantity +
                ", minimumThreshold=" + minimumThreshold +
                ", expiryDate=" + expiryDate +
                '}';
    }
}
