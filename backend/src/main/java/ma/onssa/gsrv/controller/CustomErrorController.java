package ma.onssa.gsrv.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute("javax.servlet.error.status_code");
        Object message = request.getAttribute("javax.servlet.error.message");
        Object path = request.getAttribute("javax.servlet.error.request_uri");

        Map<String, Object> errorResponse = new HashMap<>();

        if (status != null && status.toString().equals("404")) {
            errorResponse.put("error", "Not Found");
            errorResponse.put("message", "The requested resource was not found");
            errorResponse.put("path", path);
            errorResponse.put("timestamp", System.currentTimeMillis());
            errorResponse.put("type", "NoResourceFoundException");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        // Handle other errors
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("message", message != null ? message.toString() : "An unexpected error occurred");
        errorResponse.put("path", path);
        errorResponse.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
