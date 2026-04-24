package com.example.JavaMainService.auth;

import com.example.JavaMainService.auth.model.request.LoginRequestDTO;
import com.example.JavaMainService.auth.model.request.RegisterRequestDTO;
import com.example.JavaMainService.auth.model.request.UpdateTokenRequestDTO;
import com.example.JavaMainService.auth.model.response.LoginResponseDTO;
import com.example.JavaMainService.auth.model.response.UpdateTokenResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequestDTO request) {
        authService.register(request);

        return ResponseEntity.ok(null);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/updateAcessToken")
    public ResponseEntity<UpdateTokenResponseDTO> updateAccessToken(@RequestBody UpdateTokenRequestDTO request) {
        return ResponseEntity.ok(authService.updateTokens(request));
    }
}
