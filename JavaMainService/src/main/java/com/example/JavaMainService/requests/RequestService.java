package com.example.JavaMainService.requests;

import com.example.JavaMainService.dtoLibrary.PageResponse;
import com.example.JavaMainService.requests.domain.RequestJdbcRepository;
import com.example.JavaMainService.requests.dto.DepartmentRequestDTO;
import com.example.JavaMainService.user.domain.UserJdbcRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestService {
    private final RequestJdbcRepository requestJdbcRepository;

    // Admin
    public PageResponse<DepartmentRequestDTO> adminGetDepartmentRequests(int page, int size) {
        int offset = page * size;
        List<DepartmentRequestDTO> departmentRequests = requestJdbcRepository.adminGetDepartmentRequests(size, offset);
        Long totalElements = requestJdbcRepository.countAdminGetDepartmentRequests();

        return new PageResponse<>(departmentRequests, page, size, totalElements);
    }

    public void adminApproveRequest(UUID userId) {
        requestJdbcRepository.adminApproveRequest(userId);
    }

    public void adminDeclineRequest(UUID userId) {
        requestJdbcRepository.adminDeclineRequest(userId);
    }

    // Head
    public PageResponse<DepartmentRequestDTO> headGetDepartmentRequests(UUID departmentId, int page, int size) {
        int offset = page * size;
        List<DepartmentRequestDTO> departmentRequests = requestJdbcRepository.headGetDepartmentRequests(departmentId, size, offset);
        Long totalElements = requestJdbcRepository.countHeadGetDepartmentRequests(departmentId);

        return new PageResponse<>(departmentRequests, page, size, totalElements);
    }

    public void headApproveRequest(UUID userId) {
        requestJdbcRepository.headApproveRequest(userId);
    }

    public void headDeclineRequest(UUID userId) {
        requestJdbcRepository.headDeclineRequest(userId);
    }
}
