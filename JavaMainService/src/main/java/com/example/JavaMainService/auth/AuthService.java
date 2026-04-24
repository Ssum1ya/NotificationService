package com.example.JavaMainService.auth;

import com.example.JavaMainService.auth.model.request.LoginRequestDTO;
import com.example.JavaMainService.auth.model.request.RegisterRequestDTO;
import com.example.JavaMainService.auth.model.request.UpdateTokenRequestDTO;
import com.example.JavaMainService.auth.model.response.LoginResponseDTO;
import com.example.JavaMainService.auth.model.response.UpdateTokenResponseDTO;
import com.example.JavaMainService.security.MyUserDetails;
import com.example.JavaMainService.security.MyUserDetailsService;
import com.example.JavaMainService.security.jwt.JwtService;
import com.example.JavaMainService.user.userEntity.User;
import com.example.JavaMainService.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final MyUserDetailsService myUserDetailsService;
    private final UserRepository userRepository;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(RegisterRequestDTO request) {
        Optional<User> checkLoginBusy = userRepository.findByLogin(request.login());

        if (checkLoginBusy.isPresent()) {
            throw new IllegalArgumentException("логин уже занят");
        }

        User userToSave = authMapper.registerDtoToUser(request);
        userRepository.save(userToSave);
    }

    public LoginResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByLogin(request.login()).orElseThrow(
                () -> new IllegalArgumentException("Неверный логин")
        );

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Неверный пароль");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return authMapper.userToLoginResponseDTO(user, accessToken, refreshToken);
    }

    public UpdateTokenResponseDTO updateTokens(UpdateTokenRequestDTO request) {
        String login = jwtService.extractLogin(request.refreshToken());
        MyUserDetails myUserDetails = (MyUserDetails) myUserDetailsService.loadUserByUsername(login);

        if (jwtService.validateToken(request.refreshToken(), myUserDetails)) {
            User user = myUserDetails.getUser();
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            return new UpdateTokenResponseDTO(accessToken, refreshToken);
        }

        throw new BadCredentialsException("Invalid token");
    }
}
