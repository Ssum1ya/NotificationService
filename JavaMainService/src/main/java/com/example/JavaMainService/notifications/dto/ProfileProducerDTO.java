package com.example.JavaMainService.notifications.model;

import java.util.UUID;

public record ProfileProducerDTO(
        UUID userId,
        String fullName,
        String fullPosition,
        String departmentName
) {
}
