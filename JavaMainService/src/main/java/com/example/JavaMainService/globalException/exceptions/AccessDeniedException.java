package com.example.JavaMainService.globalException.exceptions;

public class AcessDeniedException extends RuntimeException {
  public AcessDeniedException(String message) {
    super(message);
  }
}
