package com.example.JavaMainService.department.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateDepartmentDTO(
        @NotBlank(message = "имя депортамента обязательно")
        String name
) {
}
