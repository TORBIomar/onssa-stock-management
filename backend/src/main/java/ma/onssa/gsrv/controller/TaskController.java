package ma.onssa.gsrv.controller;

import ma.onssa.gsrv.dto.TaskDto;
import ma.onssa.gsrv.entity.Task;
import ma.onssa.gsrv.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
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
        logger.info("Creating task with DTO: {}", dto);
        try {
            Task task = new Task();
            task.setTitle(dto.title);
            task.setDescription(dto.description);
            task.setDueDate(dto.dueDate);
            task.setPriority(dto.priority);
            task.setStatus(dto.status);
            
            Task created = taskService.create(task);
            logger.info("Task created successfully with ID: {}", created.getId());
            return ResponseEntity.created(URI.create("/tasks/" + created.getId())).body(created);
        } catch (Exception e) {
            logger.error("Error creating task: ", e);
            throw e;
        }
    }

    @GetMapping
    public List<Task> list() {
        return taskService.listAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getById(@PathVariable Long id) {
        Task task = taskService.getById(id);
        if (task != null) {
            return ResponseEntity.ok(task);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public List<Task> getByUser(@PathVariable Long userId) {
        return taskService.getByUser(userId);
    }

    @GetMapping("/status/{status}")
    public List<Task> getByStatus(@PathVariable String status) {
        return taskService.getByStatus(status);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable Long id, @Valid @RequestBody TaskDto dto) {
        try {
            Task task = new Task();
            task.setTitle(dto.title);
            task.setDescription(dto.description);
            task.setDueDate(dto.dueDate);
            task.setPriority(dto.priority);
            task.setStatus(dto.status);
            
            Task updated = taskService.update(id, task);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating task: ", e);
            throw e;
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Task updated = taskService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating task status: ", e);
            throw e;
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Task> completeTask(@PathVariable Long id) {
        try {
            Task completed = taskService.completeTask(id);
            return ResponseEntity.ok(completed);
        } catch (Exception e) {
            logger.error("Error completing task: ", e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
