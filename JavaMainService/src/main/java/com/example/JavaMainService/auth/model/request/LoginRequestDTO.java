package com.example.JavaMainService.auth.model.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        String login,
        String password
) {
}
