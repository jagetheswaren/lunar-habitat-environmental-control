package com.lunar.habitat.repository;

import com.lunar.habitat.entity.JournalEntryLine;
import com.lunar.habitat.enums.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;

@Repository
public interface JournalEntryLineRepository extends JpaRepository<JournalEntryLine, Long> {

    @Query("SELECT COALESCE(SUM(l.debit), 0) FROM JournalEntryLine l " +
           "WHERE l.account.id = :accountId AND l.journalEntry.status = 'POSTED'")
    BigDecimal sumDebitByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT COALESCE(SUM(l.credit), 0) FROM JournalEntryLine l " +
           "WHERE l.account.id = :accountId AND l.journalEntry.status = 'POSTED'")
    BigDecimal sumCreditByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT COALESCE(SUM(l.credit - l.debit), 0) FROM JournalEntryLine l " +
           "WHERE l.account.accountType = 'INCOME' AND l.journalEntry.status = 'POSTED' " +
           "AND (:startDate IS NULL OR l.journalEntry.entryDate >= :startDate) " +
           "AND (:endDate IS NULL OR l.journalEntry.entryDate <= :endDate)")
    BigDecimal calculateTotalRevenue(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(l.debit - l.credit), 0) FROM JournalEntryLine l " +
           "WHERE l.account.accountType = 'EXPENSE' AND l.journalEntry.status = 'POSTED' " +
           "AND (:startDate IS NULL OR l.journalEntry.entryDate >= :startDate) " +
           "AND (:endDate IS NULL OR l.journalEntry.entryDate <= :endDate)")
    BigDecimal calculateTotalExpenses(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(CASE WHEN l.account.accountType = 'EXPENSE' THEN (l.debit - l.credit) ELSE (l.credit - l.debit) END), 0) " +
           "FROM JournalEntryLine l " +
           "WHERE l.analyticAccount.id = :analyticAccountId " +
           "AND l.account.id = :accountId " +
           "AND l.journalEntry.status = 'POSTED'")
    BigDecimal calculateActualAmountForAnalyticAccountAndAccount(@Param("analyticAccountId") Long analyticAccountId,
                                                                 @Param("accountId") Long accountId);
}
