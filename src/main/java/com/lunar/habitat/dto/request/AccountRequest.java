package com.lunar.habitat.dto.request;

import com.lunar.habitat.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AccountRequest {

    @NotBlank(message = "Account code is required")
    @Size(max = 50, message = "Account code must be at most 50 characters")
    private String accountCode;

    @NotBlank(message = "Account name is required")
    @Size(max = 150, message = "Account name must be at most 150 characters")
    private String accountName;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    private Long parentAccountId;
    private boolean active = true;

    public AccountRequest() {}

    public AccountRequest(String accountCode, String accountName, AccountType accountType, Long parentAccountId) {
        this.accountCode = accountCode;
        this.accountName = accountName;
        this.accountType = accountType;
        this.parentAccountId = parentAccountId;
        this.active = true;
    }

    public String getAccountCode() {
        return accountCode;
    }

    public void setAccountCode(String accountCode) {
        this.accountCode = accountCode;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public Long getParentAccountId() {
        return parentAccountId;
    }

    public void setParentAccountId(Long parentAccountId) {
        this.parentAccountId = parentAccountId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
