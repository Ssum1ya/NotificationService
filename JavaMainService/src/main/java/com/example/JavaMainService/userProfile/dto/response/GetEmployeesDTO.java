package com.example.JavaMainService.userProfile.dto;

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
