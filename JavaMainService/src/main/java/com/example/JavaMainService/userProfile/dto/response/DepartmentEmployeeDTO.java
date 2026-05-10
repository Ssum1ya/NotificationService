package com.example.JavaMainService.userProfile.dto.response;

import java.util.UUID;

public record DepartmentEmployeeDTO(
        UUID id,
        String firstName,
        String lastName,
        String position,
        Boolean isHead
)  {
}
