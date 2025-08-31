package ma.onssa.gsrv.service;

import ma.onssa.gsrv.entity.*;
import ma.onssa.gsrv.repository.ProductRepository;
import ma.onssa.gsrv.repository.ReclamationRepository;
import ma.onssa.gsrv.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReclamationService {

    private static final Logger logger = LoggerFactory.getLogger(ReclamationService.class);

    private final ReclamationRepository reclamationRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReclamationService(ReclamationRepository reclamationRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.reclamationRepository = reclamationRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Reclamation create(Long productId, Long userId, String titre, String reason, int observedQuantity) {
        logger.info("Creating reclamation for productId: {}, userId: {}, titre: {}, reason: {}", productId, userId,
                titre, reason);

        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
            logger.info("Found product: {}", product.getName());

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
            logger.info("Found user: {}", user.getUsername());

            Reclamation r = new Reclamation();
            r.setTitre(titre);
            r.setProduct(product);
            r.setCreatedBy(user);
            r.setReason(reason);
            r.setObservedQuantity(observedQuantity);
            r.setStatus("OUVERTE");

            logger.info("Saving reclamation with status: {}", r.getStatus());
            Reclamation saved = reclamationRepository.save(r);
            logger.info("Reclamation saved successfully with ID: {}", saved.getId());

            return saved;
        } catch (Exception e) {
            logger.error("Error creating reclamation: ", e);
            throw e;
        }
    }

    public Reclamation updateStatus(Long reclamationId, String status) {
        Reclamation r = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new IllegalArgumentException("Reclamation not found: " + reclamationId));
        r.setStatus(status);
        return reclamationRepository.save(r);
    }

    @Transactional(readOnly = true)
    public List<Reclamation> listAll() {
        return reclamationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Reclamation> listByStatus(String status) {
        return reclamationRepository.findByStatus(status);
    }

    public void delete(Long id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reclamation not found: " + id));
        reclamationRepository.delete(reclamation);
    }
}
