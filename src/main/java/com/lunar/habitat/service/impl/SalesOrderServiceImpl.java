package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.LineItemRequest;
import com.lunar.habitat.dto.request.SalesOrderRequest;
import com.lunar.habitat.entity.*;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.enums.ContactType;
import com.lunar.habitat.enums.SalesOrderStatus;
import com.lunar.habitat.exception.InvalidStatusTransitionException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.exception.ValidationException;
import com.lunar.habitat.repository.ContactRepository;
import com.lunar.habitat.repository.HabitatZoneRepository;
import com.lunar.habitat.repository.ProductRepository;
import com.lunar.habitat.repository.SalesOrderRepository;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.SalesOrderService;
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
public class SalesOrderServiceImpl implements SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final ContactRepository contactRepository;
    private final HabitatZoneRepository habitatZoneRepository;
    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public SalesOrderServiceImpl(SalesOrderRepository salesOrderRepository,
                                 ContactRepository contactRepository,
                                 HabitatZoneRepository habitatZoneRepository,
                                 ProductRepository productRepository,
                                 AuditLogService auditLogService) {
        this.salesOrderRepository = salesOrderRepository;
        this.contactRepository = contactRepository;
        this.habitatZoneRepository = habitatZoneRepository;
        this.productRepository = productRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public SalesOrder createSalesOrder(SalesOrderRequest request) {
        Contact customer = contactRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        if (customer.getContactType() != ContactType.CUSTOMER) {
            throw new ValidationException("Selected contact is not a Customer");
        }

        HabitatZone zone = null;
        if (request.getHabitatZoneId() != null) {
            zone = habitatZoneRepository.findById(request.getHabitatZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Habitat Zone not found with ID: " + request.getHabitatZoneId()));
        }

        SalesOrder so = new SalesOrder();
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        so.setOrderNumber("SO-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        so.setCustomer(customer);
        so.setHabitatZone(zone);
        so.setOrderDate(LocalDate.now());
        so.setServicePeriodStart(request.getServicePeriodStart());
        so.setServicePeriodEnd(request.getServicePeriodEnd());
        so.setStatus(SalesOrderStatus.DRAFT);
        so.setNotes(request.getNotes());

        for (LineItemRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + lineReq.getProductId()));

            SalesOrderLine line = new SalesOrderLine(product, lineReq.getQuantity(), lineReq.getUnitPrice(), lineReq.getTaxRate());
            so.addLine(line);
        }

        so.recalculateTotals();
        SalesOrder saved = salesOrderRepository.save(so);

        auditLogService.logAction(AuditAction.CREATE, "SALES_ORDER", saved.getId(), null, saved.getOrderNumber());
        return saved;
    }

    @Override
    public SalesOrder updateSalesOrder(Long id, SalesOrderRequest request) {
        SalesOrder so = getSalesOrderById(id);
        if (so.getStatus() != SalesOrderStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Cannot edit Sales Order in status: " + so.getStatus());
        }

        Contact customer = contactRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        so.setCustomer(customer);
        so.setServicePeriodStart(request.getServicePeriodStart());
        so.setServicePeriodEnd(request.getServicePeriodEnd());
        so.setNotes(request.getNotes());

        if (request.getHabitatZoneId() != null) {
            HabitatZone zone = habitatZoneRepository.findById(request.getHabitatZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Habitat Zone not found with ID: " + request.getHabitatZoneId()));
            so.setHabitatZone(zone);
        }

        so.getLines().clear();
        for (LineItemRequest lineReq : request.getLines()) {
            Product product = productRepository.findById(lineReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + lineReq.getProductId()));

            SalesOrderLine line = new SalesOrderLine(product, lineReq.getQuantity(), lineReq.getUnitPrice(), lineReq.getTaxRate());
            so.addLine(line);
        }

        so.recalculateTotals();
        SalesOrder saved = salesOrderRepository.save(so);
        auditLogService.logAction(AuditAction.UPDATE, "SALES_ORDER", saved.getId(), null, "Updated " + saved.getOrderNumber());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public SalesOrder getSalesOrderById(Long id) {
        return salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SalesOrder> searchSalesOrders(SalesOrderStatus status, Long customerId, String query, Pageable pageable) {
        return salesOrderRepository.searchSalesOrders(status, customerId, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesOrder> getAllSalesOrders() {
        return salesOrderRepository.findAll();
    }

    @Override
    public SalesOrder confirmSalesOrder(Long id) {
        SalesOrder so = getSalesOrderById(id);
        if (so.getStatus() != SalesOrderStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Only DRAFT Sales Orders can be confirmed.");
        }
        so.setStatus(SalesOrderStatus.CONFIRMED);
        SalesOrder saved = salesOrderRepository.save(so);
        auditLogService.logAction(AuditAction.UPDATE, "SALES_ORDER", saved.getId(), "DRAFT", "CONFIRMED");
        return saved;
    }

    @Override
    public SalesOrder cancelSalesOrder(Long id) {
        SalesOrder so = getSalesOrderById(id);
        if (so.getStatus() == SalesOrderStatus.INVOICED || so.getStatus() == SalesOrderStatus.CANCELLED) {
            throw new InvalidStatusTransitionException("Cannot cancel Sales Order in status: " + so.getStatus());
        }
        String oldStatus = so.getStatus().name();
        so.setStatus(SalesOrderStatus.CANCELLED);
        SalesOrder saved = salesOrderRepository.save(so);
        auditLogService.logAction(AuditAction.CANCEL, "SALES_ORDER", saved.getId(), oldStatus, "CANCELLED");
        return saved;
    }

    @Override
    public void deleteSalesOrder(Long id) {
        SalesOrder so = getSalesOrderById(id);
        if (so.getStatus() != SalesOrderStatus.DRAFT) {
            throw new InvalidStatusTransitionException("Only DRAFT Sales Orders can be deleted.");
        }
        salesOrderRepository.delete(so);
        auditLogService.logAction(AuditAction.DELETE, "SALES_ORDER", id, so.getOrderNumber(), "DELETED");
    }
}
