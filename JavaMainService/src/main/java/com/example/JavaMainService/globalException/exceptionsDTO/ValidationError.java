package com.example.JavaMainService.globalException.exceptionsDTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ValidationError extends GlobalErrorResponse {
    private List<FieldsError> fieldErrors;

    public ValidationError(String code, String message, String traceId, String timestamp, String path, List<FieldsError> fieldErrors) {
        super(code, message, traceId, timestamp, path);
        this.fieldErrors = fieldErrors;
    }

    @Getter
    @Setter
    public static class FieldsError<T> {
        private String field;
        private String issue;
        private T rejectedValue;

        public FieldsError(String field, String issue, T rejectedValue) {
            this.field = field;
            this.issue = issue;
            this.rejectedValue = rejectedValue;
        }
    }
}
