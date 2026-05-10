package com.example.JavaMainService.user;

import com.example.JavaMainService.department.domain.DepartmentJDBCRepository;
import com.example.JavaMainService.user.domain.UserJdbcRepository;
import com.example.JavaMainService.user.domain.UserRepository;
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

    public void headKickEmployee(UUID userId) {
        userJDBCRepository.headKickEmployee(userId);
    }
}
