package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.JournalEntryRequest;
import com.lunar.habitat.dto.request.JournalLineRequest;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.AccountType;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.enums.JournalType;
import com.lunar.habitat.exception.UnbalancedJournalException;
import com.lunar.habitat.repository.AccountRepository;
import com.lunar.habitat.repository.AnalyticAccountRepository;
import com.lunar.habitat.repository.JournalEntryRepository;
import com.lunar.habitat.repository.JournalRepository;
import com.lunar.habitat.service.impl.AccountingEngineServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountingEngineServiceTest {

    @Mock
    private JournalEntryRepository journalEntryRepository;

    @Mock
    private JournalRepository journalRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AnalyticAccountRepository analyticAccountRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AccountingEngineServiceImpl accountingEngineService;

    private Journal generalJournal;
    private Account cashAccount;
    private Account revenueAccount;
    private Account receivableAccount;

    @BeforeEach
    void setUp() {
        generalJournal = new Journal("GEN", "General Operations Journal", JournalType.GENERAL);
        generalJournal.setId(1L);

        cashAccount = new Account("1200", "Cash/Bank", AccountType.ASSET);
        cashAccount.setId(10L);

        receivableAccount = new Account("1300", "Accounts Receivable", AccountType.ASSET);
        receivableAccount.setId(11L);

        revenueAccount = new Account("4000", "Life-Support Utility Revenue", AccountType.INCOME);
        revenueAccount.setId(12L);
    }

    @Test
    @DisplayName("Should post balanced journal entry when Total Debit equals Total Credit")
    void testPostBalancedJournalEntrySuccess() {
        when(journalRepository.findById(1L)).thenReturn(Optional.of(generalJournal));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(cashAccount));
        when(accountRepository.findById(12L)).thenReturn(Optional.of(revenueAccount));
        when(journalEntryRepository.save(any(JournalEntry.class))).thenAnswer(invocation -> {
            JournalEntry entry = invocation.getArgument(0);
            entry.setId(100L);
            return entry;
        });

        JournalEntryRequest request = new JournalEntryRequest();
        request.setJournalId(1L);
        request.setDescription("Utility payment allocation");

        List<JournalLineRequest> lines = new ArrayList<>();
        lines.add(new JournalLineRequest(10L, null, "Debit Cash/Bank", new BigDecimal("8100.00"), BigDecimal.ZERO));
        lines.add(new JournalLineRequest(12L, null, "Credit Utility Revenue", BigDecimal.ZERO, new BigDecimal("8100.00")));
        request.setLines(lines);

        JournalEntry entry = accountingEngineService.createJournalEntry(request);

        assertNotNull(entry);
        assertEquals(new BigDecimal("8100.00"), entry.getTotalDebit());
        assertEquals(new BigDecimal("8100.00"), entry.getTotalCredit());
        verify(journalEntryRepository, times(1)).save(any(JournalEntry.class));
    }

    @Test
    @DisplayName("Should throw UnbalancedJournalException when Total Debit does not equal Total Credit")
    void testPostUnbalancedJournalEntryThrowsException() {
        when(journalRepository.findById(1L)).thenReturn(Optional.of(generalJournal));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(cashAccount));
        when(accountRepository.findById(12L)).thenReturn(Optional.of(revenueAccount));

        JournalEntryRequest request = new JournalEntryRequest();
        request.setJournalId(1L);
        request.setDescription("Unbalanced utility entry");

        List<JournalLineRequest> lines = new ArrayList<>();
        lines.add(new JournalLineRequest(10L, null, "Debit Cash/Bank", new BigDecimal("8100.00"), BigDecimal.ZERO));
        lines.add(new JournalLineRequest(12L, null, "Credit Revenue partial", BigDecimal.ZERO, new BigDecimal("5000.00")));
        request.setLines(lines);

        UnbalancedJournalException exception = assertThrows(UnbalancedJournalException.class, () ->
                accountingEngineService.createJournalEntry(request)
        );

        assertTrue(exception.getMessage().contains("Total Debit") && exception.getMessage().contains("Total Credit"));
        verify(journalEntryRepository, never()).save(any(JournalEntry.class));
    }

    @Test
    @DisplayName("Should post balanced journal entry for Customer Invoice")
    void testPostInvoiceJournalSuccess() {
        when(journalRepository.findByCode("SLS")).thenReturn(Optional.of(generalJournal));
        when(accountRepository.findByAccountCode("1300")).thenReturn(Optional.of(receivableAccount));
        when(accountRepository.findByAccountCode("4000")).thenReturn(Optional.of(revenueAccount));
        when(journalEntryRepository.save(any(JournalEntry.class))).thenAnswer(invocation -> {
            JournalEntry entry = invocation.getArgument(0);
            entry.setId(101L);
            return entry;
        });

        Contact customer = new Contact("CUST-001", "Selene Mining", "Selene Corp", ContactType.CUSTOMER, "accounts@selene.luna");
        Invoice invoice = new Invoice();
        invoice.setId(1L);
        invoice.setInvoiceNumber("INV-2026-0001");
        invoice.setCustomer(customer);
        invoice.setTotal(new BigDecimal("12500.00"));
        invoice.setInvoiceDate(LocalDate.now());

        JournalEntry entry = accountingEngineService.postCustomerInvoice(invoice);

        assertNotNull(entry);
        assertEquals(new BigDecimal("12500.00"), entry.getTotalDebit());
        assertEquals(new BigDecimal("12500.00"), entry.getTotalCredit());
    }
}
