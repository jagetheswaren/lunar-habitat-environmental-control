package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.JournalEntryRequest;
import com.lunar.habitat.entity.Account;
import com.lunar.habitat.entity.Invoice;
import com.lunar.habitat.entity.JournalEntry;
import com.lunar.habitat.entity.Payment;
import com.lunar.habitat.entity.VendorBill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface AccountingEngineService {
    JournalEntry createJournalEntry(JournalEntryRequest request);
    JournalEntry postCustomerInvoice(Invoice invoice);
    JournalEntry postVendorBill(VendorBill bill);
    JournalEntry postCustomerPayment(Payment payment);
    JournalEntry postVendorPayment(Payment payment);
    JournalEntry getJournalEntryById(Long id);
    Page<JournalEntry> searchJournalEntries(Long journalId, String status, LocalDate startDate, LocalDate endDate, Pageable pageable);
    Account getAccountByCode(String code);
}
