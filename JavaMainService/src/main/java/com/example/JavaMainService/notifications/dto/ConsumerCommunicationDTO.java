package com.example.JavaMainService.notifications.dto;

import com.example.JavaMainService.userProfile.domain.entity.Communication;

public record ConsumerCommunicationDTO(
        Communication communication,
        String username
) {
}
