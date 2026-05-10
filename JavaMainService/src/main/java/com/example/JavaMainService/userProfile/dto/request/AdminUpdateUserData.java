package com.example.JavaMainService.userProfile.dto.request;

import com.example.JavaMainService.userProfile.domain.entity.Communication;
import com.example.JavaMainService.user.domain.entity.RequestStatus;
import com.example.JavaMainService.user.domain.entity.Role;
import com.example.JavaMainService.userProfile.domain.entity.Grade;
import com.example.JavaMainService.userProfile.domain.entity.Position;

import java.util.UUID;

public record AdminUpdateUserData(
    String lastName,
    String name,
    String surname,
    Communication communication,
    String username,
    Position position,
    Grade grade,
    UUID departmentId,
    Role role,
    RequestStatus requestStatusAdmin,
    RequestStatus requestStatusHead
) {
}
