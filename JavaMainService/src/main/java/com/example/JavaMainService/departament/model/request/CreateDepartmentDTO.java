package com.example.JavaMainService.departament.model.request;

import jakarta.validation.constraints.NotBlank;

public record CreateDepDTO(
        @NotBlank(message = "депортамент обязателен")
        String name
) {
}
