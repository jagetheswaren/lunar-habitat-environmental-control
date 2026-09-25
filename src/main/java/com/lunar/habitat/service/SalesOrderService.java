package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.SalesOrderRequest;
import com.lunar.habitat.entity.SalesOrder;
import com.lunar.habitat.enums.SalesOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface SalesOrderService {
    SalesOrder createSalesOrder(SalesOrderRequest request);
    SalesOrder updateSalesOrder(Long id, SalesOrderRequest request);
    SalesOrder getSalesOrderById(Long id);
    Page<SalesOrder> searchSalesOrders(SalesOrderStatus status, Long customerId, String query, Pageable pageable);
    List<SalesOrder> getAllSalesOrders();
    SalesOrder confirmSalesOrder(Long id);
    SalesOrder cancelSalesOrder(Long id);
    void deleteSalesOrder(Long id);
}
