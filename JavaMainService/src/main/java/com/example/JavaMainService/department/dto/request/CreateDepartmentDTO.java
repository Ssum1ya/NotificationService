package com.example.JavaMainService.departament.model.request;

import jakarta.validation.constraints.NotBlank;

public record CreateDepartmentDTO(
        @NotBlank(message = "имя депортамента обязательно")
        String name
) {
}
