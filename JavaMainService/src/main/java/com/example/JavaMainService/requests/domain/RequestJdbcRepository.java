package com.example.JavaMainService.requests;

import com.example.JavaMainService.requests.dto.DepartmentRequestDTO;
import com.example.JavaMainService.user.userEntity.RequestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class RequestJdbcRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<DepartmentRequestDTO> adminGetDepartmentRequests(int size, int offset) {
        return jdbcTemplate.query(RequestSql.adminGetDepartmentRequests, (rs, rowNum) ->
                        new DepartmentRequestDTO(
                                UUID.fromString(rs.getString("user_id")),
                                rs.getString("last_name") + " " + rs.getString("name") + " " + rs.getString("surname"),
                                UUID.fromString(rs.getString("department_id")),
                                rs.getString("department_name"),
                                rs.getString("grade") + " " + rs.getString("position"),
                                RequestStatus.valueOf(rs.getString("request_status_head"))
                        ),
                size,
                offset
        );
    }

    public Long countAdminGetDepartmentRequests() {
        return jdbcTemplate.queryForObject(RequestSql.countDepartmentRequests, (rs, rowNum) ->
                rs.getLong("count")
        );
    }

    public List<DepartmentRequestDTO> headGetDepartmentRequests(UUID depId, int size, int offset) {
        return jdbcTemplate.query(RequestSql.headGetDepartmentRequests, (rs, rowNum) ->
                        new DepartmentRequestDTO(
                                UUID.fromString(rs.getString("user_id")),
                                rs.getString("last_name") + " " + rs.getString("name") + " " + rs.getString("surname"),
                                UUID.fromString(rs.getString("department_id")),
                                rs.getString("department_name"),
                                rs.getString("grade") + " " + rs.getString("position"),
                                RequestStatus.valueOf(rs.getString("request_status_admin"))
                        ),
                depId,
                size,
                offset
        );
    }

    public Long countHeadGetDepartmentRequests(UUID depId) {
        return jdbcTemplate.queryForObject(RequestSql.countHeadGetDepartmentRequests, (rs, rowNum) ->
                        rs.getLong("count"),
                depId
        );
    }
}
