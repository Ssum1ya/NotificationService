package com.example.JavaMainService.department.dto.response;

import java.util.UUID;

public record DepartmentDTO(
        UUID id,
        String name,
        String headName,
        Integer employeeCount
) {
}
