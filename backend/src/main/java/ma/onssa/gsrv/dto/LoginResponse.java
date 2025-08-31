package ma.onssa.gsrv.dto;

public class LoginResponse {
    public String token;
    public String username;
    public String role;
    public Long userId;
    public String message;

    public LoginResponse(String token, String username, String role, Long userId, String message) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.userId = userId;
        this.message = message;
    }
}
