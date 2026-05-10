package com.example.JavaMainService.department;

import com.example.JavaMainService.department.domain.DepartmentJDBCRepository;
import com.example.JavaMainService.department.domain.DepartmentRepository;
import com.example.JavaMainService.department.domain.entity.Department;
import com.example.JavaMainService.department.dto.request.CreateDepartmentDTO;
import com.example.JavaMainService.department.dto.response.DepartmentDTO;
import com.example.JavaMainService.department.dto.response.DepartmentUserSelectDTO;
import com.example.JavaMainService.user.domain.UserJdbcRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    private final DepartmentJDBCRepository departmentJDBCRepository;
    private final UserJdbcRepository userJdbcRepository;

    public void createDepartment(CreateDepartmentDTO request) {
        Optional<UUID> findDepartmentByName = departmentJDBCRepository.getDepartmentByName(request.name());

        if (findDepartmentByName.isPresent()) {
            throw new IllegalArgumentException("Такое имя уже есть");
        }

        departmentRepository.save(new Department(request.name()));
    }

    public List<DepartmentDTO> getAllDepartments() {
        return departmentJDBCRepository.getAllDepartments();
    }

    public List<DepartmentUserSelectDTO> getAllDepartmentsName() {
        return departmentJDBCRepository.getAllDepartmentsName();
    }

    @Transactional
    public void deleteDepartment(UUID departmentId) {
        userJdbcRepository.deleteDepartmentFromUser(departmentId);
        departmentJDBCRepository.deleteDepartmentById(departmentId);
    }
}
