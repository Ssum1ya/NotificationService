package com.example.JavaMainService.userProfile.model;

import java.util.UUID;

public record HeadEmployeeForNotificationDTO(
        UUID id,
        String name,
        String department
) {
}
