package com.lunar.habitat.repository;

import com.lunar.habitat.entity.JournalEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    Optional<JournalEntry> findByJournalNumber(String journalNumber);

    @Query("SELECT j FROM JournalEntry j WHERE " +
           "(:journalId IS NULL OR j.journal.id = :journalId) AND " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:startDate IS NULL OR j.entryDate >= :startDate) AND " +
           "(:endDate IS NULL OR j.entryDate <= :endDate) " +
           "ORDER BY j.entryDate DESC, j.id DESC")
    Page<JournalEntry> searchJournalEntries(@Param("journalId") Long journalId,
                                            @Param("status") String status,
                                            @Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate,
                                            Pageable pageable);
}
