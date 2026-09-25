package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.LineItemRequest;
import com.lunar.habitat.dto.request.PurchaseOrderRequest;
import com.lunar.habitat.entity.Contact;
import com.lunar.habitat.entity.Product;
import com.lunar.habitat.entity.PurchaseOrder;
import com.lunar.habitat.entity.PurchaseOrderLine;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.enums.PoStatus;
import com.lunar.habitat.exception.InvalidStatusTransitionException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.exception.ValidationException;
import com.lunar.habitat.repository.ContactRepository;
import com.lunar.habitat.repository.ProductRepository;
import com.lunar.habitat.repository.PurchaseOrderRepository;
import com.lunar.habitat.security.SecurityUtils;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.PurchaseOrderService;
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
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ContactRepository contactRepository;
    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public PurchaseOrderServiceImpl(PurchaseOrderRepository purchaseOrderRepository,
                                    ContactRepository contactRepository,
                                    ProductRepository productRepository,
                                    AuditLogService auditLogService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.contactRepository = contactRepository;
        this.productRepository = productRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request) {
        Contact vendor = contactRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + request.getVendorId()));

        if (vendor.getContactType() != ContactType.VENDOR) {
            throw new ValidationException("Selected contact is not a Vendor");
        }

        PurchaseOrder po = new PurchaseOrder();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        po.setPoNumber("PO-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        po.setVendor(vendor);
        po.setOrderDate(LocalDate.now());
        po.setExpectedDate(request.getExpectedDate());
        po.setStatus(PoStatus.DRAFT);
        po.setNotes(request.getNotes());
        po.setCreatedBy(SecurityUtils.getCurrentUsername());

        for (LineItemRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + lineReq.getProductId()));

            PurchaseOrderLine line = new PurchaseOrderLine(product, lineReq.getQuantity(), lineReq.getUnitPrice(), lineReq.getTaxRate());
            po.addLine(line);
        }

        po.recalculateTotals();
        PurchaseOrder saved = purchaseOrderRepository.save(po);

        auditLogService.logAction(AuditAction.CREATE, "PURCHASE_ORDER", saved.getId(), null, saved.getPoNumber());
        return saved;
    }

    @Override
    public PurchaseOrder updatePurchaseOrder(Long id, PurchaseOrderRequest request) {
        PurchaseOrder po = getPurchaseOrderById(id);

        if (po.getStatus() != PoStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Cannot edit Purchase Order in " + po.getStatus() + " status. Only DRAFT orders can be modified.");
        }

        Contact vendor = contactRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + request.getVendorId()));

        po.setVendor(vendor);
        po.setExpectedDate(request.getExpectedDate());
        po.setNotes(request.getNotes());

        po.getLines().clear();
        for (LineItemRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + lineReq.getProductId()));

            PurchaseOrderLine line = new PurchaseOrderLine(product, lineReq.getQuantity(), lineReq.getUnitPrice(), lineReq.getTaxRate());
            po.addLine(line);
        }

        po.recalculateTotals();
        PurchaseOrder updated = purchaseOrderRepository.save(po);

        auditLogService.logAction(AuditAction.UPDATE, "PURCHASE_ORDER", updated.getId(), null, "Updated " + updated.getPoNumber());
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrder getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrder> searchPurchaseOrders(PoStatus status, Long vendorId, String query, Pageable pageable) {
        return purchaseOrderRepository.searchPurchaseOrders(status, vendorId, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    @Override
    public PurchaseOrder submitPurchaseOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderById(id);
        if (po.getStatus() != PoStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Only DRAFT Purchase Orders can be submitted. Current status: " + po.getStatus());
        }
        po.setStatus(PoStatus.SUBMITTED);
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        auditLogService.logAction(AuditAction.UPDATE, "PURCHASE_ORDER", saved.getId(), "DRAFT", "SUBMITTED");
        return saved;
    }

    @Override
    public PurchaseOrder approvePurchaseOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderById(id);
        if (po.getStatus() != PoStatus.SUBMITTED) {
            throw new InvalidStatusTransitionException("Only SUBMITTED Purchase Orders can be approved. Current status: " + po.getStatus());
        }
        po.setStatus(PoStatus.APPROVED);
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        auditLogService.logAction(AuditAction.APPROVE, "PURCHASE_ORDER", saved.getId(), "SUBMITTED", "APPROVED");
        return saved;
    }

    @Override
    public PurchaseOrder cancelPurchaseOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderById(id);
        if (po.getStatus() == PoStatus.RECEIVED || po.getStatus() == PoStatus.CANCELLED) {
            throw new InvalidStatusTransitionException("Cannot cancel Purchase Order in status: " + po.getStatus());
        }
        String oldStatus = po.getStatus().name();
        po.setStatus(PoStatus.CANCELLED);
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        auditLogService.logAction(AuditAction.CANCEL, "PURCHASE_ORDER", saved.getId(), oldStatus, "CANCELLED");
        return saved;
    }

    @Override
    public void deletePurchaseOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderById(id);
        if (po.getStatus() != PoStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Only DRAFT Purchase Orders can be deleted.");
        }
        purchaseOrderRepository.delete(po);
        auditLogService.logAction(AuditAction.DELETE, "PURCHASE_ORDER", id, po.getPoNumber(), "DELETED");
    }
}
