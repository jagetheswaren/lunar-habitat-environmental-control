package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.JournalEntryRequest;
import com.lunar.habitat.dto.request.JournalLineRequest;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.enums.JournalType;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.exception.UnbalancedJournalException;
import com.lunar.habitat.repository.AccountRepository;
import com.lunar.habitat.repository.AnalyticAccountRepository;
import com.lunar.habitat.repository.JournalEntryRepository;
import com.lunar.habitat.repository.JournalRepository;
import com.lunar.habitat.service.AccountingEngineService;
import com.lunar.habitat.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional
public class AccountingEngineServiceImpl implements AccountingEngineService {

    public static final String ACC_INFRASTRUCTURE = "1000";
    public static final String ACC_SCRUBBING_EQUIP = "1100";
    public static final String ACC_CASH_BANK = "1200";
    public static final String ACC_ACCOUNTS_RECEIVABLE = "1300";
    public static final String ACC_VENDOR_CREDITORS = "2000";
    public static final String ACC_UTILITY_REVENUE = "4000";
    public static final String ACC_LEASE_INCOME = "4100";
    public static final String ACC_MAINTENANCE_EXPENSE = "5000";
    public static final String ACC_LOGISTICS_EXPENSE = "5100";

    private final JournalEntryRepository journalEntryRepository;
    private final JournalRepository journalRepository;
    private final AccountRepository accountRepository;
    private final AnalyticAccountRepository analyticAccountRepository;
    private final AuditLogService auditLogService;

    public AccountingEngineServiceImpl(JournalEntryRepository journalEntryRepository,
                                        JournalRepository journalRepository,
                                        AccountRepository accountRepository,
                                        AnalyticAccountRepository analyticAccountRepository,
                                        AuditLogService auditLogService) {
        this.journalEntryRepository = journalEntryRepository;
        this.journalRepository = journalRepository;
        this.accountRepository = accountRepository;
        this.analyticAccountRepository = analyticAccountRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public JournalEntry createJournalEntry(JournalEntryRequest request) {
        Journal journal = journalRepository.findById(request.getJournalId())
                .orElseThrow(() -> new ResourceNotFoundException("Journal not found with ID: " + request.getJournalId()));

        JournalEntry entry = new JournalEntry();
        entry.setJournal(journal);
        entry.setJournalNumber("JRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        entry.setEntryDate(request.getEntryDate() != null ? request.getEntryDate() : LocalDate.now());
        entry.setDescription(request.getDescription());
        entry.setReferenceType(request.getReferenceType());
        entry.setReferenceId(request.getReferenceId());
        entry.setStatus("POSTED");

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (JournalLineRequest lineReq : request.getLines()) {
            Account account = accountRepository.findById(lineReq.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + lineReq.getAccountId()));

            AnalyticAccount analytic = null;
            if (lineReq.getAnalyticAccountId() != null) {
                analytic = analyticAccountRepository.findById(lineReq.getAnalyticAccountId()).orElse(null);
            }

            BigDecimal debit = lineReq.getDebit() != null ? lineReq.getDebit() : BigDecimal.ZERO;
            BigDecimal credit = lineReq.getCredit() != null ? lineReq.getCredit() : BigDecimal.ZERO;

            totalDebit = totalDebit.add(debit);
            totalCredit = totalCredit.add(credit);

            JournalEntryLine line = new JournalEntryLine(account, analytic, lineReq.getDescription(), debit, credit);
            entry.addLine(line);
        }

        // Enforce the foundational accounting rule: Total Debit == Total Credit
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new UnbalancedJournalException(String.format(
                    "Accounting transaction rejected: Total Debit (%.4f) must equal Total Credit (%.4f)",
                    totalDebit, totalCredit));
        }

        entry.setTotalDebit(totalDebit);
        entry.setTotalCredit(totalCredit);

        JournalEntry saved = journalEntryRepository.save(entry);
        auditLogService.log(AuditAction.POST, "JournalEntry", saved.getId().toString(),
                "Posted double-entry journal " + saved.getJournalNumber() + " with balanced amount: " + totalDebit);
        return saved;
    }

    @Override
    public JournalEntry postCustomerInvoice(Invoice invoice) {
        Journal salesJournal = journalRepository.findByCode("SLS")
                .orElseGet(() -> journalRepository.findByJournalType(JournalType.SALES)
                        .orElseThrow(() -> new ResourceNotFoundException("Sales Journal not found")));

        Account arAccount = getAccountByCode(ACC_ACCOUNTS_RECEIVABLE);
        Account revenueAccount = getAccountByCode(ACC_UTILITY_REVENUE);

        AnalyticAccount analyticAccount = null;
        if (invoice.getHabitatZone() != null) {
            analyticAccount = analyticAccountRepository.findByHabitatZoneId(invoice.getHabitatZone().getId()).orElse(null);
        }

        JournalEntry entry = new JournalEntry();
        entry.setJournal(salesJournal);
        entry.setJournalNumber("JRN-INV-" + invoice.getInvoiceNumber());
        entry.setEntryDate(invoice.getInvoiceDate());
        entry.setDescription("Life-Support Utility Billing: " + invoice.getInvoiceNumber() + " - " + invoice.getCustomer().getName());
        entry.setReferenceType("CUSTOMER_INVOICE");
        entry.setReferenceId(invoice.getId());
        entry.setStatus("POSTED");

        BigDecimal total = invoice.getTotal();

        // DEBIT: Accounts Receivable (1300)
        JournalEntryLine debitLine = new JournalEntryLine(arAccount, analyticAccount,
                "Receivable from " + invoice.getCustomer().getName(), total, BigDecimal.ZERO);
        entry.addLine(debitLine);

        // CREDIT: Life-Support Utility Revenue (4000)
        JournalEntryLine creditLine = new JournalEntryLine(revenueAccount, analyticAccount,
                "Utility Revenue recognized: " + invoice.getInvoiceNumber(), BigDecimal.ZERO, total);
        entry.addLine(creditLine);

        entry.setTotalDebit(total);
        entry.setTotalCredit(total);

        JournalEntry saved = journalEntryRepository.save(entry);
        auditLogService.log(AuditAction.POST, "JournalEntry", saved.getId().toString(),
                "Posted accounting entries for Customer Invoice " + invoice.getInvoiceNumber());
        return saved;
    }

    @Override
    public JournalEntry postVendorBill(VendorBill bill) {
        Journal purJournal = journalRepository.findByCode("PUR")
                .orElseGet(() -> journalRepository.findByJournalType(JournalType.PURCHASE)
                        .orElseThrow(() -> new ResourceNotFoundException("Purchase Journal not found")));

        Account expenseAccount = getAccountByCode(ACC_MAINTENANCE_EXPENSE);
        Account vendorCreditor = getAccountByCode(ACC_VENDOR_CREDITORS);

        JournalEntry entry = new JournalEntry();
        entry.setJournal(purJournal);
        entry.setJournalNumber("JRN-BILL-" + bill.getBillNumber());
        entry.setEntryDate(bill.getBillDate());
        entry.setDescription("Vendor Procurement Bill: " + bill.getBillNumber() + " - " + bill.getVendor().getName());
        entry.setReferenceType("VENDOR_BILL");
        entry.setReferenceId(bill.getId());
        entry.setStatus("POSTED");

        BigDecimal total = bill.getTotal();

        // DEBIT: Scrubber Maintenance Expenditures (5000)
        JournalEntryLine debitLine = new JournalEntryLine(expenseAccount, null,
                "Procurement Expense: " + bill.getBillNumber(), total, BigDecimal.ZERO);
        entry.addLine(debitLine);

        // CREDIT: Sensor Vendor Creditors (2000)
        JournalEntryLine creditLine = new JournalEntryLine(vendorCreditor, null,
                "Creditor Payable to " + bill.getVendor().getName(), BigDecimal.ZERO, total);
        entry.addLine(creditLine);

        entry.setTotalDebit(total);
        entry.setTotalCredit(total);

        JournalEntry saved = journalEntryRepository.save(entry);
        auditLogService.log(AuditAction.POST, "JournalEntry", saved.getId().toString(),
                "Posted accounting entries for Vendor Bill " + bill.getBillNumber());
        return saved;
    }

    @Override
    public JournalEntry postCustomerPayment(Payment payment) {
        Journal bankJournal = journalRepository.findByCode("BNK")
                .orElseGet(() -> journalRepository.findByJournalType(JournalType.BANK)
                        .orElseThrow(() -> new ResourceNotFoundException("Bank Journal not found")));

        Account cashAccount = getAccountByCode(ACC_CASH_BANK);
        Account arAccount = getAccountByCode(ACC_ACCOUNTS_RECEIVABLE);

        JournalEntry entry = new JournalEntry();
        entry.setJournal(bankJournal);
        entry.setJournalNumber("JRN-PAY-" + payment.getPaymentReference());
        entry.setEntryDate(payment.getPaymentDate());
        entry.setDescription("Customer Payment Received: Ref " + payment.getPaymentReference());
        entry.setReferenceType("CUSTOMER_PAYMENT");
        entry.setReferenceId(payment.getId());
        entry.setStatus("POSTED");

        BigDecimal amount = payment.getAmount();

        // DEBIT: Cash/Bank (1200)
        JournalEntryLine debitLine = new JournalEntryLine(cashAccount, null,
                "Payment received into Bank from " + payment.getContact().getName(), amount, BigDecimal.ZERO);
        entry.addLine(debitLine);

        // CREDIT: Accounts Receivable (1300)
        JournalEntryLine creditLine = new JournalEntryLine(arAccount, null,
                "Clear Accounts Receivable for Ref " + payment.getPaymentReference(), BigDecimal.ZERO, amount);
        entry.addLine(creditLine);

        entry.setTotalDebit(amount);
        entry.setTotalCredit(amount);

        JournalEntry saved = journalEntryRepository.save(entry);
        auditLogService.log(AuditAction.PAY, "JournalEntry", saved.getId().toString(),
                "Posted customer payment journal " + saved.getJournalNumber());
        return saved;
    }

    @Override
    public JournalEntry postVendorPayment(Payment payment) {
        Journal bankJournal = journalRepository.findByCode("BNK")
                .orElseGet(() -> journalRepository.findByJournalType(JournalType.BANK)
                        .orElseThrow(() -> new ResourceNotFoundException("Bank Journal not found")));

        Account vendorCreditor = getAccountByCode(ACC_VENDOR_CREDITORS);
        Account cashAccount = getAccountByCode(ACC_CASH_BANK);

        JournalEntry entry = new JournalEntry();
        entry.setJournal(bankJournal);
        entry.setJournalNumber("JRN-DISB-" + payment.getPaymentReference());
        entry.setEntryDate(payment.getPaymentDate());
        entry.setDescription("Vendor Disbursement Paid: Ref " + payment.getPaymentReference());
        entry.setReferenceType("VENDOR_PAYMENT");
        entry.setReferenceId(payment.getId());
        entry.setStatus("POSTED");

        BigDecimal amount = payment.getAmount();

        // DEBIT: Sensor Vendor Creditors (2000)
        JournalEntryLine debitLine = new JournalEntryLine(vendorCreditor, null,
                "Reduce creditor liability to " + payment.getContact().getName(), amount, BigDecimal.ZERO);
        entry.addLine(debitLine);

        // CREDIT: Cash/Bank (1200)
        JournalEntryLine creditLine = new JournalEntryLine(cashAccount, null,
                "Disbursement from Bank for Ref " + payment.getPaymentReference(), BigDecimal.ZERO, amount);
        entry.addLine(creditLine);

        entry.setTotalDebit(amount);
        entry.setTotalCredit(amount);

        JournalEntry saved = journalEntryRepository.save(entry);
        auditLogService.log(AuditAction.PAY, "JournalEntry", saved.getId().toString(),
                "Posted vendor disbursement journal " + saved.getJournalNumber());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public JournalEntry getJournalEntryById(Long id) {
        return journalEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JournalEntry> searchJournalEntries(Long journalId, String status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return journalEntryRepository.searchJournalEntries(journalId, status, startDate, endDate, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Account getAccountByCode(String code) {
        return accountRepository.findByAccountCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with code: " + code));
    }
}
