package ma.onssa.gsrv.service;

import ma.onssa.gsrv.entity.Task;
import ma.onssa.gsrv.entity.User;
import ma.onssa.gsrv.repository.TaskRepository;
import ma.onssa.gsrv.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;

    public Task create(Task task) {
        logger.info("Creating new task: {}", task.getTitle());
        
        // Set created by user if not set
        if (task.getCreatedBy() == null) {
            // For now, set to a default user (you might want to get this from security context)
            Optional<User> defaultUser = userRepository.findById(1L);
            defaultUser.ifPresent(task::setCreatedBy);
        }
        
        Task saved = taskRepository.save(task);
        logger.info("Task created successfully with ID: {}", saved.getId());
        return saved;
    }

    public List<Task> listAll() {
        return taskRepository.findAll();
    }

    public Task getById(Long id) {
        Optional<Task> task = taskRepository.findById(id);
        return task.orElse(null);
    }

    public List<Task> getByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    public List<Task> getByStatus(String status) {
        try {
            Task.TaskStatus taskStatus = Task.TaskStatus.valueOf(status.toUpperCase());
            return taskRepository.findByStatus(taskStatus);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid task status: {}", status);
            return List.of();
        }
    }

    public Task update(Long id, Task taskDetails) {
        Optional<Task> existingTask = taskRepository.findById(id);
        if (existingTask.isPresent()) {
            Task task = existingTask.get();
            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setDueDate(taskDetails.getDueDate());
            task.setPriority(taskDetails.getPriority());
            task.setStatus(taskDetails.getStatus());
            task.setUpdatedAt(LocalDateTime.now());
            
            return taskRepository.save(task);
        }
        throw new RuntimeException("Task not found with id: " + id);
    }

    public Task updateStatus(Long id, String status) {
        Optional<Task> existingTask = taskRepository.findById(id);
        if (existingTask.isPresent()) {
            Task task = existingTask.get();
            try {
                Task.TaskStatus taskStatus = Task.TaskStatus.valueOf(status.toUpperCase());
                task.setStatus(taskStatus);
                task.setUpdatedAt(LocalDateTime.now());
                
                if (taskStatus == Task.TaskStatus.TERMINE) {
                    task.setCompletedAt(LocalDateTime.now());
                }
                
                return taskRepository.save(task);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid task status: " + status);
            }
        }
        throw new RuntimeException("Task not found with id: " + id);
    }

    public Task completeTask(Long id) {
        return updateStatus(id, "TERMINE");
    }

    public void delete(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            logger.info("Task deleted with ID: {}", id);
        } else {
            throw new RuntimeException("Task not found with id: " + id);
        }
    }
}
