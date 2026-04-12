package com.example.JavaMainService.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        Map<String, Object> error = Map.of(
                "code", "FORBIDDEN",
                "message", "Недостаточно прав доступа",
                "traceId", MDC.get("traceId"),
                "timestamp", Instant.now().truncatedTo(ChronoUnit.SECONDS).toString(),
                "path", request.getRequestURI()
        );

        response.setContentType("application/json; **charset=UTF-8**");
        response.setCharacterEncoding("UTF-8");

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(objectMapper.writeValueAsString(error));
        response.getWriter().flush();

    }
}
