package com.lunar.habitat.repository;

import com.lunar.habitat.entity.Journal;
import com.lunar.habitat.enums.JournalType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {
    Optional<Journal> findByCode(String code);
    Optional<Journal> findByJournalType(JournalType journalType);
}
