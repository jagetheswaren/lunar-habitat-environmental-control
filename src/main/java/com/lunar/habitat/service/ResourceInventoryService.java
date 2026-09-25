package com.lunar.habitat.service;

import com.lunar.habitat.entity.ResourceInventory;
import java.math.BigDecimal;
import java.util.List;

public interface ResourceInventoryService {
    List<ResourceInventory> getAllInventory();
    ResourceInventory getInventoryById(Long id);
    ResourceInventory updateStock(Long id, BigDecimal newQuantity);
    List<ResourceInventory> getLowStockResources();
    void checkInventoryThresholds();
}
