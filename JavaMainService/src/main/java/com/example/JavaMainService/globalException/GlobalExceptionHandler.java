package com.example.JavaMainService.globalException;

import com.example.JavaMainService.globalException.exceptions.AccessDeniedException;
import com.example.JavaMainService.globalException.exceptionsDTO.GlobalErrorResponse;
import com.example.JavaMainService.globalException.exceptionsDTO.ValidationError;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ValidationError> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {

        String traceId = MDC.get("traceId");
        if (traceId == null) {
            MDC.put("traceId", UUID.randomUUID().toString());
            traceId = MDC.get("traceId");
        }

        List<ValidationError.FieldsError> fieldsErrorList = new ArrayList<>();

        FieldError fieldError = new FieldError(
                "",
                ex.getName(),
                ex.getValue(),
                false,
                null,
                null,
                "Параметр '" + ex.getName() + "' должен быть " + ex.getRequiredType().getSimpleName() + ", получено: " + ex.getValue()
        );

        fieldsErrorList.add(new ValidationError.FieldsError<>(
                fieldError.getField(),
                fieldError.getDefaultMessage(),
                fieldError.getRejectedValue()
        ));

        ValidationError validationError = new ValidationError(
                "VALIDATION_FAILED",
                "Некоторые параметры запроса некорректны",
                traceId,
                Instant.now().truncatedTo(ChronoUnit.SECONDS).toString(),
                request.getRequestURI(),
                fieldsErrorList
        );

        return ResponseEntity.status(422).body(validationError);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationError> handleValidation(
            MethodArgumentNotValidException ex, WebRequest request
    ) {

        String traceId = MDC.get("traceId");
        if (traceId == null) {
            MDC.put("traceId", UUID.randomUUID().toString());
            traceId = MDC.get("traceId");
        }

        List<ValidationError.FieldsError> fieldsErrorList = new ArrayList<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            fieldsErrorList.add(new ValidationError.FieldsError<>(error.getField(), error.getDefaultMessage(), error.getRejectedValue()));
        });

        ValidationError validationError = new ValidationError("VALIDATION_FAILED",
                "Некоторые поля не прошли валидацию", traceId, Instant.now().truncatedTo(ChronoUnit.SECONDS).toString(), request.getDescription(false).split("uri=")[1], fieldsErrorList);

        return ResponseEntity.status(422).body(validationError);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<GlobalErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request
    ) {
        String traceId = MDC.get("traceId");
        if (traceId == null) {
            MDC.put("traceId", UUID.randomUUID().toString());
            traceId = MDC.get("traceId");
        }

        GlobalErrorResponse response = new GlobalErrorResponse("FORBIDDEN", "Недостаточно прав доступа",
                traceId, Instant.now().truncatedTo(ChronoUnit.SECONDS).toString(),
                request.getDescription(false).split("uri=")[1]);

        return ResponseEntity.status(403).body(response);
    }
}
