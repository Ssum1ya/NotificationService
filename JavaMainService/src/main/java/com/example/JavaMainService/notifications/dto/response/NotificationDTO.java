package com.example.JavaMainService.notifications.dto.response;

import java.util.List;

public record NotificationDTO(
        List<String> usernameList,
        String message,
        String fromFullName,
        String fromFullPosition,
        String fromDepartmentName
) {
}
