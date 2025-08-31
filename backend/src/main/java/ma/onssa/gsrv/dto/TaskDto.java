package ma.onssa.gsrv.dto;

import ma.onssa.gsrv.entity.Task;
import java.time.LocalDateTime;

public class TaskDto {
    public String title;
    public String description;
    public Task.TaskStatus status;
    public Task.TaskPriority priority;
    public LocalDateTime dueDate;
    public Long assignedToUserId;
    public Long createdByUserId;
}
