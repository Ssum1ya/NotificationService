package com.example.JavaMainService.userProfile;

import com.example.JavaMainService.userProfile.domain.entity.Communication;
import com.example.JavaMainService.user.domain.entity.User;
import com.example.JavaMainService.userProfile.dto.request.SaveProfileDTO;
import com.example.JavaMainService.userProfile.domain.entity.Grade;
import com.example.JavaMainService.userProfile.domain.entity.Position;
import com.example.JavaMainService.userProfile.domain.entity.Profile;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {
    public Profile profileDtoToProfile(SaveProfileDTO dto, User user) {
        return new Profile(
                dto.lastName(),
                dto.name(),
                dto.surname(),
                Communication.valueOf(dto.communication().toUpperCase()),
                dto.username(),
                Position.valueOf(dto.position()),
                Grade.valueOf(dto.grade()),
                user
        );
    }
}
