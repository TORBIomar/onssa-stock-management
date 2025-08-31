package ma.onssa.gsrv.config;

import ma.onssa.gsrv.entity.User;
import ma.onssa.gsrv.entity.Product;
import ma.onssa.gsrv.entity.Reclamation;
import ma.onssa.gsrv.repository.UserRepository;
import ma.onssa.gsrv.repository.ProductRepository;
import ma.onssa.gsrv.repository.ReclamationRepository;
import ma.onssa.gsrv.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReclamationRepository reclamationRepository;

    public DataInitializer(UserService userService, UserRepository userRepository, 
                          ProductRepository productRepository, ReclamationRepository reclamationRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reclamationRepository = reclamationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if no users exist
        if (userRepository.count() == 0) {
            try {
                User adminUser = userService.create(
                        "admin",
                        "admin123",
                        "admin@gsrv.com",
                        "ADMIN");
                System.out.println("Default admin user created: " + adminUser.getUsername());
                
                // Create sample data after admin user is created
                createSampleData(adminUser);
            } catch (Exception e) {
                System.err.println("Error creating default admin user: " + e.getMessage());
            }
        } else if (productRepository.count() == 0) {
            // If users exist but no products, create sample data
            User adminUser = userRepository.findByUsername("admin")
                    .orElse(userRepository.findAll().get(0));
            createSampleData(adminUser);
        }
    }
    
    private void createSampleData(User adminUser) {
        try {
            // Create sample products
            createSampleProducts();
            
            // Create sample reclamations
            createSampleReclamations(adminUser);
            
            System.out.println("Sample data created successfully!");
        } catch (Exception e) {
            System.err.println("Error creating sample data: " + e.getMessage());
        }
    }
    
    private void createSampleProducts() {
        Product[] products = {
            createProduct("Vaccin Anti-Rabique", "VACCIN", 50, 10, LocalDate.of(2025, 12, 31)),
            createProduct("Médicament Anti-Parasitaire", "MEDICAMENT_VETERINAIRE", 30, 5, LocalDate.of(2025, 6, 30)),
            createProduct("Aliment pour Bovins", "ALIMENT_ANIMAL", 100, 20, LocalDate.of(2025, 9, 30)),
            createProduct("Produit Import/Export", "IMPORT_EXPORT", 25, 5, LocalDate.of(2025, 12, 31)),
            createProduct("Vaccin Contre la Fièvre Aphteuse", "VACCIN", 75, 15, LocalDate.of(2025, 8, 15)),
            createProduct("Antibiotique Vétérinaire", "MEDICAMENT_VETERINAIRE", 45, 8, LocalDate.of(2025, 11, 20)),
            createProduct("Aliment pour Volailles", "ALIMENT_ANIMAL", 120, 25, LocalDate.of(2025, 7, 10)),
            createProduct("Certificat Sanitaire", "IMPORT_EXPORT", 10, 2, LocalDate.of(2025, 12, 31))
        };
        
        for (Product product : products) {
            productRepository.save(product);
        }
        System.out.println("Sample products created: " + products.length);
    }
    
    private Product createProduct(String name, String category, int quantity, int minimumThreshold, LocalDate expiryDate) {
        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setQuantity(quantity);
        product.setMinimumThreshold(minimumThreshold);
        product.setExpiryDate(expiryDate);
        return product;
    }
    
    private void createSampleReclamations(User adminUser) {
        // Get the first few products for reclamations
        var products = productRepository.findAll();
        if (products.isEmpty()) return;
        
        Reclamation[] reclamations = {
            createReclamation("Stock faible détecté", products.get(0), adminUser, 
                           "Quantité en dessous du seuil minimum", 8, "OUVERTE"),
            createReclamation("Produit expiré", products.get(1), adminUser, 
                           "Date de péremption dépassée", 5, "EN_COURS"),
            createReclamation("Qualité dégradée", products.get(2), adminUser, 
                           "Produit présentant des signes de détérioration", 15, "TRAITEE"),
            createReclamation("Emballage endommagé", products.get(3), adminUser, 
                           "Emballage ouvert ou endommagé", 3, "REJETEE")
        };
        
        for (Reclamation reclamation : reclamations) {
            reclamationRepository.save(reclamation);
        }
        System.out.println("Sample reclamations created: " + reclamations.length);
    }
    
    private Reclamation createReclamation(String titre, Product product, User createdBy, 
                                        String reason, int observedQuantity, String status) {
        Reclamation reclamation = new Reclamation();
        reclamation.setTitre(titre);
        reclamation.setProduct(product);
        reclamation.setCreatedBy(createdBy);
        reclamation.setReason(reason);
        reclamation.setObservedQuantity(observedQuantity);
        reclamation.setStatus(status);
        return reclamation;
    }
}
