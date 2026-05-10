package com.example.JavaMainService.requests;

import com.example.JavaMainService.dtoLibrary.PageResponse;
import com.example.JavaMainService.requests.dto.DepartmentRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

//TODO: отрегулировать defaultValue
@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
public class RequestController {
    private final RequestService requestService;

    // Admin
    @GetMapping("/admin/department-requests")
    public ResponseEntity<PageResponse<DepartmentRequestDTO>> adminGetDepartmentRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return ResponseEntity.ok(requestService.adminGetDepartmentRequests(page, size));
    }

    @PutMapping("/admin/approveRequest/{userId}")
    public void adminApproveRequest(@PathVariable("userId") UUID userId) {
        requestService.adminApproveRequest(userId);
    }

    @PutMapping("/admin/declineRequest/{userId}")
    public void adminDeclineRequest(@PathVariable("userId") UUID userId) {
        requestService.adminDeclineRequest(userId);
    }

    // Head
    @GetMapping("/head/department-requests/{departmentId}")
    public ResponseEntity<PageResponse<DepartmentRequestDTO>> headGetDepartmentRequests(
            @PathVariable("departmentId") UUID departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return ResponseEntity.ok(requestService.headGetDepartmentRequests(departmentId, page, size));
    }

    @PutMapping("/head/approveRequest/{userId}")
    public void headApproveRequest(@PathVariable("userId") UUID userId) {
        requestService.headApproveRequest(userId);
    }

    @PutMapping("/head/declineRequest/{userId}")
    public void headDeclineRequest(@PathVariable("userId") UUID userId) {
        requestService.headDeclineRequest(userId);
    }
}
