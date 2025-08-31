package ma.onssa.gsrv.repository;

import ma.onssa.gsrv.entity.Reclamation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {
    List<Reclamation> findByStatus(String status);
}


