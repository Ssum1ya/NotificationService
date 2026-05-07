package com.example.JavaMainService.user;

import com.example.JavaMainService.userProfile.model.request.AdminUpdateUserData;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserJdbcRepository {
    private final JdbcTemplate jdbcTemplate;


    public void adminApproveRequest(UUID userId) {
        jdbcTemplate.update(UserSql.adminApproveRequest, userId);
    }

    public void adminDeclineRequest(UUID userId) {
        jdbcTemplate.update(UserSql.adminDeclineRequest, userId);
    }

    public void headApproveRequest(UUID userId) {
        jdbcTemplate.update(UserSql.headApproveRequest, userId);
    }

    public void headDeclineRequest(UUID userId) {
        jdbcTemplate.update(UserSql.headDeclineRequest, userId);
    }

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
}
