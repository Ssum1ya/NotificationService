package com.example.JavaMainService.user;

import com.example.JavaMainService.departament.Department;
import com.example.JavaMainService.departament.DepartmentJDBCRepository;
import com.example.JavaMainService.departament.DepartmentRepository;
import com.example.JavaMainService.user.userEntity.RequestStatus;
import com.example.JavaMainService.user.userEntity.Role;
import com.example.JavaMainService.user.userEntity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserJdbcRepository userJDBCRepository;
    private final DepartmentJDBCRepository departmentJDBCRepository;

    public Boolean checkAccount(String login) {
        Integer i = userRepository.checkAccount(login);
        return i == 0;
    }

    @Transactional
    public void makeHead(UUID userId) {
        Optional<UUID> headId = departmentJDBCRepository.getHeadIdByUserId(userId);

        if (headId.isPresent()) {
            throw new IllegalArgumentException("Глава отдела уже назначена");
        }

        userJDBCRepository.makeStatusHead(userId);
        departmentJDBCRepository.makeDepartmentHead(userId);
    }

    public void adminApproveRequest(UUID userId) {
        userJDBCRepository.adminApproveRequest(userId);
    }

    public void adminDeclineRequest(UUID userId) {
        userJDBCRepository.adminDeclineRequest(userId);
    }

    public void headApproveRequest(UUID userId) {
        userJDBCRepository.headApproveRequest(userId);
//        User user = userRepository.getUserByProfileId(userId);
//        user.setRequestStatusHead(RequestStatus.APPROVED);
//
//        userRepository.save(user);
    }

    public void headDeclineRequest(UUID userId) {
        userJDBCRepository.headDeclineRequest(userId);
    }
}
