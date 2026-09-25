package com.lunar.habitat.repository;

import com.lunar.habitat.entity.Account;
import com.lunar.habitat.enums.AccountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountCode(String accountCode);

    List<Account> findByAccountType(AccountType accountType);

    List<Account> findByActiveTrue();

    @Query("SELECT COUNT(l) > 0 FROM JournalEntryLine l WHERE l.account.id = :accountId")
    boolean hasJournalEntries(@Param("accountId") Long accountId);

    @Query("SELECT a FROM Account a WHERE " +
           "(:type IS NULL OR a.accountType = :type) AND " +
           "(:query IS NULL OR LOWER(a.accountName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.accountCode) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY a.accountCode ASC")
    Page<Account> searchAccounts(@Param("type") AccountType type,
                                 @Param("query") String query,
                                 Pageable pageable);
}
