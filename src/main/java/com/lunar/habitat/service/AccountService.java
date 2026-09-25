package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.AccountRequest;
import com.lunar.habitat.entity.Account;
import com.lunar.habitat.enums.AccountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AccountService {
    Account createAccount(AccountRequest request);
    Account updateAccount(Long id, AccountRequest request);
    Account getAccountById(Long id);
    Account getAccountByCode(String code);
    List<Account> getAllActiveAccounts();
    List<Account> getAccountsByType(AccountType type);
    Page<Account> searchAccounts(AccountType type, String query, Pageable pageable);
    void deleteAccount(Long id);
}
