package com.example.JavaMainService.auth;

import com.example.JavaMainService.auth.dto.request.RegisterRequestDTO;
import com.example.JavaMainService.auth.dto.response.LoginResponseDTO;
import com.example.JavaMainService.user.domain.entity.Role;
import com.example.JavaMainService.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthMapper {
    private final PasswordEncoder passwordEncoder;

    public User registerDtoToUser(RegisterRequestDTO request) {
        User user = new User(
          request.login(), passwordEncoder.encode(request.password())
        );
        user.setRole(Role.User);

        return user;
    }

    public LoginResponseDTO userToLoginResponseDTO(User user, String accessToken, String refreshToken) {
        return new LoginResponseDTO(
                accessToken,
                refreshToken,
                user.getUuid(),
                user.getLogin(),
                user.getRole(),
                user.getRequestStatusHead(),
                user.getRequestStatusAdmin(),
                user.getProfile() != null
        );
    }
}
