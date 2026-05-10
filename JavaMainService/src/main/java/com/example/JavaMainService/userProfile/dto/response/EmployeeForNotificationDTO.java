package com.example.JavaMainService.userProfile.dto.response;

import java.util.UUID;

public record EmployeeForNotificationDTO(
        UUID id,
        String name,
        String position
) {
}
