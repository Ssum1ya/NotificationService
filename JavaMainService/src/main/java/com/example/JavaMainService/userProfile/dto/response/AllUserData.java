package com.example.JavaMainService.userProfile.dto.response;

import com.example.JavaMainService.userProfile.domain.entity.Communication;
import com.example.JavaMainService.user.domain.entity.RequestStatus;
import com.example.JavaMainService.user.domain.entity.Role;
import com.example.JavaMainService.userProfile.domain.entity.Grade;
import com.example.JavaMainService.userProfile.domain.entity.Position;

import java.util.UUID;

public record AllUserData(
        String lastName,
        String name,
        String surname,
        Grade grade,
        Position position,
        String departmentName,
        Communication communication,
        String username,
        Role role,
        RequestStatus requestStatusHead,
        RequestStatus requestStatusAdmin,
        UUID id
) {
}
