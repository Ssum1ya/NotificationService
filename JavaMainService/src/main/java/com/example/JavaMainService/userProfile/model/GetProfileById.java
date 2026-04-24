package com.example.JavaMainService.userProfile.model;

import java.util.UUID;

public record GetProfileById(
        UUID departmentId,
        String login,
        ProfileDTO profileDTO
) {
}
