package com.example.JavaMainService.userProfile.model.response;

import com.example.JavaMainService.user.userEntity.Role;

import java.util.UUID;

public record AllUsersForNotify(
        UUID id,
        String name,
        String department,
        Role role,
        String position
) {
}
