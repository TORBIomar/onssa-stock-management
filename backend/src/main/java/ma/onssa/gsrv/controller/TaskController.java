package ma.onssa.gsrv.controller;

import ma.onssa.gsrv.dto.TaskDto;
import ma.onssa.gsrv.entity.Task;
import ma.onssa.gsrv.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = { "http://localhost:4200" })
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<Task> create(@Valid @RequestBody TaskDto dto) {
        try {
            logger.info("Creating task with DTO: {}", dto);
            logger.info("Due date received: {}", dto.dueDate);
            logger.info("Due date type: {}", dto.dueDate != null ? dto.dueDate.getClass().getSimpleName() : "null");
            Task task = new Task();
            task.setTitle(dto.title);
            task.setDescription(dto.description);
            task.setDueDate(dto.dueDate);
            task.setPriority(dto.priority);
            task.setStatus(dto.status);

            Task created = taskService.create(task);
            logger.info("Task created successfully with ID: {}", created.getId());
            return ResponseEntity.created(URI.create("/tasks/" + created.getId())).body(created);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid task data: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error creating task: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Task>> list() {
        try {
            List<Task> tasks = taskService.listAll();
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            logger.error("Error fetching tasks: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getById(@PathVariable Long id) {
        try {
            Task task = taskService.getById(id);
            if (task != null) {
                return ResponseEntity.ok(task);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching task with ID {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getByUser(@PathVariable Long userId) {
        try {
            List<Task> tasks = taskService.getByUser(userId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            logger.error("Error fetching tasks for user {}: ", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Task>> getByStatus(@PathVariable String status) {
        try {
            List<Task> tasks = taskService.getByStatus(status);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            logger.error("Error fetching tasks with status {}: ", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable Long id, @Valid @RequestBody TaskDto dto) {
        try {
            logger.info("Updating task with ID: {}", id);
            logger.info("Due date received: {}", dto.dueDate);
            Task task = new Task();
            task.setTitle(dto.title);
            task.setDescription(dto.description);
            task.setDueDate(dto.dueDate);
            task.setPriority(dto.priority);
            task.setStatus(dto.status);

            Task updated = taskService.update(id, task);
            logger.info("Task updated successfully with ID: {}", updated.getId());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            logger.warn("Task not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating task with ID {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            logger.info("Updating task status with ID: {} to status: {}", id, status);
            Task updated = taskService.updateStatus(id, status);
            logger.info("Task status updated successfully with ID: {}", updated.getId());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            logger.warn("Task not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating task status with ID {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Task> completeTask(@PathVariable Long id) {
        try {
            logger.info("Completing task with ID: {}", id);
            Task completed = taskService.completeTask(id);
            logger.info("Task completed successfully with ID: {}", completed.getId());
            return ResponseEntity.ok(completed);
        } catch (IllegalArgumentException e) {
            logger.warn("Task not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error completing task with ID {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            logger.info("Deleting task with ID: {}", id);
            taskService.delete(id);
            logger.info("Task deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.warn("Task not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting task with ID {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
