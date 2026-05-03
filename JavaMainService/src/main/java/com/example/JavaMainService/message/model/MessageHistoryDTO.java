package com.example.JavaMainService.message.model;

public record MessageHistoryDTO(
        String messageTime,
        String[] usernames,
        String message
) {
}
