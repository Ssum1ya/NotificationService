package com.example.JavaMainService.head.model;

import java.util.UUID;

public record DepartmentRequestsDTO(
        UUID userId,
        String userName,
        UUID departmentId,
        String position
) {
}
