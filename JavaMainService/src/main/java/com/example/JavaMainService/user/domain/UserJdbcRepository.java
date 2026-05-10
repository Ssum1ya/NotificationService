package com.example.JavaMainService.user.domain;

import com.example.JavaMainService.userProfile.dto.request.AdminUpdateUserData;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserJdbcRepository {
    private final JdbcTemplate jdbcTemplate;

    public void makeStatusHead(UUID userId) {
        jdbcTemplate.update(UserSql.makeHeadStatus, userId);
    }

    public void adminUpdateUser(UUID userId, AdminUpdateUserData updateUserData) {
        jdbcTemplate.update(UserSql.adminUpdateUser,
                updateUserData.requestStatusAdmin().name(),
                updateUserData.requestStatusHead().name(),
                updateUserData.role().name(),
                updateUserData.departmentId(),
                userId
                );
    }

    public void headKickEmployee(UUID userId) {
        jdbcTemplate.update(UserSql.headKickEmployee, userId);
    }

    public void deleteDepartmentFromUser(UUID departmentId) {
        jdbcTemplate.update(UserSql.deleteDepartmentFromUser, departmentId);
    }
}
