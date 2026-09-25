package com.lunar.habitat.repository;

import com.lunar.habitat.entity.EquipmentMaintenance;
import com.lunar.habitat.enums.MaintenanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentMaintenanceRepository extends JpaRepository<EquipmentMaintenance, Long> {

    @Query("SELECT m FROM EquipmentMaintenance m WHERE " +
           "(:zoneId IS NULL OR m.habitatZone.id = :zoneId) AND " +
           "(:status IS NULL OR m.status = :status) " +
           "ORDER BY m.scheduledDate DESC")
    Page<EquipmentMaintenance> searchMaintenance(@Param("zoneId") Long zoneId,
                                                @Param("status") MaintenanceStatus status,
                                                Pageable pageable);
}
