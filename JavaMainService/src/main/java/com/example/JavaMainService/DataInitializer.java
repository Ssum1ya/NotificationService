package com.example.JavaMainService;

import com.example.JavaMainService.user.userEntity.RequestStatus;
import com.example.JavaMainService.user.userEntity.Role;
import com.example.JavaMainService.user.userEntity.User;
import com.example.JavaMainService.user.UserRepository;
import com.example.JavaMainService.userProfile.ProfileRepository;
import com.example.JavaMainService.userProfile.profileEntity.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_LOGIN}")
    private String adminLogin;

    @Value("${ADMIN_PASSWORD}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByLogin(adminLogin).isEmpty()) {
            Profile profile = new Profile("", "Admin", "", null, "", null, null, null);
            User admin = new User(adminLogin, passwordEncoder.encode(adminPassword));
            admin.setRole(Role.Admin);
            admin.setRequestStatusHead(RequestStatus.APPROVED);
            admin.setRequestStatusAdmin(RequestStatus.APPROVED);

            admin.setProfile(profile);

            userRepository.save(admin);
        }
    }
}
