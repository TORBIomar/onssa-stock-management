package ma.onssa.gsrv.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull; // Unused import


public class UserCreateDto {
    @NotBlank
    public String username;

    @NotBlank
    public String password;

    @Email
    public String email;

    @NotBlank
    public String role;
}


