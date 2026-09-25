package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.MaintenanceRequest;
import com.lunar.habitat.entity.EquipmentMaintenance;
import com.lunar.habitat.enums.MaintenanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface EquipmentMaintenanceService {
    EquipmentMaintenance scheduleMaintenance(MaintenanceRequest request);
    EquipmentMaintenance updateMaintenance(Long id, MaintenanceRequest request);
    EquipmentMaintenance updateStatus(Long id, MaintenanceStatus status);
    EquipmentMaintenance getMaintenanceById(Long id);
    Page<EquipmentMaintenance> searchMaintenance(Long zoneId, MaintenanceStatus status, Pageable pageable);
    List<EquipmentMaintenance> getAllMaintenance();
    void deleteMaintenance(Long id);
}
