package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.VendorBillRequest;
import com.lunar.habitat.entity.VendorBill;
import com.lunar.habitat.enums.BillStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface VendorBillService {
    VendorBill createVendorBill(VendorBillRequest request);
    VendorBill createVendorBillFromPurchaseOrder(Long purchaseOrderId);
    VendorBill getVendorBillById(Long id);
    Page<VendorBill> searchVendorBills(BillStatus status, Long vendorId, String query, Pageable pageable);
    List<VendorBill> getAllVendorBills();
    VendorBill postVendorBill(Long id);
    VendorBill cancelVendorBill(Long id);
    void deleteVendorBill(Long id);
}
