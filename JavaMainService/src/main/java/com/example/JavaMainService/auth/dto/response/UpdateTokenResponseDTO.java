package com.example.JavaMainService.auth.model.response;

public record UpdateTokenResponseDTO(
        String accessToken,
        String refreshToken
) {
}
