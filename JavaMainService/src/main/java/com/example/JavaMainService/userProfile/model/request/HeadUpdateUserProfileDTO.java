package com.example.JavaMainService.userProfile.model.request;

import com.example.JavaMainService.userProfile.profileEntity.Grade;
import com.example.JavaMainService.userProfile.profileEntity.Position;

public record HeadUpdateUserProfileDTO(
        Position position,
        Grade grade
) {
}
