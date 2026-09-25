package com.lunar.habitat.exception;

public class UnbalancedJournalException extends RuntimeException {
    public UnbalancedJournalException(String message) {
        super(message);
    }
}
