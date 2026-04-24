package com.example.JavaMainService.userProfile.model;

import jakarta.validation.constraints.NotBlank;

public record ProfileDTO(
        @NotBlank(message = "фамилия обязательна")
        String lastName,
        @NotBlank(message = "имя обязательно")
        String name,
        @NotBlank(message = "отчество обязательно")
        String surname,
        @NotBlank(message = "коммуникация обязательна")
        String communication,
        @NotBlank(message = "контактные данные обязательны")
        String username,
        @NotBlank(message = "департамент обязателен")
        String departament,
        @NotBlank(message = "позиция обязательна")
        String position,
        @NotBlank(message = "grade обязателен")
        String grade
) {
}
