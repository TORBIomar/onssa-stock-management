package ma.onssa.gsrv.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReclamationCreateDto {
    @NotBlank
    public String titre;

    @NotNull
    public Long productId;

    @NotNull
    public Long userId;

    @NotBlank
    public String reason;

    @Min(0)
    public int observedQuantity;
}
