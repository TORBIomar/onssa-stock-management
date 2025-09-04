package ma.onssa.gsrv.dto;

import ma.onssa.gsrv.entity.Task;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import ma.onssa.gsrv.config.LocalDateTimeDeserializer;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class TaskDto {
    public String title;
    public String description;
    public Task.TaskStatus status;
    public Task.TaskPriority priority;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    public LocalDateTime dueDate;

    public Long assignedToUserId;
    public Long createdByUserId;
}
