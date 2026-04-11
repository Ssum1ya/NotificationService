package com.example.JavaMainService.auth.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
        @NotBlank(message = "логин обязателен")
        @Size(min = 6, max = 254, message = "логин должен быть не боллее 254 и не менее 6 символов")
        String login,
        @Size(min = 8, max = 72, message = "пароль должен быть не боллее 72 и не менее 8 символов")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).*$",
                message = "пароль должен иметь хотя бы 1 букву и 1 цифру")
        String password
) {
}
