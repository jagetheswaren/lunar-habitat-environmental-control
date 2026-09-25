package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.LineItemRequest;
import com.lunar.habitat.dto.request.VendorBillRequest;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.enums.BillStatus;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.enums.PoStatus;
import com.lunar.habitat.exception.InvalidStatusTransitionException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.exception.ValidationException;
import com.lunar.habitat.repository.ContactRepository;
import com.lunar.habitat.repository.ProductRepository;
import com.lunar.habitat.repository.PurchaseOrderRepository;
import com.lunar.habitat.repository.VendorBillRepository;
import com.lunar.habitat.service.AccountingEngineService;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.VendorBillService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class VendorBillServiceImpl implements VendorBillService {

    private final VendorBillRepository vendorBillRepository;
    private final ContactRepository contactRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final AccountingEngineService accountingEngineService;
    private final AuditLogService auditLogService;

    public VendorBillServiceImpl(VendorBillRepository vendorBillRepository,
                                 ContactRepository contactRepository,
                                 ProductRepository productRepository,
                                 PurchaseOrderRepository purchaseOrderRepository,
                                 AccountingEngineService accountingEngineService,
                                 AuditLogService auditLogService) {
        this.vendorBillRepository = vendorBillRepository;
        this.contactRepository = contactRepository;
        this.productRepository = productRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.accountingEngineService = accountingEngineService;
        this.auditLogService = auditLogService;
    }

    @Override
    public VendorBill createVendorBill(VendorBillRequest request) {
        Contact vendor = contactRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + request.getVendorId()));

        if (vendor.getContactType() != ContactType.VENDOR) {
            throw new ValidationException("Selected contact is not a Vendor");
        }

        PurchaseOrder po = null;
        if (request.getPurchaseOrderId() != null) {
            po = purchaseOrderRepository.findById(request.getPurchaseOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + request.getPurchaseOrderId()));
        }

        VendorBill bill = new VendorBill();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        bill.setBillNumber("BILL-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        bill.setVendor(vendor);
        bill.setPurchaseOrder(po);
        bill.setBillDate(request.getBillDate() != null ? request.getBillDate() : LocalDate.now());
        bill.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(30));
        bill.setStatus(BillStatus.DRAFT);
        bill.setNotes(request.getNotes());

        for (LineItemRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + lineReq.getProductId()));

            VendorBillLine line = new VendorBillLine(product, lineReq.getQuantity(), lineReq.getUnitPrice(), lineReq.getTaxRate());
            bill.addLine(line);
        }

        bill.recalculateTotals();
        VendorBill saved = vendorBillRepository.save(bill);

        auditLogService.logAction(AuditAction.CREATE, "VENDOR_BILL", saved.getId(), null, saved.getBillNumber());
        return saved;
    }

    @Override
    public VendorBill createVendorBillFromPurchaseOrder(Long purchaseOrderId) {
        PurchaseOrder po = purchaseOrderRepository.findById(purchaseOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + purchaseOrderId));

        if (po.getStatus() != PoStatus.APPROVED) {
            throw new InvalidStatusTransitionException("Cannot generate Vendor Bill from Purchase Order in " + po.getStatus() + " status. PO must be APPROVED.");
        }

        VendorBill bill = new VendorBill();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        bill.setBillNumber("BILL-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        bill.setVendor(po.getVendor());
        bill.setPurchaseOrder(po);
        bill.setBillDate(LocalDate.now());
        bill.setDueDate(LocalDate.now().plusDays(30));
        bill.setStatus(BillStatus.DRAFT);
        bill.setNotes("Generated from " + po.getPoNumber());

        for (PurchaseOrderLine poLine : po.getLines()) {
            VendorBillLine billLine = new VendorBillLine(poLine.getProduct(), poLine.getQuantity(), poLine.getUnitPrice(), poLine.getTaxRate());
            bill.addLine(billLine);
        }

        bill.recalculateTotals();
        VendorBill saved = vendorBillRepository.save(bill);

        po.setStatus(PoStatus.RECEIVED);
        purchaseOrderRepository.save(po);

        auditLogService.logAction(AuditAction.CREATE, "VENDOR_BILL", saved.getId(), po.getPoNumber(), saved.getBillNumber());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public VendorBill getVendorBillById(Long id) {
        return vendorBillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor Bill not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VendorBill> searchVendorBills(BillStatus status, Long vendorId, String query, Pageable pageable) {
        return vendorBillRepository.searchVendorBills(status, vendorId, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorBill> getAllVendorBills() {
        return vendorBillRepository.findAll();
    }

    @Override
    public VendorBill postVendorBill(Long id) {
        VendorBill bill = getVendorBillById(id);
        if (bill.getStatus() != BillStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Cannot post Vendor Bill in " + bill.getStatus() + " status. Only DRAFT bills can be posted.");
        }

        // Post accounting entry (DEBIT 5000 Scrubber Maintenance Expense, CREDIT 2000 Sensor Vendor Creditors)
        JournalEntry journalEntry = accountingEngineService.postVendorBill(bill);
        bill.setJournalEntry(journalEntry);
        bill.setStatus(BillStatus.POSTED);

        VendorBill saved = vendorBillRepository.save(bill);
        auditLogService.logAction(AuditAction.POST, "VENDOR_BILL", saved.getId(), "DRAFT", "POSTED");
        return saved;
    }

    @Override
    public VendorBill cancelVendorBill(Long id) {
        VendorBill bill = getVendorBillById(id);
        if (bill.getStatus() != BillStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Cannot cancel posted or paid Vendor Bill directly. Reversal entry required.");
        }
        bill.setStatus(BillStatus.CANCELLED);
        VendorBill saved = vendorBillRepository.save(bill);
        auditLogService.logAction(AuditAction.CANCEL, "VENDOR_BILL", saved.getId(), "DRAFT", "CANCELLED");
        return saved;
    }

    @Override
    public void deleteVendorBill(Long id) {
        VendorBill bill = getVendorBillById(id);
        if (bill.getStatus() != BillStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Only DRAFT Vendor Bills can be deleted.");
        }
        vendorBillRepository.delete(bill);
        auditLogService.logAction(AuditAction.DELETE, "VENDOR_BILL", id, bill.getBillNumber(), "DELETED");
    }
}
