package com.example.JavaMainService.auth.model.response;

import com.example.JavaMainService.user.userEntity.RequestStatus;
import com.example.JavaMainService.user.userEntity.Role;

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
