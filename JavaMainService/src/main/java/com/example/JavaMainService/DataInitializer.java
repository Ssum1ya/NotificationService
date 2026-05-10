package com.example.JavaMainService;

import com.example.JavaMainService.user.domain.entity.RequestStatus;
import com.example.JavaMainService.user.domain.entity.Role;
import com.example.JavaMainService.user.domain.entity.User;
import com.example.JavaMainService.user.domain.UserRepository;
import com.example.JavaMainService.userProfile.domain.entity.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
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
