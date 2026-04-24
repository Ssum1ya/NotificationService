package com.example.JavaMainService.auth;

import com.example.JavaMainService.globalException.exceptionsDTO.GlobalErrorResponse;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@RestControllerAdvice(basePackageClasses = AuthService.class)
public class AuthExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<GlobalErrorResponse> handleRegisterException(
            IllegalArgumentException ex, WebRequest request
    ) {

        String traceId = MDC.get("traceId");
        if (traceId == null) {
            MDC.put("traceId", UUID.randomUUID().toString());
            traceId = MDC.get("traceId");
        }

        GlobalErrorResponse response = new GlobalErrorResponse("BAD REQUEST", ex.getMessage(),
                traceId, Instant.now().truncatedTo(ChronoUnit.SECONDS).toString(),
                request.getDescription(false).split("uri=")[1]);

        return ResponseEntity.status(401).body(response);
    }
}
