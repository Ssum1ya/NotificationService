package com.example.JavaMainService.head;

import com.example.JavaMainService.head.model.DepartmentRequestsDTO;
import com.example.JavaMainService.head.model.GetEmployeesDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/head")
@RequiredArgsConstructor
public class HeadController {
    private final HeadService headService;
}
