package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.ConsumptionBillingRequest;
import com.lunar.habitat.dto.request.InvoiceRequest;
import com.lunar.habitat.entity.Invoice;
import com.lunar.habitat.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface InvoiceService {
    Invoice createInvoice(InvoiceRequest request);
    Invoice createInvoiceFromSalesOrder(Long salesOrderId);
    Invoice generateConsumptionInvoice(ConsumptionBillingRequest request);
    Invoice getInvoiceById(Long id);
    Page<Invoice> searchInvoices(InvoiceStatus status, Long customerId, LocalDate startDate, LocalDate endDate, String query, Pageable pageable);
    List<Invoice> getAllInvoices();
    Invoice postInvoice(Long id);
    Invoice cancelInvoice(Long id);
    void deleteInvoice(Long id);
}
