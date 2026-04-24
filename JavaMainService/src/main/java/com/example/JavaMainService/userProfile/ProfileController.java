package com.example.JavaMainService.userProfile;

import com.example.JavaMainService.head.model.GetEmployeesDTO;
import com.example.JavaMainService.user.userEntity.Role;
import com.example.JavaMainService.userProfile.model.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @PostMapping
    public void saveProfile(@RequestBody @Valid SaveProfileDTO request, Authentication auth) {
        profileService.saveProfile(request, auth.getName());
    }

    @GetMapping("/{profileId}")
    public ResponseEntity<ProfileDTO> getProfileById(@PathVariable("profileId") UUID userId, Authentication auth) {
        Map<String, String> credentials = (Map<String, String>) auth.getCredentials();

        String requestLogin = auth.getName();
        String requestRole = auth.getAuthorities().toArray()[0].toString();
        UUID requestDepartmentId = requestRole.equals("Admin") ? null : UUID.fromString(credentials.get("departmentId"));

        return ResponseEntity.ok(profileService.getProfileByUserId(userId, requestRole, requestDepartmentId, requestLogin));
    }

//    @GetMapping("/admin/{profileId}")
//    public ResponseEntity<ProfileDTO> adminGetProfileById(@PathVariable("profileId") UUID profileId, Authentication auth) {
//        System.err.println(auth.getAuthorities().contains("Admin"));
//        System.err.println(auth.getAuthorities().contains(Role.Admin));
//        return ResponseEntity.ok(profileService.adminGetProfileById(profileId));
//    }
//
//    @GetMapping("/head/{userId}")
//    public ResponseEntity<ProfileDTO> headGetProfileById(@PathVariable("userId") UUID userId, Authentication auth) {
//        Map<String, String> credentials = (Map<String, String>) auth.getCredentials();
//        UUID requestDepartmentId = UUID.fromString(credentials.get("departmentId"));
//
//        return ResponseEntity.ok(profileService.headGetProfileById(userId, requestDepartmentId));
//    }

    @GetMapping("/admin/departament-employees/{departmentId}")
    public ResponseEntity<List<DepartmentEmployeeDTO>> adminGetEmployeesByDepartmentId(@PathVariable("departmentId") UUID departmentId) {
        return ResponseEntity.ok(profileService.adminGetEmployeesByDepartment(departmentId));
    }

    @GetMapping("/head/departament-employees/{departmentId}")
    public ResponseEntity<List<GetEmployeesDTO>> getEmployees(@PathVariable("departmentId") UUID departmentId, Authentication auth) {
        String login = auth.getName();

        return ResponseEntity.ok(profileService.headGetEmployeesByDepartment(departmentId, login));
    }

    @GetMapping("/admin/departament-requests")
    public ResponseEntity<List<DepartmentRequestDTO>> getDepartmentRequests() {
        return ResponseEntity.ok(profileService.adminGetDepartmentRequests());
    }

    @GetMapping("/head/departament-requests/{departmentId}")
    public ResponseEntity<List<DepartmentRequestDTO>> getRequests(@PathVariable("departmentId") UUID depId) {
        return ResponseEntity.ok(profileService.headGetDepartmentRequests(depId));
    }

    @GetMapping("/head/departament-employees-for-notification/{departmentId}")
    public ResponseEntity<List<EmployeeForNotificationDTO>> getEmployeesForNotifications(@PathVariable("departmentId") UUID departmentId, Authentication auth) {
        String fromLogin = auth.getName();

        System.err.println(fromLogin);

        return ResponseEntity.ok(profileService.headGetEmployeesForNotification(departmentId, fromLogin));
    }
}
