package ma.onssa.gsrv.controller;

import jakarta.validation.Valid;
import ma.onssa.gsrv.dto.ReclamationCreateDto;
import ma.onssa.gsrv.entity.Reclamation;

import ma.onssa.gsrv.service.ReclamationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/reclamations")
@CrossOrigin(origins = { "http://localhost:4200" })
public class ReclamationController {

    private final ReclamationService reclamationService;

    public ReclamationController(ReclamationService reclamationService) {
        this.reclamationService = reclamationService;
    }

    @PostMapping
    public ResponseEntity<Reclamation> create(@Valid @RequestBody ReclamationCreateDto dto) {
        Reclamation created = reclamationService.create(dto.productId, dto.userId, dto.titre, dto.reason,
                dto.observedQuantity);
        return ResponseEntity.created(URI.create("/reclamations/" + created.getId())).body(created);
    }

    @GetMapping
    public List<Reclamation> list() {
        return reclamationService.listAll();
    }

    @GetMapping("/status/{status}")
    public List<Reclamation> listByStatus(@PathVariable String status) {
        return reclamationService.listByStatus(status);
    }

    @PatchMapping("/{id}/status")
    public Reclamation updateStatus(@PathVariable Long id, @RequestParam String status) {
        return reclamationService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reclamationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
