package com.example.JavaMainService.notifications.model.request;

import java.util.List;
import java.util.UUID;

public record NotifyRequestDTO(
        String message,
        List<UUID> listUserIds
) {
}
