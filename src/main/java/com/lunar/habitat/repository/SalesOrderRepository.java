package com.lunar.habitat.repository;

import com.lunar.habitat.entity.SalesOrder;
import com.lunar.habitat.enums.SalesOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    Optional<SalesOrder> findByOrderNumber(String orderNumber);

    @Query("SELECT s FROM SalesOrder s WHERE " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:customerId IS NULL OR s.customer.id = :customerId) AND " +
           "(:query IS NULL OR LOWER(s.orderNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.customer.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY s.orderDate DESC, s.id DESC")
    Page<SalesOrder> searchSalesOrders(@Param("status") SalesOrderStatus status,
                                       @Param("customerId") Long customerId,
                                       @Param("query") String query,
                                       Pageable pageable);
}
