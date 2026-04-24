package com.example.JavaMainService.userProfile.model;

import java.util.UUID;

public record DepartamentEmployeeDTO(
        UUID id,
        String firstName,
        String lastName,
        String position,
        Boolean isHead
)  {
}
