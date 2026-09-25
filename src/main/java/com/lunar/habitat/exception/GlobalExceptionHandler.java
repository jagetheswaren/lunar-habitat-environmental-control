package com.lunar.habitat.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {} at path {}", ex.getMessage(), request.getRequestURI());
        ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), "NOT_FOUND", ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(DuplicateResourceException ex, HttpServletRequest request) {
        log.warn("Duplicate resource: {} at path {}", ex.getMessage(), request.getRequestURI());
        ErrorResponse error = new ErrorResponse(HttpStatus.CONFLICT.value(), "DUPLICATE_RESOURCE", ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidStatusTransition(InvalidStatusTransitionException ex, HttpServletRequest request) {
        log.warn("Invalid status transition: {} at path {}", ex.getMessage(), request.getRequestURI());
        ErrorResponse error = new ErrorResponse(HttpStatus.UNPROCESSABLE_ENTITY.value(), "INVALID_STATUS_TRANSITION", ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(UnbalancedJournalException.class)
    public ResponseEntity<ErrorResponse> handleUnbalancedJournal(UnbalancedJournalException ex, HttpServletRequest request) {
        log.error("Unbalanced journal rejected: {} at path {}", ex.getMessage(), request.getRequestURI());
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "UNBALANCED_JOURNAL", ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InsufficientPaymentException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientPayment(InsufficientPaymentException ex, HttpServletRequest request) {
        log.warn("Payment error: {} at path {}", ex.getMessage(), request.getRequestURI());
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "PAYMENT_ERROR", ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleCustomValidation(ValidationException ex, HttpServletRequest request) {
        log.warn("Validation error: {} at path {}", ex.getMessage(), request.getRequestURI());
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "VALIDATION_ERROR", ex.getMessage(), request.getRequestURI());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleBeanValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> details = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            details.add(fieldError.getField() + ": " + fieldError.getDefaultMessage());
        }
        String message = details.isEmpty() ? "Invalid request content" : String.join(", ", details);
        log.warn("Validation failure: {} at path {}", message, request.getRequestURI());
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "VALIDATION_ERROR", message, request.getRequestURI(), details);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied at {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse error = new ErrorResponse(HttpStatus.FORBIDDEN.value(), "ACCESS_DENIED", "Access is denied for this action", request.getRequestURI());
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex, HttpServletRequest request) {
        log.warn("Authentication failed at {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse error = new ErrorResponse(HttpStatus.UNAUTHORIZED.value(), "UNAUTHORIZED", "Authentication required", request.getRequestURI());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Internal server error processing {} : {}", request.getRequestURI(), ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please contact the mission control administrator.", request.getRequestURI());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
