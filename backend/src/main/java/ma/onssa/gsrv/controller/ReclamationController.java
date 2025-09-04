package ma.onssa.gsrv.controller;

import jakarta.validation.Valid;
import ma.onssa.gsrv.dto.ReclamationCreateDto;
import ma.onssa.gsrv.entity.Reclamation;

import ma.onssa.gsrv.service.ReclamationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/reclamations")
@CrossOrigin(origins = { "http://localhost:4200" })
public class ReclamationController {

    private static final Logger logger = LoggerFactory.getLogger(ReclamationController.class);
    private final ReclamationService reclamationService;

    public ReclamationController(ReclamationService reclamationService) {
        this.reclamationService = reclamationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Reclamation> create(@Valid @RequestBody ReclamationCreateDto dto) {
        Reclamation created = reclamationService.create(dto.productId, dto.userId, dto.titre, dto.reason,
                dto.observedQuantity);
        return ResponseEntity.created(URI.create("/reclamations/" + created.getId())).body(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<Reclamation> list() {
        return reclamationService.listAll();
    }

    @GetMapping("/my-reclamations")
    @PreAuthorize("hasAnyRole('AGENT')")
    public List<Reclamation> myReclamations() {
        // This would need to be implemented in the service to filter by current user
        return reclamationService.listAll(); // Placeholder - should filter by current user
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Reclamation> listByStatus(@PathVariable String status) {
        return reclamationService.listByStatus(status);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Reclamation updateStatus(@PathVariable Long id, @RequestParam String status) {
        return reclamationService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            logger.info("Deleting reclamation with ID: {}", id);
            reclamationService.delete(id);
            logger.info("Reclamation deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.warn("Reclamation not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            logger.warn("Cannot delete reclamation with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            logger.error("Error deleting reclamation with ID {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
