package com.lunar.habitat.repository;

import com.lunar.habitat.entity.Budget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByFiscalYear(Integer fiscalYear);

    List<Budget> findByAnalyticAccountIdAndFiscalYear(Long analyticAccountId, Integer fiscalYear);

    Optional<Budget> findByAnalyticAccountIdAndAccountIdAndFiscalYearAndPeriod(Long analyticAccountId, Long accountId, Integer fiscalYear, String period);

    @Query("SELECT b FROM Budget b WHERE " +
           "(:fiscalYear IS NULL OR b.fiscalYear = :fiscalYear) AND " +
           "(:analyticAccountId IS NULL OR b.analyticAccount.id = :analyticAccountId) AND " +
           "(:accountId IS NULL OR b.account.id = :accountId) " +
           "ORDER BY b.fiscalYear DESC, b.period ASC")
    Page<Budget> searchBudgets(@Param("fiscalYear") Integer fiscalYear,
                               @Param("analyticAccountId") Long analyticAccountId,
                               @Param("accountId") Long accountId,
                               Pageable pageable);
}
