package com.example.JavaMainService.head.model;

import java.util.UUID;

public record GetEmployeesDTO(
        UUID id,
        String name,
        String position,
        String department,
        String communication,
        String username
) {
}
