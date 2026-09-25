package com.lunar.habitat.repository;

import com.lunar.habitat.entity.Invoice;
import com.lunar.habitat.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByCustomerId(Long customerId);

    long countByStatus(InvoiceStatus status);

    @Query("SELECT COUNT(i) > 0 FROM Invoice i WHERE " +
           "i.customer.id = :customerId AND " +
           "i.billingPeriodStart = :periodStart AND " +
           "i.billingPeriodEnd = :periodEnd AND " +
           "i.status != 'CANCELLED'")
    boolean existsByCustomerAndBillingPeriod(@Param("customerId") Long customerId,
                                            @Param("periodStart") LocalDate periodStart,
                                            @Param("periodEnd") LocalDate periodEnd);

    @Query("SELECT i FROM Invoice i WHERE " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:customerId IS NULL OR i.customer.id = :customerId) AND " +
           "(:startDate IS NULL OR i.invoiceDate >= :startDate) AND " +
           "(:endDate IS NULL OR i.invoiceDate <= :endDate) AND " +
           "(:query IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.customer.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY i.invoiceDate DESC, i.id DESC")
    Page<Invoice> searchInvoices(@Param("status") InvoiceStatus status,
                                 @Param("customerId") Long customerId,
                                 @Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("query") String query,
                                 Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.status = 'POSTED' AND i.dueDate < :currentDate")
    List<Invoice> findOverdueInvoices(@Param("currentDate") LocalDate currentDate);
}
