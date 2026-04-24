package com.example.JavaMainService.departament;

import com.example.JavaMainService.departament.model.request.CreateDepartmentDTO;
import com.example.JavaMainService.departament.model.response.DepartmentDTO;
import com.example.JavaMainService.departament.model.response.DepartmentUserSelectDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final DepartmentJDBCRepository departmentJDBCRepository;

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
}
