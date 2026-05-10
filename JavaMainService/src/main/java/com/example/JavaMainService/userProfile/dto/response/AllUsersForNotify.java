package com.example.JavaMainService.userProfile.dto.response;

import com.example.JavaMainService.user.domain.entity.Role;

import java.util.UUID;

public record AllUsersForNotify(
        UUID id,
        String name,
        String department,
        Role role,
        String position
) {
}
