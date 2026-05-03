package com.example.JavaMainService.userProfile.model;

import java.util.UUID;

public record HeadEmployeeForNotifyDTO(
        UUID id,
        String name,
        String department
) {
}
