package com.example.JavaMainService.user;

import com.example.JavaMainService.user.model.ProfileCheckDTO;
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

    @PutMapping("/admin/approveRequest/{userId}")
    public void adminApproveRequest(@PathVariable("userId") UUID userId) {
        userService.adminApproveRequest(userId);
    }

    @PutMapping("/admin/declineRequest/{userId}")
    public void adminDeclineRequest(@PathVariable("userId") UUID userId) {
        userService.adminDeclineRequest(userId);
    }

    @PutMapping("/head/approveRequest/{userId}")
    public void headApproveRequest(@PathVariable("userId") UUID userId) {
        userService.headApproveRequest(userId);
    }

    @PutMapping("/head/declineRequest/{userId}")
    public void headDeclineRequest(@PathVariable("userId") UUID userId) {
        userService.headDeclineRequest(userId);
    }
}
