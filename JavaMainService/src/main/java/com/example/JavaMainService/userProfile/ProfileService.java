package com.example.JavaMainService.userProfile;

import com.example.JavaMainService.departament.Department;
import com.example.JavaMainService.departament.DepartmentJDBCRepository;
import com.example.JavaMainService.departament.DepartmentRepository;
import com.example.JavaMainService.head.model.GetEmployeesDTO;
import com.example.JavaMainService.user.UserJdbcRepository;
import com.example.JavaMainService.user.userEntity.RequestStatus;
import com.example.JavaMainService.user.userEntity.Role;
import com.example.JavaMainService.user.userEntity.User;
import com.example.JavaMainService.user.UserRepository;
import com.example.JavaMainService.userProfile.model.*;
import com.example.JavaMainService.userProfile.model.request.AdminUpdateUserData;
import com.example.JavaMainService.userProfile.model.request.HeadUpdateUserProfileDTO;
import com.example.JavaMainService.userProfile.model.request.SaveProfileDTO;
import com.example.JavaMainService.userProfile.model.request.UpdateProfileDTO;
import com.example.JavaMainService.userProfile.model.response.AllUserData;
import com.example.JavaMainService.userProfile.model.response.AllUsersForNotify;
import com.example.JavaMainService.userProfile.profileEntity.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ProfileMapper profileMapper;

    private final ProfileJdbcRepository profileJdbcRepository;
    private final UserJdbcRepository userJdbcRepository;
    private final DepartmentJDBCRepository departmentJDBCRepository;

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @Qualifier("profileRedisTemplate")
    private final RedisTemplate<String, GetProfileById> profileRedisTemplate;
    private static final String PROFILE_DTO_REDIS_PREFIX_KEY = "profileDTO:";
    private static final Integer CACHE_TTL_MINUTES = 5;

    public void saveProfile(SaveProfileDTO request, String login) {
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> new IllegalArgumentException("пользователь не найден"));
        Department department = departmentRepository.findByName(request.departament())
                .orElseThrow(() -> new IllegalArgumentException("департамент не найден"));

        Profile saveProfile = profileMapper.profileDtoToProfile(request, user);
        user.setProfile(saveProfile);
        user.setDepartment(department);
        user.setRequestStatusHead(RequestStatus.PENDING);
        user.setRequestStatusAdmin(RequestStatus.PENDING);

        userRepository.save(user);
    }

    public void updateProfileById(UUID userId, UpdateProfileDTO updateProfileDTO) {
        String redisKey = PROFILE_DTO_REDIS_PREFIX_KEY + userId;
        profileRedisTemplate.delete(redisKey);

        profileJdbcRepository.updateProfileById(userId, updateProfileDTO);
    }

    public void headUpdateProfileByUserId(UUID userId, HeadUpdateUserProfileDTO userProfileDTO) {
        String redisKey = PROFILE_DTO_REDIS_PREFIX_KEY + userId;
        profileRedisTemplate.delete(redisKey);

        profileJdbcRepository.headUpdateProfileByUserId(userId, userProfileDTO);
    }

    @Transactional
    public void adminUpdateUserDataById(UUID userId, AdminUpdateUserData updateUserData) {
        String redisKey = PROFILE_DTO_REDIS_PREFIX_KEY + userId;
        profileRedisTemplate.delete(redisKey);

        if (updateUserData.role() == Role.Head) {
            departmentJDBCRepository.makeDepartmentHead(userId);
        }

        userJdbcRepository.adminUpdateUser(userId, updateUserData);
        profileJdbcRepository.adminUpdateProfileByUserId(userId, updateUserData);
    }

    public List<AllUserData> getAllUsersData() {
        return profileJdbcRepository.getAllUsersData();
    }

    public ProfileDTO getProfileByUserId(UUID userId, String requestRole, UUID requestDepartmentId, String requestLogin) {
        String redisKey = PROFILE_DTO_REDIS_PREFIX_KEY + userId;

        GetProfileById getProfileById;

        getProfileById = profileRedisTemplate.opsForValue().get(redisKey);
        if (getProfileById == null) {
            getProfileById = profileJdbcRepository.getProfileByIdDTO(userId).orElseThrow(() -> new IllegalArgumentException("Не найден профиль"));
            profileRedisTemplate.opsForValue().set(redisKey, getProfileById, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        }

        if ((requestRole.equals("Head") && !requestDepartmentId.equals(getProfileById.departmentId()))
                || (requestRole.equals("User") && !getProfileById.login().equals(requestLogin))) {
            throw new AccessDeniedException("");
        }

        return getProfileById.profileDTO();
    }

    public List<DepartmentEmployeeDTO> adminGetEmployeesByDepartment(UUID depId) {
        return profileJdbcRepository.adminGetEmployeesByDepartment(depId);
    }

    public List<GetEmployeesDTO> headGetEmployeesByDepartment(UUID depId, String login) {
        return profileJdbcRepository.headGetEmployees(depId, login);
    }

    public List<DepartmentRequestDTO> adminGetDepartmentRequests() {
        return profileJdbcRepository.adminGetDepartmentRequests();
    }

    public List<DepartmentRequestDTO> headGetDepartmentRequests(UUID depId) {
        return profileJdbcRepository.headGetDepartmentRequests(depId);
    }

    public List<EmployeeForNotificationDTO> headGetEmployeesForNotify(UUID departmentId, String login) {
        return profileJdbcRepository.headGetEmployeesForNotification(departmentId, login);
    }

    public List<HeadEmployeeForNotifyDTO> getHeadEmployeesForNotify() {
        return profileJdbcRepository.getHeadEmployeesForNotify();
    }

    public List<AllUsersForNotify> getUsersForNotify() {
        return profileJdbcRepository.adminGetAllUsersForNotify();
    }
}
