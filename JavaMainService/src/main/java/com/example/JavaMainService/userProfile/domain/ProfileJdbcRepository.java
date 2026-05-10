package com.example.JavaMainService.userProfile.domain;

import com.example.JavaMainService.userProfile.dto.response.*;
import com.example.JavaMainService.userProfile.domain.entity.Communication;
import com.example.JavaMainService.notifications.dto.ConsumerCommunicationDTO;
import com.example.JavaMainService.notifications.dto.ProfileProducerDTO;
import com.example.JavaMainService.user.domain.entity.RequestStatus;
import com.example.JavaMainService.user.domain.entity.Role;
import com.example.JavaMainService.userProfile.dto.*;
import com.example.JavaMainService.userProfile.dto.request.AdminUpdateUserData;
import com.example.JavaMainService.userProfile.dto.request.HeadUpdateUserProfileDTO;
import com.example.JavaMainService.userProfile.dto.request.UpdateProfileDTO;
import com.example.JavaMainService.userProfile.domain.entity.Grade;
import com.example.JavaMainService.userProfile.domain.entity.Position;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Array;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ProfileJdbcRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<AllUserData> getAllUsersData(int size, int offset) {
        return jdbcTemplate.query(ProfileSql.getAllUsersData, (rs, rowNum) ->
                        new AllUserData(
                                rs.getString("last_name"),
                                rs.getString("name"),
                                rs.getString("surname"),
                                Grade.valueOf(rs.getString("grade")),
                                Position.valueOf(rs.getString("position")),
                                rs.getString("department_name"),
                                Communication.valueOf(rs.getString("communication")),
                                rs.getString("username"),
                                Role.valueOf(rs.getString("role")),
                                RequestStatus.valueOf(rs.getString("request_status_head")),
                                RequestStatus.valueOf(rs.getString("request_status_admin")),
                                UUID.fromString(rs.getString("id"))
                        ),
                size,
                offset
        );
    }

    public Long countAllUsersData() {
        return jdbcTemplate.queryForObject(ProfileSql.countAllUsersData, (rs, rowNum) ->
                        rs.getLong("count")
        );
    }

    public Optional<GetProfileById> getProfileByIdDTO(UUID userId) {
        return Optional.ofNullable(jdbcTemplate.queryForObject(ProfileSql.getProfileByUserId, (rs, rowNum) ->
                new GetProfileById(
                        UUID.fromString(rs.getString("department_id")),
                        rs.getString("login"),
                        new ProfileDTO(
                                rs.getString("last_name"),
                                rs.getString("name"),
                                rs.getString("surname"),
                                Communication.valueOf(rs.getString("communication")),
                                Position.valueOf(rs.getString("position")),
                                Grade.valueOf(rs.getString("grade")),
                                rs.getString("department_name"),
                                rs.getString("username")
                        )
                ), userId)
        );
    }

    public List<DepartmentEmployeeDTO> adminGetEmployeesByDepartment(UUID departmentId, int size, int offset) {
        return jdbcTemplate.query(ProfileSql.adminGetEmployeesByDepartment, (rs, rowNum) ->
                new DepartmentEmployeeDTO(
                        UUID.fromString(rs.getString("uuid")),
                        rs.getString("name"),
                        rs.getString("last_name"),
                        rs.getString("grade") + " " + rs.getString("position"),
                        rs.getString("role").equals("Head")
                ),
                departmentId,
                size,
                offset
        );
    }

    public Long countEmployeesByDepartment(UUID departmentId) {
        return jdbcTemplate.queryForObject(ProfileSql.countGetEmployeesByDepartment, (rs, rowNum) ->
                rs.getLong("count"),
                departmentId
        );
    }

    public List<GetEmployeesDTO> headGetEmployees(UUID depId, int size, int offset) {
        return jdbcTemplate.query(ProfileSql.headGetEmployees, (rs, rowNum) ->
                        new GetEmployeesDTO(
                                UUID.fromString(rs.getString("user_id")),
                                rs.getString("last_name") + " " + rs.getString("name") + " " + rs.getString("surname"),
                                rs.getString("grade") + " " + rs.getString("position"),
                                rs.getString("department_name"),
                                rs.getString("communication"),
                                rs.getString("username")
                        ),
                depId,
                size,
                offset
        );
    }

    public Long countHeadGetEmployees(UUID depId) {
        return jdbcTemplate.queryForObject(ProfileSql.countHeadGetEmployees, (rs, rowNum) ->
                        rs.getLong("count"),
                depId
        );
    }

    public List<EmployeeForNotificationDTO> headGetEmployeesForNotification(UUID depId, int size, int offset) {
        return jdbcTemplate.query(ProfileSql.headGetEmployeesForNotification, (rs, rowNum) ->
                        new EmployeeForNotificationDTO(
                                UUID.fromString(rs.getString("user_id")),
                                rs.getString("last_name") + " " + rs.getString("name") + " " + rs.getString("surname"),
                                rs.getString("grade") + " " + rs.getString("position")
                        ),
                depId,
                size,
                offset
        );
    }

    public Long countHeadGetEmployeesForNotification(UUID depId) {
        return jdbcTemplate.queryForObject(ProfileSql.countHeadGetEmployeesForNotification, (rs, rowNum) ->
                        rs.getLong("count"),
                depId
        );
    }

    public List<AllUsersForNotify> adminGetAllUsersForNotify(int size, int offset) {
        return jdbcTemplate.query(ProfileSql.adminGetUsersForNotify, (rs, rowNum) ->
                        new AllUsersForNotify(
                                UUID.fromString(rs.getString("user_id")),
                                rs.getString("last_name") + " " + rs.getString("name") + " " + rs.getString("surname"),
                                rs.getString("department_name"),
                                Role.valueOf(rs.getString("role")),
                                rs.getString("grade") + " " + rs.getString("position")
                        ),
                size,
                offset
        );
    }

    public Long countAllUsersForNotify() {
        return jdbcTemplate.queryForObject(ProfileSql.countUsersForNotify, (rs, rowNum) ->
                rs.getLong("count")
        );
    }

    public Optional<ProfileProducerDTO> getProfileFromProducer(String login) {
        return Optional.ofNullable(jdbcTemplate.queryForObject(ProfileSql.getProfileFromProducer, (rs, rowNum) ->
                new ProfileProducerDTO(
                        UUID.fromString(rs.getString("user_id")),
                        rs.getString("last_name") + " " + rs.getString("name") + " " + rs.getString("surname"),
                        rs.getString("grade") + " " + rs.getString("position"),
                        rs.getString("department_name")
                ), login)
        );
    }

    public List<ConsumerCommunicationDTO> getConsumerCommunication(List<UUID> listConsumersIds) {
        return jdbcTemplate.query(connection -> {
            PreparedStatement ps = connection.prepareStatement(ProfileSql.getConsumerCommunication);

            Array array = connection.createArrayOf(
                    "uuid",
                    listConsumersIds.toArray(new UUID[0])
            );

            ps.setArray(1, array);

            return ps;
        }, (rs, rowNum) ->
                        new ConsumerCommunicationDTO(
                                Communication.valueOf(rs.getString("communication")),
                                rs.getString("username")
                        )
                );
    }

    public Optional<String> getProducerName(UUID producerId) {
        return Optional.ofNullable(jdbcTemplate.queryForObject(ProfileSql.getProducerName, (rs, rowNum) ->
                rs.getString("from_name"),
                producerId)
        );
    }

    public void updateProfileById(UUID userId, UpdateProfileDTO updateProfileDTO) {
        jdbcTemplate.update(ProfileSql.updateProfileByUserId,
                updateProfileDTO.name(),
                updateProfileDTO.lastName(),
                updateProfileDTO.surname(),
                updateProfileDTO.communication().toUpperCase(),
                updateProfileDTO.username(),
                userId
        );
    }

    public void headUpdateProfileByUserId(UUID userId, HeadUpdateUserProfileDTO userProfileDTO) {
        jdbcTemplate.update(ProfileSql.headUpdateProfileByUserId,
                userProfileDTO.grade().toString(),
                userProfileDTO.position().toString(),
                userId
        );
    }

    public void adminUpdateProfileByUserId(UUID uuid, AdminUpdateUserData updateUserData) {
        jdbcTemplate.update(ProfileSql.adminUpdateProfileByUserId,
                updateUserData.name(),
                updateUserData.lastName(),
                updateUserData.surname(),
                updateUserData.communication().name(),
                updateUserData.username(),
                updateUserData.grade().name(),
                updateUserData.position().name(),
                uuid
                );
    }
}
