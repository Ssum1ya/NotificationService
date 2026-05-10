package com.example.JavaMainService.department.dto.response;

import java.util.UUID;

public record DepartmentUserSelectDTO(
        UUID id,
        String name
) {
}
