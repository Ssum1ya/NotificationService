package com.example.JavaMainService.userProfile;

import com.example.JavaMainService.department.domain.entity.Department;
import com.example.JavaMainService.department.domain.DepartmentJDBCRepository;
import com.example.JavaMainService.department.domain.DepartmentRepository;
import com.example.JavaMainService.dtoLibrary.PageResponse;
import com.example.JavaMainService.userProfile.domain.ProfileJdbcRepository;
import com.example.JavaMainService.userProfile.dto.response.*;
import com.example.JavaMainService.user.domain.UserJdbcRepository;
import com.example.JavaMainService.user.domain.entity.RequestStatus;
import com.example.JavaMainService.user.domain.entity.Role;
import com.example.JavaMainService.user.domain.entity.User;
import com.example.JavaMainService.user.domain.UserRepository;
import com.example.JavaMainService.userProfile.dto.*;
import com.example.JavaMainService.userProfile.dto.request.AdminUpdateUserData;
import com.example.JavaMainService.userProfile.dto.request.HeadUpdateUserProfileDTO;
import com.example.JavaMainService.userProfile.dto.request.SaveProfileDTO;
import com.example.JavaMainService.userProfile.dto.request.UpdateProfileDTO;
import com.example.JavaMainService.userProfile.domain.entity.Profile;
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

    public PageResponse<AllUserData> getAllUsersData(int page, int size) {
        int offset = page * size;
        List<AllUserData> allUserData = profileJdbcRepository.getAllUsersData(size, offset);
        Long total = profileJdbcRepository.countAllUsersData();
        return new PageResponse<>(allUserData, page, size, total);
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

    public PageResponse<DepartmentEmployeeDTO> adminGetEmployeesByDepartment(UUID depId, int page, int size) {
        int offset = page * size;
        List<DepartmentEmployeeDTO> departmentEmployees =
                profileJdbcRepository.adminGetEmployeesByDepartment(depId, size, offset);
        Long total = profileJdbcRepository.countEmployeesByDepartment(depId);
        return new PageResponse<>(departmentEmployees, page, size, total);
    }

    public PageResponse<GetEmployeesDTO> headGetEmployeesByDepartment(UUID depId, int page, int size) {
        int offset = page * size;
        List<GetEmployeesDTO> employees = profileJdbcRepository.headGetEmployees(depId, size, offset);
        Long total = profileJdbcRepository.countHeadGetEmployees(depId);
        return new PageResponse<>(employees, page, size, total);
    }

    public PageResponse<EmployeeForNotificationDTO> headGetEmployeesForNotify(UUID departmentId, int page, int size) {
        int offset = page * size;
        List<EmployeeForNotificationDTO> employeesForNotification =
                profileJdbcRepository.headGetEmployeesForNotification(departmentId, size, offset);
        Long total = profileJdbcRepository.countHeadGetEmployeesForNotification(departmentId);
        return new PageResponse<>(employeesForNotification, page, size, total);
    }

    public PageResponse<AllUsersForNotify> getUsersForNotify(int page, int size) {
        int offset = page * size;
        List<AllUsersForNotify> allUsersForNotify = profileJdbcRepository.adminGetAllUsersForNotify(size, offset);
        Long total = profileJdbcRepository.countAllUsersForNotify();
        return new PageResponse<>(allUsersForNotify, page, size, total);
    }
}
