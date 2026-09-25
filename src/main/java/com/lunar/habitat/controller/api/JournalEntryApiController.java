package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.JournalEntryRequest;
import com.lunar.habitat.entity.Journal;
import com.lunar.habitat.entity.JournalEntry;
import com.lunar.habitat.repository.JournalRepository;
import com.lunar.habitat.service.AccountingEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/lunar/journals")
@Tag(name = "General Ledger & Journals", description = "Double-Entry General Ledger and Journal Entries API")
public class JournalEntryApiController {

    private final AccountingEngineService accountingEngineService;
    private final JournalRepository journalRepository;

    public JournalEntryApiController(AccountingEngineService accountingEngineService, JournalRepository journalRepository) {
        this.accountingEngineService = accountingEngineService;
        this.journalRepository = journalRepository;
    }

    @GetMapping
    @Operation(summary = "List Configured Journals", description = "Retrieves all system journals (Sales, Purchase, Bank, Cash, General)")
    public ResponseEntity<List<Journal>> getJournals() {
        return ResponseEntity.ok(journalRepository.findAll());
    }

    @PostMapping("/entries")
    @Operation(summary = "Create Journal Entry",
            description = "Creates and posts a double-entry general ledger entry. Strictly validates Total Debit == Total Credit, rejecting unbalanced entries.")
    public ResponseEntity<JournalEntry> createJournalEntry(@Valid @RequestBody JournalEntryRequest request) {
        JournalEntry created = accountingEngineService.createJournalEntry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/entries")
    @Operation(summary = "Search Journal Entries", description = "Retrieves paginated general ledger transactions with date range, journal, and status filters")
    public ResponseEntity<Page<JournalEntry>> searchJournalEntries(
            @RequestParam(required = false) Long journalId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(accountingEngineService.searchJournalEntries(journalId, status, startDate, endDate, pageable));
    }

    @GetMapping("/entries/{id}")
    @Operation(summary = "Get Journal Entry by ID", description = "Retrieves journal entry details along with itemized debit and credit line items")
    public ResponseEntity<JournalEntry> getJournalEntryById(@PathVariable Long id) {
        return ResponseEntity.ok(accountingEngineService.getJournalEntryById(id));
    }
}
