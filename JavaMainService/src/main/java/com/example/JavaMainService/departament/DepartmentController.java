package com.example.JavaMainService.departament;

import com.example.JavaMainService.departament.model.request.CreateDepDTO;
import com.example.JavaMainService.departament.model.response.GetDepartamentAllDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departament")
@RequiredArgsConstructor
public class DepartamentController {
    private final DepartamentService departamentService;

    @GetMapping("/all")
    public ResponseEntity<List<GetDepartamentAllDTO>> getAllDepartament() {
        return ResponseEntity.ok(departamentService.getAll());
    }

    @GetMapping("/user-select")
    public ResponseEntity<List<String>> user_select() {
        return ResponseEntity.ok(departamentService.user_select());
    }

    @PostMapping
    public void createDep(@RequestBody CreateDepDTO request) {
        departamentService.createDep(request);
    }
}
