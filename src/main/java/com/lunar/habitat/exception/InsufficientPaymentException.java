package com.lunar.habitat.exception;

public class InsufficientPaymentException extends RuntimeException {
    public InsufficientPaymentException(String message) {
        super(message);
    }
}
