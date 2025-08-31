package ma.onssa.gsrv.repository;

import ma.onssa.gsrv.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedToId(Long userId);

    List<Task> findByStatus(Task.TaskStatus status);

    List<Task> findByCreatedById(Long userId);

    List<Task> findByPriority(Task.TaskPriority priority);
}
