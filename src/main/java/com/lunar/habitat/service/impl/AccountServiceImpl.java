package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.AccountRequest;
import com.lunar.habitat.entity.Account;
import com.lunar.habitat.enums.AccountType;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.exception.DuplicateResourceException;
import com.lunar.habitat.exception.InvalidStatusTransitionException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.AccountRepository;
import com.lunar.habitat.service.AccountService;
import com.lunar.habitat.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AuditLogService auditLogService;

    public AccountServiceImpl(AccountRepository accountRepository, AuditLogService auditLogService) {
        this.accountRepository = accountRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public Account createAccount(AccountRequest request) {
        if (accountRepository.findByAccountCode(request.getAccountCode()).isPresent()) {
            throw new DuplicateResourceException("Account with code " + request.getAccountCode() + " already exists");
        }

        Account parent = null;
        if (request.getParentAccountId() != null) {
            parent = getAccountById(request.getParentAccountId());
        }

        Account account = new Account(request.getAccountCode(), request.getAccountName(), request.getAccountType(), parent);
        account.setActive(request.isActive());

        Account saved = accountRepository.save(account);
        auditLogService.log(AuditAction.CREATE, "Account", saved.getId().toString(),
                "Created account " + saved.getAccountCode() + " - " + saved.getAccountName());
        return saved;
    }

    @Override
    public Account updateAccount(Long id, AccountRequest request) {
        Account account = getAccountById(id);

        if (!account.getAccountCode().equals(request.getAccountCode()) &&
                accountRepository.findByAccountCode(request.getAccountCode()).isPresent()) {
            throw new DuplicateResourceException("Account code " + request.getAccountCode() + " is already taken");
        }

        account.setAccountCode(request.getAccountCode());
        account.setAccountName(request.getAccountName());
        account.setAccountType(request.getAccountType());
        account.setActive(request.isActive());

        if (request.getParentAccountId() != null) {
            account.setParentAccount(getAccountById(request.getParentAccountId()));
        } else {
            account.setParentAccount(null);
        }

        Account updated = accountRepository.save(account);
        auditLogService.log(AuditAction.UPDATE, "Account", updated.getId().toString(),
                "Updated account " + updated.getAccountCode());
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Account getAccountByCode(String code) {
        return accountRepository.findByAccountCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with code: " + code));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Account> getAllActiveAccounts() {
        return accountRepository.findByActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Account> getAccountsByType(AccountType type) {
        return accountRepository.findByAccountType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Account> searchAccounts(AccountType type, String query, Pageable pageable) {
        return accountRepository.searchAccounts(type, query, pageable);
    }

    @Override
    public void deleteAccount(Long id) {
        Account account = getAccountById(id);
        // Requirement: Prevent deletion of accounts that already have journal entries
        if (accountRepository.hasJournalEntries(id)) {
            throw new InvalidStatusTransitionException(
                    "Cannot delete account " + account.getAccountCode() + " because it is referenced in posted journal entries");
        }
        accountRepository.delete(account);
        auditLogService.log(AuditAction.DELETE, "Account", id.toString(), "Deleted account " + account.getAccountCode());
    }
}
