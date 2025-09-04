package ma.onssa.gsrv.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class LocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    
    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String dateString = p.getValueAsString();
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        String trimmed = dateString.trim();
        
        try {
            // Try to parse as date-only (yyyy-MM-dd) first
            if (trimmed.matches("\\d{4}-\\d{2}-\\d{2}")) {
                LocalDate date = LocalDate.parse(trimmed, DATE_FORMATTER);
                return date.atStartOfDay(); // Set time to 00:00:00
            }
            
            // Try to parse as datetime (yyyy-MM-ddTHH:mm:ss)
            return LocalDateTime.parse(trimmed, DATETIME_FORMATTER);
            
        } catch (DateTimeParseException e) {
            throw new IOException("Unable to parse date: " + dateString + ". Expected format: yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss", e);
        }
    }
}
