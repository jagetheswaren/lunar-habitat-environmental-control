package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.PurchaseOrderRequest;
import com.lunar.habitat.entity.PurchaseOrder;
import com.lunar.habitat.enums.PoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PurchaseOrderService {
    PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request);
    PurchaseOrder updatePurchaseOrder(Long id, PurchaseOrderRequest request);
    PurchaseOrder getPurchaseOrderById(Long id);
    Page<PurchaseOrder> searchPurchaseOrders(PoStatus status, Long vendorId, String query, Pageable pageable);
    List<PurchaseOrder> getAllPurchaseOrders();
    PurchaseOrder submitPurchaseOrder(Long id);
    PurchaseOrder approvePurchaseOrder(Long id);
    PurchaseOrder cancelPurchaseOrder(Long id);
    void deletePurchaseOrder(Long id);
}
