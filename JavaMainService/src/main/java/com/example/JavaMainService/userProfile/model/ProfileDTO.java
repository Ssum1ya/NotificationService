package com.example.JavaMainService.userProfile.model;

import com.example.JavaMainService.notifications.model.Communication;
import com.example.JavaMainService.userProfile.profileEntity.Grade;
import com.example.JavaMainService.userProfile.profileEntity.Position;

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
