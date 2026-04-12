package com.example.JavaMainService.auth;

import com.example.JavaMainService.globalException.GlobalErrorResponse;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestControllerAdvice(basePackageClasses = AuthController.class)
public class AuthErrorsHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<GlobalErrorResponse> handleRegisterException(
            IllegalArgumentException ex, WebRequest request
    ) {

        GlobalErrorResponse response = new GlobalErrorResponse("BAD REQUEST", ex.getMessage(),
                MDC.get("traceId"), Instant.now().truncatedTo(ChronoUnit.SECONDS).toString(),
                request.getDescription(false).split("uri=")[1]);

        return ResponseEntity.status(401).body(response);
    }
}
