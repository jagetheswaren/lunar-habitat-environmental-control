package com.lunar.habitat.repository;

import com.lunar.habitat.entity.Payment;
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
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentReference(String paymentReference);

    List<Payment> findByInvoiceId(Long invoiceId);

    List<Payment> findByVendorBillId(Long vendorBillId);

    @Query("SELECT p FROM Payment p WHERE " +
           "(:contactId IS NULL OR p.contact.id = :contactId) AND " +
           "(:startDate IS NULL OR p.paymentDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.paymentDate <= :endDate) AND " +
           "(:query IS NULL OR LOWER(p.paymentReference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.contact.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY p.paymentDate DESC, p.id DESC")
    Page<Payment> searchPayments(@Param("contactId") Long contactId,
                                 @Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("query") String query,
                                 Pageable pageable);
}
