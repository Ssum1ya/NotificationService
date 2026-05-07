package com.example.JavaMainService.userProfile.model.request;

import com.example.JavaMainService.notifications.model.Communication;
import com.example.JavaMainService.user.userEntity.RequestStatus;
import com.example.JavaMainService.user.userEntity.Role;
import com.example.JavaMainService.userProfile.profileEntity.Grade;
import com.example.JavaMainService.userProfile.profileEntity.Position;

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
