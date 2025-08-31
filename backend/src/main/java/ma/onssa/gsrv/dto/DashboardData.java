package ma.onssa.gsrv.dto;

import ma.onssa.gsrv.entity.Product;
import ma.onssa.gsrv.entity.Reclamation;


import java.util.List;
import java.util.Map;

public class DashboardData {
    public String userRole;
    public String username;
    public Long userId;

    // Common stats
    public long totalProducts;
    public long totalReclamations;
    public long lowStockCount;

    // Role-specific data
    public List<Product> lowStockProducts;
    public List<Reclamation> recentReclamations;
    public List<Reclamation> pendingReclamations;
    public Map<String, Long> productsByCategory;
    public Map<String, Long> reclamationsByStatus;

    // Admin-specific
    public long totalUsers;
    public long activeUsers;

    // Agent/Veterinarian-specific
    public long myReclamations;
    public long resolvedReclamations;
}
