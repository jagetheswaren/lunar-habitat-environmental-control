package com.lunar.habitat.repository;

import com.lunar.habitat.entity.ResourceInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceInventoryRepository extends JpaRepository<ResourceInventory, Long> {
    Optional<ResourceInventory> findBySku(String sku);
    Optional<ResourceInventory> findByResourceName(String resourceName);

    @Query("SELECT r FROM ResourceInventory r WHERE r.quantity < r.minimumStock")
    List<ResourceInventory> findLowStockResources();
}
