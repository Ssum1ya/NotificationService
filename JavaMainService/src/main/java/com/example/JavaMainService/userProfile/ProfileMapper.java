package com.example.JavaMainService.userProfile;

import com.example.JavaMainService.notifications.model.Communication;
import com.example.JavaMainService.user.userEntity.User;
import com.example.JavaMainService.userProfile.model.request.SaveProfileDTO;
import com.example.JavaMainService.userProfile.profileEntity.Grade;
import com.example.JavaMainService.userProfile.profileEntity.Position;
import com.example.JavaMainService.userProfile.profileEntity.Profile;
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
