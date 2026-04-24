package com.example.JavaMainService.user;

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
}
