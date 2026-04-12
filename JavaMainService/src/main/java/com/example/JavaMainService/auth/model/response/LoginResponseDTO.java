package com.example.JavaMainService.auth.model.response;

public record LoginResponseDTO(
        String accessToken,
        String refreshToken
) {
}
