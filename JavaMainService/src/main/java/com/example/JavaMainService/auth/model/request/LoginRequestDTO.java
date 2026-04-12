package com.example.JavaMainService.auth.model.request;

public record LoginRequestDTO(
        String login,
        String password
) {
}
