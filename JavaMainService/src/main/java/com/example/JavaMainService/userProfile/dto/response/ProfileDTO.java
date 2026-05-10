package com.example.JavaMainService.userProfile.dto;

import com.example.JavaMainService.notifications.model.Communication;
import com.example.JavaMainService.userProfile.domain.entity.Grade;
import com.example.JavaMainService.userProfile.domain.entity.Position;

public record ProfileDTO(
        String lastName,
        String name,
        String surname,
        Communication communication,
        Position position,
        Grade grade,
        String department,
        String username
) {
}
