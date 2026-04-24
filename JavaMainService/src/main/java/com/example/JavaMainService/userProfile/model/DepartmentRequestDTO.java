package com.example.JavaMainService.userProfile.model;

import java.util.UUID;

public record DepartamentRequestDTO(
        UUID userId,
        String userName,
        UUID departmentId,
        String departmentName,
        String position,
        Boolean isEnabledHead
) {
}
