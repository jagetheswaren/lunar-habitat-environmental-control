package com.lunar.habitat.service.impl;

import com.lunar.habitat.entity.EnvironmentalAlert;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.ResourceInventory;
import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.AlertStatus;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.EnvironmentalAlertRepository;
import com.lunar.habitat.repository.HabitatZoneRepository;
import com.lunar.habitat.repository.ResourceInventoryRepository;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.ResourceInventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ResourceInventoryServiceImpl implements ResourceInventoryService {

    private final ResourceInventoryRepository resourceInventoryRepository;
    private final EnvironmentalAlertRepository environmentalAlertRepository;
    private final HabitatZoneRepository habitatZoneRepository;
    private final AuditLogService auditLogService;

    public ResourceInventoryServiceImpl(ResourceInventoryRepository resourceInventoryRepository,
                                        EnvironmentalAlertRepository environmentalAlertRepository,
                                        HabitatZoneRepository habitatZoneRepository,
                                        AuditLogService auditLogService) {
        this.resourceInventoryRepository = resourceInventoryRepository;
        this.environmentalAlertRepository = environmentalAlertRepository;
        this.habitatZoneRepository = habitatZoneRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceInventory> getAllInventory() {
        return resourceInventoryRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceInventory getInventoryById(Long id) {
        return resourceInventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource Inventory item not found with ID: " + id));
    }

    @Override
    public ResourceInventory updateStock(Long id, BigDecimal newQuantity) {
        ResourceInventory item = getInventoryById(id);
        BigDecimal oldQuantity = item.getQuantity();
        item.setQuantity(newQuantity);

        ResourceInventory saved = resourceInventoryRepository.save(item);
        auditLogService.logAction(AuditAction.UPDATE, "INVENTORY", saved.getId(),
                "Stock: " + oldQuantity, "Stock: " + newQuantity + " (" + saved.getResourceName() + ")");

        checkInventoryThresholds();
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceInventory> getLowStockResources() {
        return resourceInventoryRepository.findLowStockResources();
    }

    @Override
    public void checkInventoryThresholds() {
        List<ResourceInventory> lowStockItems = resourceInventoryRepository.findLowStockResources();
        if (lowStockItems.isEmpty()) {
            return;
        }

        HabitatZone defaultZone = habitatZoneRepository.findAll().stream().findFirst().orElse(null);
        if (defaultZone == null) {
            return;
        }

        for (ResourceInventory item : lowStockItems) {
            String alertMsg = String.format("LOW RESOURCE STOCK ALERT: %s current quantity (%.2f %s) is below critical threshold (%.2f %s)",
                    item.getResourceName(), item.getQuantity(), item.getUnitOfMeasure(), item.getMinimumStock(), item.getUnitOfMeasure());

            boolean alertExists = environmentalAlertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.OPEN).stream()
                    .anyMatch(a -> a.getMessage() != null && a.getMessage().contains(item.getResourceName()));

            if (!alertExists) {
                EnvironmentalAlert alert = new EnvironmentalAlert(
                        defaultZone,
                        null,
                        "LOW_RESOURCE_STOCK",
                        AlertSeverity.WARNING,
                        alertMsg);
                environmentalAlertRepository.save(alert);
            }
        }
    }
}
