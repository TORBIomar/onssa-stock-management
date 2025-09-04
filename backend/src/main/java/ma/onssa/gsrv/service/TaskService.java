package ma.onssa.gsrv.service;

import ma.onssa.gsrv.entity.Task;
import ma.onssa.gsrv.entity.User;
import ma.onssa.gsrv.repository.TaskRepository;
import ma.onssa.gsrv.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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

        try {
            // Validate required fields
            if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Task title is required");
            }

            if (task.getDueDate() == null) {
                throw new IllegalArgumentException("Task due date is required");
            }

            // Set created by user if not set
            if (task.getCreatedBy() == null) {
                // For now, set to a default user (you might want to get this from security
                // context)
                Optional<User> defaultUser = userRepository.findById(1L);
                if (defaultUser.isPresent()) {
                    task.setCreatedBy(defaultUser.get());
                } else {
                    throw new IllegalArgumentException("Default user not found");
                }
            }

            Task saved = taskRepository.save(task);
            logger.info("Task created successfully with ID: {}", saved.getId());
            return saved;
        } catch (DataIntegrityViolationException e) {
            logger.error("Data integrity violation while creating task: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid task data: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating task: ", e);
            throw new RuntimeException("Error creating task: " + e.getMessage());
        }
    }

    public List<Task> listAll() {
        try {
            return taskRepository.findAll();
        } catch (Exception e) {
            logger.error("Error fetching all tasks: ", e);
            throw new RuntimeException("Error fetching tasks: " + e.getMessage());
        }
    }

    public Task getById(Long id) {
        try {
            Optional<Task> task = taskRepository.findById(id);
            return task.orElse(null);
        } catch (Exception e) {
            logger.error("Error fetching task with ID {}: ", id, e);
            throw new RuntimeException("Error fetching task: " + e.getMessage());
        }
    }

    public List<Task> getByUser(Long userId) {
        try {
            return taskRepository.findByAssignedToId(userId);
        } catch (Exception e) {
            logger.error("Error fetching tasks for user {}: ", userId, e);
            throw new RuntimeException("Error fetching user tasks: " + e.getMessage());
        }
    }

    public List<Task> getByStatus(String status) {
        try {
            Task.TaskStatus taskStatus = Task.TaskStatus.valueOf(status.toUpperCase());
            return taskRepository.findByStatus(taskStatus);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid task status: {}", status);
            throw new IllegalArgumentException("Invalid task status: " + status);
        } catch (Exception e) {
            logger.error("Error fetching tasks with status {}: ", status, e);
            throw new RuntimeException("Error fetching tasks by status: " + e.getMessage());
        }
    }

    public Task update(Long id, Task taskDetails) {
        logger.info("Updating task with ID: {}", id);

        try {
            Optional<Task> existingTask = taskRepository.findById(id);
            if (existingTask.isPresent()) {
                Task task = existingTask.get();

                // Validate required fields
                if (taskDetails.getTitle() == null || taskDetails.getTitle().trim().isEmpty()) {
                    throw new IllegalArgumentException("Task title is required");
                }

                task.setTitle(taskDetails.getTitle());
                task.setDescription(taskDetails.getDescription());
                task.setDueDate(taskDetails.getDueDate());
                task.setPriority(taskDetails.getPriority());
                task.setStatus(taskDetails.getStatus());
                task.setUpdatedAt(LocalDateTime.now());

                Task saved = taskRepository.save(task);
                logger.info("Task updated successfully with ID: {}", saved.getId());
                return saved;
            } else {
                throw new IllegalArgumentException("Task not found with id: " + id);
            }
        } catch (IllegalArgumentException e) {
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            logger.error("Error updating task with ID {}: ", id, e);
            throw new RuntimeException("Error updating task: " + e.getMessage());
        }
    }

    public Task updateStatus(Long id, String status) {
        logger.info("Updating task status with ID: {} to status: {}", id, status);

        try {
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

                    Task saved = taskRepository.save(task);
                    logger.info("Task status updated successfully with ID: {}", saved.getId());
                    return saved;
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Invalid task status: " + status);
                }
            } else {
                throw new IllegalArgumentException("Task not found with id: " + id);
            }
        } catch (IllegalArgumentException e) {
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            logger.error("Error updating task status with ID {}: ", id, e);
            throw new RuntimeException("Error updating task status: " + e.getMessage());
        }
    }

    public Task completeTask(Long id) {
        return updateStatus(id, "TERMINE");
    }

    public void delete(Long id) {
        logger.info("Deleting task with ID: {}", id);

        try {
            if (taskRepository.existsById(id)) {
                taskRepository.deleteById(id);
                logger.info("Task deleted successfully with ID: {}", id);
            } else {
                throw new IllegalArgumentException("Task not found with id: " + id);
            }
        } catch (DataIntegrityViolationException e) {
            logger.error("Cannot delete task with ID {} due to foreign key constraints: {}", id, e.getMessage());
            throw new IllegalStateException("Cannot delete task: it has dependencies that prevent deletion");
        } catch (IllegalArgumentException e) {
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            logger.error("Error deleting task with ID {}: ", id, e);
            throw new RuntimeException("Error deleting task: " + e.getMessage());
        }
    }
}
