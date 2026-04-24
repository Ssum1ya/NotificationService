package com.example.JavaMainService.notifications;

import com.example.JavaMainService.notifications.model.request.NotifyRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notify")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping()
    public void sendNotify(@RequestBody NotifyRequestDTO request, Authentication auth) {
        String fromLogin = auth.getName();
        notificationService.sendNotificationsToMessengers(request, fromLogin);
    }
}
