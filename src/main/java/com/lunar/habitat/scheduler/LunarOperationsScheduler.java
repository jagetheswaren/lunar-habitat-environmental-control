package com.lunar.habitat.scheduler;

import com.lunar.habitat.entity.Invoice;
import com.lunar.habitat.enums.InvoiceStatus;
import com.lunar.habitat.repository.InvoiceRepository;
import com.lunar.habitat.service.ResourceInventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@EnableScheduling
public class LunarOperationsScheduler {

    private static final Logger log = LoggerFactory.getLogger(LunarOperationsScheduler.class);

    private final ResourceInventoryService resourceInventoryService;
    private final InvoiceRepository invoiceRepository;

    public LunarOperationsScheduler(ResourceInventoryService resourceInventoryService,
                                   InvoiceRepository invoiceRepository) {
        this.resourceInventoryService = resourceInventoryService;
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Periodic check for low inventory buffer levels across all habitat consumables.
     * Runs every 15 minutes.
     */
    @Scheduled(fixedRate = 900000, initialDelay = 10000)
    public void monitorResourceInventory() {
        log.info("[SCHEDULER] Running periodic resource inventory stock buffer audit...");
        resourceInventoryService.checkInventoryThresholds();
    }

    /**
     * Audits for overdue customer invoices past due date.
     * Runs once daily.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void detectOverdueInvoices() {
        log.info("[SCHEDULER] Auditing open customer invoices for past due dates...");
        List<Invoice> overdueInvoices = invoiceRepository.findOverdueInvoices(LocalDate.now());
        for (Invoice invoice : overdueInvoices) {
            log.warn("[SCHEDULER] Invoice {} for customer {} is OVERDUE (Due: {}, Balance: {})",
                    invoice.getInvoiceNumber(), invoice.getCustomer().getName(), invoice.getDueDate(), invoice.getBalanceDue());
            invoice.setStatus(InvoiceStatus.OVERDUE);
            invoiceRepository.save(invoice);
        }
    }
}
