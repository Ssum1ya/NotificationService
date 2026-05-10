package com.example.JavaMainService.requests.dto;

import com.example.JavaMainService.user.domain.entity.RequestStatus;

import java.util.UUID;

public record DepartmentRequestDTO(
        UUID userId,
        String userName,
        UUID departmentId,
        String departmentName,
        String position,
        RequestStatus requestStatus
) {
}
