package com.example.JavaMainService.message.model;

public record NotificationHistoryDTO(
        String message,
        String fromName,
        String message_time
) {
}
