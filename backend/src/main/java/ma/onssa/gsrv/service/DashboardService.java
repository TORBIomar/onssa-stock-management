package ma.onssa.gsrv.service;

import ma.onssa.gsrv.dto.DashboardData;
import ma.onssa.gsrv.entity.*;
import ma.onssa.gsrv.repository.ProductRepository;
import ma.onssa.gsrv.repository.ReclamationRepository;
import ma.onssa.gsrv.repository.UserRepository;
import org.springframework.stereotype.Service;

// import java.util.HashMap; // Unused import
// import java.util.List; // Unused import
// import java.util.Map; // Unused import
import java.util.stream.Collectors;

@Service
public class DashboardService {

        private final ProductRepository productRepository;
        private final ReclamationRepository reclamationRepository;
        private final UserRepository userRepository;

        public DashboardService(ProductRepository productRepository,
                        ReclamationRepository reclamationRepository,
                        UserRepository userRepository) {
                this.productRepository = productRepository;
                this.reclamationRepository = reclamationRepository;
                this.userRepository = userRepository;
        }

        public DashboardData getDashboardData(User user) {
                DashboardData data = new DashboardData();
                data.userRole = user.getRole();
                data.username = user.getUsername();
                data.userId = user.getId();

                // Common stats
                data.totalProducts = productRepository.count();
                data.totalReclamations = reclamationRepository.count();
                data.lowStockProducts = productRepository.findAll().stream()
                                .filter(p -> p.getQuantity() <= p.getMinimumThreshold())
                                .collect(Collectors.toList());
                data.lowStockCount = data.lowStockProducts.size();

                // Products by category
                data.productsByCategory = productRepository.findAll().stream()
                                .collect(Collectors.groupingBy(
                                                p -> p.getCategory(),
                                                Collectors.counting()));

                // Recent reclamations (last 10)
                data.recentReclamations = reclamationRepository.findAll().stream()
                                .sorted((r1, r2) -> {
                                        if (r1.getCreatedAt() == null && r2.getCreatedAt() == null)
                                                return 0;
                                        if (r1.getCreatedAt() == null)
                                                return 1;
                                        if (r2.getCreatedAt() == null)
                                                return -1;
                                        return r2.getCreatedAt().compareTo(r1.getCreatedAt());
                                })
                                .limit(10)
                                .collect(Collectors.toList());

                // Pending reclamations
                data.pendingReclamations = reclamationRepository.findAll().stream()
                                .filter(r -> "OUVERTE".equals(r.getStatus()) || "EN_COURS".equals(r.getStatus()))
                                .collect(Collectors.toList());

                // Reclamations by status
                data.reclamationsByStatus = reclamationRepository.findAll().stream()
                                .collect(Collectors.groupingBy(
                                                r -> r.getStatus(),
                                                Collectors.counting()));

                // Role-specific data
                switch (user.getRole()) {
                        case "ADMIN":
                                setupAdminDashboard(data);
                                break;
                        case "AGENT":
                                setupAgentDashboard(data, user);
                                break;
                }

                return data;
        }

        private void setupAdminDashboard(DashboardData data) {
                data.totalUsers = userRepository.count();
                data.activeUsers = userRepository.findAll().stream()
                                .filter(User::isActive)
                                .count();
        }

        private void setupAgentDashboard(DashboardData data, User user) {
                // Agent-specific data: focus on regulatory compliance and inspections
                data.myReclamations = reclamationRepository.findAll().stream()
                                .filter(r -> r.getCreatedBy().getId().equals(user.getId()))
                                .count();

                data.resolvedReclamations = reclamationRepository.findAll().stream()
                                .filter(r -> r.getCreatedBy().getId().equals(user.getId()) &&
                                                "TRAITEE".equals(r.getStatus()))
                                .count();

                // Agent-specific metrics
                data.pendingInspections = 5L; // Mock data - in real system this would come from inspection service
                data.complianceRate = 87.5; // Mock compliance percentage
                data.regulatoryAlerts = 3L; // Mock regulatory alerts count
        }
}
