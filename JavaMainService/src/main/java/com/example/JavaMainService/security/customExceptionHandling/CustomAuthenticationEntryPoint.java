package com.example.JavaMainService.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    //TODO:
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        String traceId = MDC.get("traceId");
        if (traceId == null) {
            MDC.put("traceId", UUID.randomUUID().toString());
            traceId = MDC.get("traceId");
        }

        Map<String, Object> error = Map.of(
                "code", "UNAUTHORIZED",
                "message", "Токен отсутствует или невалиден",
                "traceId", traceId,
                "timestamp", Instant.now().truncatedTo(ChronoUnit.SECONDS).toString(),
                "path", request.getRequestURI()
        );

        response.setContentType("application/json; **charset=UTF-8**");
        response.setCharacterEncoding("UTF-8");

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(objectMapper.writeValueAsString(error));
        response.getWriter().flush();
    }
}
