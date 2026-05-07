package com.example.JavaMainService.userProfile.model.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileDTO(
        @NotBlank(message = "имя обязательно")
        String name,
        @NotBlank(message = "фамилия обязательна")
        String lastName,
        @NotBlank(message = "отчество обязательно")
        String surname,
        @NotBlank(message = "вид связи обязателен")
        String communication,
        @NotBlank(message = "контактные данные обязательны")
        String username
) {
}
