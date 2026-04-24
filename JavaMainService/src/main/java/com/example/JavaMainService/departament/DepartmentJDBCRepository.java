package com.example.JavaMainService.departament;

import com.example.JavaMainService.departament.model.response.DepartmentDTO;
import com.example.JavaMainService.departament.model.response.DepartmentUserSelectDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class DepartmentJDBCRepository {
    private final JdbcTemplate jdbcTemplate;

    public Optional<UUID> getDepartmentByName(String name) {
        try {
            return Optional.ofNullable(
                    jdbcTemplate.queryForObject(
                            DepartmentSql.getDepartmentByName,
                            UUID.class,
                            name
                    )
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<DepartmentDTO> getAllDepartments() {
        return jdbcTemplate.query(DepartmentSql.getAllDepartments, (rs, rowNum) ->
            new DepartmentDTO(
                    UUID.fromString(rs.getString("id")),
                    rs.getString("department_name"),
                    rs.getString("head_name"),
                    rs.getInt("count_employees")
            )
        );
    }

    public List<DepartmentUserSelectDTO> getAllDepartmentsName() {
        return jdbcTemplate.query(DepartmentSql.getAllDepartmentsName, (rs, rowNum) ->
                new DepartmentUserSelectDTO(
                        UUID.fromString(rs.getString("id")),
                        rs.getString("name")
                )
        );
    }

    public void makeDepartmentHead(UUID userId) {
        jdbcTemplate.update(DepartmentSql.makeDepartmentHead, userId, userId);
    }

    public Optional<UUID> getHeadIdByUserId(UUID userId) {
        try {
            return Optional.ofNullable(
                    jdbcTemplate.queryForObject(
                            DepartmentSql.getHeadIdByUserId,
                            UUID.class,
                            userId
                    )
            );
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
