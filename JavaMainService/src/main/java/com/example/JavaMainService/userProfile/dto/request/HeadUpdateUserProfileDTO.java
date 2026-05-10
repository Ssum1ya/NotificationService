package com.example.JavaMainService.userProfile.dto.request;

import com.example.JavaMainService.userProfile.domain.entity.Grade;
import com.example.JavaMainService.userProfile.domain.entity.Position;

public record HeadUpdateUserProfileDTO(
        Position position,
        Grade grade
) {
}
