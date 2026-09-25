package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.AccountRequest;
import com.lunar.habitat.entity.Account;
import com.lunar.habitat.enums.AccountType;
import com.lunar.habitat.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lunar/accounts")
@Tag(name = "Chart of Accounts", description = "Chart of Accounts (CoA) Master API")
public class AccountApiController {

    private final AccountService accountService;

    public AccountApiController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    @Operation(summary = "List All Accounts", description = "Retrieves all accounts in the Chart of Accounts")
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllActiveAccounts());
    }

    @GetMapping("/active")
    @Operation(summary = "List Active Accounts", description = "Retrieves only active GL accounts")
    public ResponseEntity<List<Account>> getActiveAccounts() {
        return ResponseEntity.ok(accountService.getAllActiveAccounts());
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get Accounts by Type", description = "Filters accounts by ASSET, LIABILITY, EQUITY, INCOME, or EXPENSE")
    public ResponseEntity<List<Account>> getAccountsByType(@PathVariable AccountType type) {
        return ResponseEntity.ok(accountService.getAccountsByType(type));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Account by ID", description = "Retrieves account by ID")
    public ResponseEntity<Account> getAccountById(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @PostMapping
    @Operation(summary = "Create Account", description = "Adds a new account to the Chart of Accounts with unique code validation")
    public ResponseEntity<Account> createAccount(@Valid @RequestBody AccountRequest request) {
        Account created = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Account", description = "Modifies existing account metadata")
    public ResponseEntity<Account> updateAccount(@PathVariable Long id, @Valid @RequestBody AccountRequest request) {
        return ResponseEntity.ok(accountService.updateAccount(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Account", description = "Deactivates/deletes an account. Prevents deletion if transactions exist.")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}
