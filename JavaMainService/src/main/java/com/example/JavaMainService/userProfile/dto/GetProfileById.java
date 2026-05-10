package com.example.JavaMainService.userProfile.dto;

import com.example.JavaMainService.userProfile.dto.response.ProfileDTO;

import java.util.UUID;

public record GetProfileById(
        UUID departmentId,
        String login,
        ProfileDTO profileDTO
) {
}
