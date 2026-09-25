package com.lunar.habitat.repository;

import com.lunar.habitat.entity.VendorBill;
import com.lunar.habitat.enums.BillStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VendorBillRepository extends JpaRepository<VendorBill, Long> {

    Optional<VendorBill> findByBillNumber(String billNumber);

    long countByStatus(BillStatus status);

    @Query("SELECT b FROM VendorBill b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:vendorId IS NULL OR b.vendor.id = :vendorId) AND " +
           "(:query IS NULL OR LOWER(b.billNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.vendor.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY b.billDate DESC, b.id DESC")
    Page<VendorBill> searchVendorBills(@Param("status") BillStatus status,
                                       @Param("vendorId") Long vendorId,
                                       @Param("query") String query,
                                       Pageable pageable);
}
