package com.lunar.habitat.entity;

import com.lunar.habitat.enums.AccountType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_code", nullable = false, unique = true, length = 50)
    private String accountCode;

    @Column(name = "account_name", nullable = false, length = 150)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 20)
    private AccountType accountType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_account_id")
    private Account parentAccount;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Account() {}

    public Account(String accountCode, String accountName, AccountType accountType, Account parentAccount) {
        this.accountCode = accountCode;
        this.accountName = accountName;
        this.accountType = accountType;
        this.parentAccount = parentAccount;
        this.active = true;
    }

    public Account(String accountCode, String accountName, AccountType accountType) {
        this(accountCode, accountName, accountType, null);
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Account getParentAccount() {
        return parentAccount;
    }

    public void setParentAccount(Account parentAccount) {
        this.parentAccount = parentAccount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
