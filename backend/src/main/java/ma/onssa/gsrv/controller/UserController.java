package ma.onssa.gsrv.controller;

import jakarta.validation.Valid;
import ma.onssa.gsrv.dto.UserCreateDto;
import ma.onssa.gsrv.entity.User;
import ma.onssa.gsrv.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import ma.onssa.gsrv.dto.PasswordResetRequest;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = { "http://localhost:4200" })
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> create(@Valid @RequestBody UserCreateDto dto) {
        // Prevent creation of ADMIN users through this endpoint for security
        if ("ADMIN".equals(dto.role)) {
            return ResponseEntity.badRequest().build();
        }
        
        User created = userService.create(dto.username, dto.password, dto.email, dto.role);
        return ResponseEntity.created(URI.create("/users/" + created.getId())).body(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<User> list() {
        return userService.listAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody UserCreateDto dto) {
        User updated = userService.update(id, dto.username, dto.email, dto.role);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id) {
        User user = userService.toggleStatus(id);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<User> resetPassword(@PathVariable Long id, @RequestBody PasswordResetRequest request) {
        User user = userService.resetPassword(id, request.newPassword);
        return ResponseEntity.ok(user);
    }

}