package com.example.JavaMainService.userProfile.model;

import com.example.JavaMainService.user.userEntity.RequestStatus;

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
