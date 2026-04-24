package com.example.JavaMainService.departament.model.response;

import java.util.UUID;

public record DepartmentDTO(
        UUID id,
        String name,
        String headName,
        Integer employeeCount
) {
}
