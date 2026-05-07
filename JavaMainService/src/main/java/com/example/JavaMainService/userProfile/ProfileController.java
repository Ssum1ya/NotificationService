package com.example.JavaMainService.userProfile;

import com.example.JavaMainService.head.model.GetEmployeesDTO;
import com.example.JavaMainService.userProfile.model.*;
import com.example.JavaMainService.userProfile.model.request.AdminUpdateUserData;
import com.example.JavaMainService.userProfile.model.request.HeadUpdateUserProfileDTO;
import com.example.JavaMainService.userProfile.model.request.SaveProfileDTO;
import com.example.JavaMainService.userProfile.model.request.UpdateProfileDTO;
import com.example.JavaMainService.userProfile.model.response.AllUserData;
import com.example.JavaMainService.userProfile.model.response.AllUsersForNotify;
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

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateProfileById(@PathVariable("userId") UUID userId, @RequestBody @Valid UpdateProfileDTO updateProfileDTO) {
        profileService.updateProfileById(userId, updateProfileDTO);

        return ResponseEntity.ok(null);
    }

    @PutMapping("/head/{userId}")
    public ResponseEntity<Void> headUpdateProfileByUserId(@PathVariable("userId") UUID userId, @RequestBody HeadUpdateUserProfileDTO userProfileDTO) {
        profileService.headUpdateProfileByUserId(userId, userProfileDTO);
        return ResponseEntity.ok(null);
    }

    @PutMapping("/admin/{userId}")
    public ResponseEntity<Void> adminUpdateUserDataById(@PathVariable("userId") UUID userId, @RequestBody AdminUpdateUserData updateUserData) {
        profileService.adminUpdateUserDataById(userId, updateUserData);
        return ResponseEntity.ok(null);
    }

    @GetMapping("/admin/all-user-profiles")
    public ResponseEntity<List<AllUserData>> getAllUsersData() {
        return ResponseEntity.ok(profileService.getAllUsersData());
    }

    @GetMapping("/{profileId}")
    public ResponseEntity<ProfileDTO> getProfileById(@PathVariable("profileId") UUID userId, Authentication auth) {
        Map<String, String> credentials = (Map<String, String>) auth.getCredentials();

        String requestLogin = auth.getName();
        String requestRole = auth.getAuthorities().toArray()[0].toString();
        UUID requestDepartmentId = requestRole.equals("Admin") ? null : UUID.fromString(credentials.get("departmentId"));

        return ResponseEntity.ok(profileService.getProfileByUserId(userId, requestRole, requestDepartmentId, requestLogin));
    }

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

        return ResponseEntity.ok(profileService.headGetEmployeesForNotify(departmentId, fromLogin));
    }

    @GetMapping("/admin/users-for-notification")
    public ResponseEntity<List<AllUsersForNotify>> getUsersForNotify() {
        return ResponseEntity.ok(profileService.getUsersForNotify());
    }
}
