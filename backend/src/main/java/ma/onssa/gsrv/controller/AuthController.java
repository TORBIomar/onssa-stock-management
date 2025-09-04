package ma.onssa.gsrv.controller;

import jakarta.validation.Valid;
import ma.onssa.gsrv.dto.DashboardData;
import ma.onssa.gsrv.dto.LoginRequest;
import ma.onssa.gsrv.dto.LoginResponse;
import ma.onssa.gsrv.dto.UserCreateDto;
import ma.onssa.gsrv.entity.User;
import ma.onssa.gsrv.service.AuthService;
import ma.onssa.gsrv.service.DashboardService;
import ma.onssa.gsrv.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = { "http://localhost:4200" })
public class AuthController {

    private final AuthService authService;
    private final DashboardService dashboardService;
    private final UserService userService;

    public AuthController(AuthService authService, DashboardService dashboardService, UserService userService) {
        this.authService = authService;
        this.dashboardService = dashboardService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserCreateDto dto) {
        // Allow registration for both ADMIN and AGENT roles
        User created = userService.create(dto.username, dto.password, dto.email, dto.role);
        return ResponseEntity.created(URI.create("/auth/register/" + created.getId())).body(created);
    }

    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<DashboardData> getDashboard(@PathVariable Long userId) {
        User user = userService.getById(userId);
        DashboardData dashboardData = dashboardService.getDashboardData(user);
        return ResponseEntity.ok(dashboardData);
    }
}