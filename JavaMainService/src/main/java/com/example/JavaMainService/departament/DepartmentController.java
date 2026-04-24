package com.example.JavaMainService.departament;

import com.example.JavaMainService.departament.model.request.CreateDepartmentDTO;
import com.example.JavaMainService.departament.model.response.DepartmentDTO;
import com.example.JavaMainService.departament.model.response.DepartmentUserSelectDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
