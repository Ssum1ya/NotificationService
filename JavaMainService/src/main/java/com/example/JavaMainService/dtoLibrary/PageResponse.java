package com.example.JavaMainService.dtoLibrary;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public PageResponse(List<T> content, int page, int size, long totalElements) {
        this(content, page, size, totalElements, (int) Math.ceil((double) totalElements / size));
    }
}
