package com.example.JavaMainService.message.dto;

public record MessageHistoryDTO(
        String messageTime,
        String[] usernames,
        String message
) {
}
