package ma.onssa.gsrv.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/auth")
    public Map<String, Object> testAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();

        response.put("authenticated", auth != null && auth.isAuthenticated());
        response.put("username", auth != null ? auth.getName() : "anonymous");
        response.put("authorities", auth != null ? auth.getAuthorities() : "none");

        return response;
    }
}
