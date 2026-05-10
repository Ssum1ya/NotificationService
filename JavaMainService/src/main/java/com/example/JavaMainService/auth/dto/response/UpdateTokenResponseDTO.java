package com.example.JavaMainService.auth.dto.response;

public record UpdateTokenResponseDTO(
        String accessToken,
        String refreshToken
) {
}
