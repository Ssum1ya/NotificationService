package com.example.JavaMainService.notifications.model;

import java.util.List;
import java.util.UUID;

public record NotifyRequestDTO(
        String message,
        List<UUID> listUserIds
) {
}
