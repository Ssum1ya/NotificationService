package com.example.JavaMainService.notifications;

import com.example.JavaMainService.message.MessageService;
import com.example.JavaMainService.notifications.model.request.NotifyRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/notify")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    private final NotificationService notificationService;
    private final MessageService messageService;

    @PostMapping()
    public void sendNotify(@RequestBody NotifyRequestDTO request, Authentication auth) {

        String requestRole = auth.getAuthorities().toArray()[0].toString();
        String fromLogin = auth.getName();

        notificationService.sendNotificationsToMessengers(request, fromLogin, requestRole); // sending to Kafka

        LocalDateTime now = LocalDateTime.now();
        messageService.saveMessage(request, now); // save message in postgres

        messageService.saveMessageToCache(request, now); // save message in cache
    }
}
