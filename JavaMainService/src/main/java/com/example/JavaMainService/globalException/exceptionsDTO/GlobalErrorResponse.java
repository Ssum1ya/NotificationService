package com.example.JavaMainService.globalException;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class GlobalErrorResponse {
    private String code;
    private String message;
    private String traceId;
    private String timestamp;
    private String path;

    public GlobalErrorResponse() {
    }

    public GlobalErrorResponse(String code, String message, String traceId, String timestamp, String path) {
        this.code = code;
        this.message = message;
        this.traceId = traceId;
        this.timestamp = timestamp;
        this.path = path;
    }
}
