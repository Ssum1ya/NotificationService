package com.example.JavaMainService.userProfile.model;

import java.util.UUID;

public record EmployeeForNotificationDTO(
        UUID id,
        String name,
        String position
) {
}
