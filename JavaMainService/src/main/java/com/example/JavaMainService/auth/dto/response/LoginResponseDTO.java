package com.example.JavaMainService.auth.model.response;

import com.example.JavaMainService.user.domain.entity.RequestStatus;
import com.example.JavaMainService.user.domain.entity.Role;

import java.util.UUID;

public record LoginResponseDTO(
        String accessToken,
        String refreshToken,
        UUID uuid,
        String login,
        Role role,
        RequestStatus requestStatusHead,
        RequestStatus requestStatusAdmin,
        Boolean profile
) {
}
