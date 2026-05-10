package com.example.JavaMainService.message.dto;

public record NotificationHistoryDTO(
        String message,
        String fromName,
        String message_time
) {
}
