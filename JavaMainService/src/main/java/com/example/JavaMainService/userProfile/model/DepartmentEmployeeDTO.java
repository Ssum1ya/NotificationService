package com.example.JavaMainService.userProfile.model;

import java.util.UUID;

public record DepartmentEmployeeDTO(
        UUID id,
        String firstName,
        String lastName,
        String position,
        Boolean isHead
)  {
}
