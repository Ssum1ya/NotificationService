package com.example.JavaMainService.auth;

import com.example.JavaMainService.auth.model.request.RegisterRequestDTO;
import com.example.JavaMainService.user.Role;
import com.example.JavaMainService.user.User;
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
        user.setIsHead(false);

        return user;
    }
}
