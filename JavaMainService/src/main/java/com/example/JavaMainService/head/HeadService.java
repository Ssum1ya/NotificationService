package com.example.JavaMainService.head;

import com.example.JavaMainService.user.UserRepository;
import com.example.JavaMainService.userProfile.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HeadService {
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

}
