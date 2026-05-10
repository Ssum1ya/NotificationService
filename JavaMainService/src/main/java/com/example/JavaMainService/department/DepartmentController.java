package com.example.JavaMainService.department;

import com.example.JavaMainService.department.dto.request.CreateDepartmentDTO;
import com.example.JavaMainService.department.dto.response.DepartmentDTO;
import com.example.JavaMainService.department.dto.response.DepartmentUserSelectDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/departament")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentService departmentService;

    @GetMapping("/user-select-profile")
    public ResponseEntity<List<DepartmentUserSelectDTO>> userSelect() {
        return ResponseEntity.ok(departmentService.getAllDepartmentsName());
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<DepartmentDTO>> getAllDepartment() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping("/create")
    public void createDepartment(@RequestBody CreateDepartmentDTO request) {
        departmentService.createDepartment(request);
    }

    @DeleteMapping("/{departmentId}")
    public void deleteDepartment(@PathVariable("departmentId") UUID departmentId) {
        departmentService.deleteDepartment(departmentId);
    }
}
