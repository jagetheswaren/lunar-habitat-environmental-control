package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.PaymentRequest;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.enums.BillStatus;
import com.lunar.habitat.enums.InvoiceStatus;
import com.lunar.habitat.enums.PaymentStatus;
import com.lunar.habitat.exception.InsufficientPaymentException;
import com.lunar.habitat.exception.InvalidStatusTransitionException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.exception.ValidationException;
import com.lunar.habitat.repository.ContactRepository;
import com.lunar.habitat.repository.InvoiceRepository;
import com.lunar.habitat.repository.PaymentRepository;
import com.lunar.habitat.repository.VendorBillRepository;
import com.lunar.habitat.service.AccountingEngineService;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final VendorBillRepository vendorBillRepository;
    private final ContactRepository contactRepository;
    private final AccountingEngineService accountingEngineService;
    private final AuditLogService auditLogService;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              InvoiceRepository invoiceRepository,
                              VendorBillRepository vendorBillRepository,
                              ContactRepository contactRepository,
                              AccountingEngineService accountingEngineService,
                              AuditLogService auditLogService) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.vendorBillRepository = vendorBillRepository;
        this.contactRepository = contactRepository;
        this.accountingEngineService = accountingEngineService;
        this.auditLogService = auditLogService;
    }

    @Override
    public Payment recordPayment(PaymentRequest request) {
        if (request.getInvoiceId() == null && request.getVendorBillId() == null) {
            throw new ValidationException("Payment must reference either a Customer Invoice or a Vendor Bill.");
        }

        Contact contact = contactRepository.findById(request.getContactId())
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with ID: " + request.getContactId()));

        Payment payment = new Payment();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        payment.setPaymentReference("PAY-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        payment.setContact(contact);
        payment.setAmount(request.getAmount());
        payment.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.RECORDED);
        payment.setNotes(request.getNotes());

        if (request.getInvoiceId() != null) {
            // Customer payment against Invoice
            Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + request.getInvoiceId()));

            if (invoice.getStatus() != InvoiceStatus.POSTED && invoice.getStatus() != InvoiceStatus.PARTIALLY_PAID) {
                throw new InvalidStatusTransitionException(
                        "Cannot apply payment to Invoice in status: " + invoice.getStatus() + ". Invoice must be POSTED or PARTIALLY_PAID.");
            }

            BigDecimal balanceDue = invoice.getBalanceDue();
            if (request.getAmount().compareTo(balanceDue) > 0) {
                throw new InsufficientPaymentException(String.format(
                        "Payment amount (%.2f) exceeds invoice outstanding balance (%.2f)",
                        request.getAmount(), balanceDue));
            }

            BigDecimal newPaid = invoice.getPaidAmount().add(request.getAmount());
            invoice.setPaidAmount(newPaid);
            if (newPaid.compareTo(invoice.getTotal()) >= 0) {
                invoice.setStatus(InvoiceStatus.PAID);
            } else {
                invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
            }
            invoiceRepository.save(invoice);

            payment.setInvoice(invoice);

            // Double-entry accounting entry:
            // DEBIT: 1200 Cash/Bank
            // CREDIT: 1300 Accounts Receivable
            JournalEntry journalEntry = accountingEngineService.postCustomerPayment(payment);
            payment.setJournalEntry(journalEntry);

            Payment saved = paymentRepository.save(payment);
            auditLogService.logAction(AuditAction.PAY, "INVOICE", invoice.getId(), null,
                    String.format("Payment %.2f applied to invoice %s (Ref: %s)", request.getAmount(), invoice.getInvoiceNumber(), saved.getPaymentReference()));
            return saved;

        } else {
            // Vendor payment against Vendor Bill
            VendorBill bill = vendorBillRepository.findById(request.getVendorBillId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vendor Bill not found with ID: " + request.getVendorBillId()));

            if (bill.getStatus() != BillStatus.POSTED && bill.getStatus() != BillStatus.PARTIALLY_PAID) {
                throw new InvalidStatusTransitionException(
                        "Cannot apply payment to Vendor Bill in status: " + bill.getStatus() + ". Bill must be POSTED or PARTIALLY_PAID.");
            }

            BigDecimal balanceDue = bill.getBalanceDue();
            if (request.getAmount().compareTo(balanceDue) > 0) {
                throw new InsufficientPaymentException(String.format(
                        "Payment amount (%.2f) exceeds vendor bill outstanding balance (%.2f)",
                        request.getAmount(), balanceDue));
            }

            BigDecimal newPaid = bill.getPaidAmount().add(request.getAmount());
            bill.setPaidAmount(newPaid);
            if (newPaid.compareTo(bill.getTotal()) >= 0) {
                bill.setStatus(BillStatus.PAID);
            } else {
                bill.setStatus(BillStatus.PARTIALLY_PAID);
            }
            vendorBillRepository.save(bill);

            payment.setVendorBill(bill);

            // Double-entry accounting entry:
            // DEBIT: 2000 Sensor Vendor Creditors
            // CREDIT: 1200 Cash/Bank
            JournalEntry journalEntry = accountingEngineService.postVendorPayment(payment);
            payment.setJournalEntry(journalEntry);

            Payment saved = paymentRepository.save(payment);
            auditLogService.logAction(AuditAction.PAY, "VENDOR_BILL", bill.getId(), null,
                    String.format("Payment %.2f applied to vendor bill %s (Ref: %s)", request.getAmount(), bill.getBillNumber(), saved.getPaymentReference()));
            return saved;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Payment> searchPayments(Long contactId, LocalDate startDate, LocalDate endDate, String query, Pageable pageable) {
        return paymentRepository.searchPayments(contactId, startDate, endDate, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByInvoiceId(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByVendorBillId(Long vendorBillId) {
        return paymentRepository.findByVendorBillId(vendorBillId);
    }
}
