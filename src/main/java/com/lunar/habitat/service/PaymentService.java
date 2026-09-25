package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.PaymentRequest;
import com.lunar.habitat.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface PaymentService {
    Payment recordPayment(PaymentRequest request);
    Payment getPaymentById(Long id);
    Page<Payment> searchPayments(Long contactId, LocalDate startDate, LocalDate endDate, String query, Pageable pageable);
    List<Payment> getAllPayments();
    List<Payment> getPaymentsByInvoiceId(Long invoiceId);
    List<Payment> getPaymentsByVendorBillId(Long vendorBillId);
}
