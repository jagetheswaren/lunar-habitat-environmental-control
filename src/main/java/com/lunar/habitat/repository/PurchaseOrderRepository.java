package com.lunar.habitat.repository;

import com.lunar.habitat.entity.PurchaseOrder;
import com.lunar.habitat.enums.PoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    @Query("SELECT p FROM PurchaseOrder p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:vendorId IS NULL OR p.vendor.id = :vendorId) AND " +
           "(:query IS NULL OR LOWER(p.poNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.vendor.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY p.orderDate DESC, p.id DESC")
    Page<PurchaseOrder> searchPurchaseOrders(@Param("status") PoStatus status,
                                            @Param("vendorId") Long vendorId,
                                            @Param("query") String query,
                                            Pageable pageable);
}
