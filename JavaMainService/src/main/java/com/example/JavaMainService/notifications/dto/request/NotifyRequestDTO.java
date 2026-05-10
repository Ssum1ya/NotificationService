package com.example.JavaMainService.notifications.dto.request;

import java.util.List;
import java.util.UUID;

public record NotifyRequestDTO(
        UUID fromId,
        String message,
        List<UUID> listUserIds
) {
}
