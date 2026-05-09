package com.example.JavaMainService.message;

import com.example.JavaMainService.dtoLibrary.PageResponse;
import com.example.JavaMainService.message.model.MessageHistoryDTO;
import com.example.JavaMainService.message.model.NotificationHistoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/message")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @GetMapping("/sending-history/{userId}")
    public ResponseEntity<PageResponse<MessageHistoryDTO>> getSendingHistoryById(
            @PathVariable("userId") UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(messageService.getSendingHistoryById(userId, page, size));
    }

    @GetMapping("/notification-history/{userId}")
    public ResponseEntity<PageResponse<NotificationHistoryDTO>> getNotificationHistoryByUserId(
            @PathVariable("userId") UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ResponseEntity.ok(messageService.getNotificationHistoryByUserId(userId, page, size));
    }

    @GetMapping("/young-messages/{userId}")
    public ResponseEntity<List<NotificationHistoryDTO>> getYoungMessagesById(
            @PathVariable("userId") UUID userId
    ) {
        return ResponseEntity.ok(messageService.getYoungNotifications(userId));
    }
}
