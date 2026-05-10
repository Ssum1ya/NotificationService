package com.example.JavaMainService.user;

import com.example.JavaMainService.user.dto.ProfileCheckDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/check/{login}")
    public ResponseEntity<ProfileCheckDTO> checkProfile(@PathVariable("login") String login) {
        return ResponseEntity.ok(new ProfileCheckDTO(userService.checkAccount(login)));
    }

    @PutMapping("/admin/makeHead/{userId}")
    public void makeHead(@PathVariable("userId") UUID userId) {
        userService.makeHead(userId);
    }
    
    @PutMapping("/head/kick/{userId}")
    public void headKickEmployee(@PathVariable("userId") UUID userId) {
        userService.headKickEmployee(userId);
    }
}
