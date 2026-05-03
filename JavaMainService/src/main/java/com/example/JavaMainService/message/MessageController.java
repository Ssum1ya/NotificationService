package com.example.JavaMainService.message;

import com.example.JavaMainService.message.model.MessageHistoryDTO;
import com.example.JavaMainService.message.model.NotificationHistoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/message")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @GetMapping("/sending-history/{userId}")
    public ResponseEntity<List<MessageHistoryDTO>> getSendingHistoryById(@PathVariable("userId") UUID userId) {
        return ResponseEntity.ok(messageService.getSendingHistoryById(userId));
    }

    @GetMapping("/notification-history/{userId}")
    public ResponseEntity<List<NotificationHistoryDTO>> getNotificationHistoryByUserId(@PathVariable("userId") UUID userId) {
        return ResponseEntity.ok(messageService.getNotificationHistoryByUserId(userId));
    }

    @GetMapping("/young-messages/{userId}")
    public ResponseEntity<List<NotificationHistoryDTO>> getYoungMessagesById(@PathVariable("userId") UUID userId) {
        return ResponseEntity.ok(messageService.getYoungNotifications(userId));
    }
}
