package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.MaintenanceRequest;
import com.lunar.habitat.entity.EquipmentMaintenance;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.enums.MaintenanceStatus;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.EquipmentMaintenanceRepository;
import com.lunar.habitat.repository.HabitatZoneRepository;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.EquipmentMaintenanceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class EquipmentMaintenanceServiceImpl implements EquipmentMaintenanceService {

    private final EquipmentMaintenanceRepository equipmentMaintenanceRepository;
    private final HabitatZoneRepository habitatZoneRepository;
    private final AuditLogService auditLogService;

    public EquipmentMaintenanceServiceImpl(EquipmentMaintenanceRepository equipmentMaintenanceRepository,
                                           HabitatZoneRepository habitatZoneRepository,
                                           AuditLogService auditLogService) {
        this.equipmentMaintenanceRepository = equipmentMaintenanceRepository;
        this.habitatZoneRepository = habitatZoneRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public EquipmentMaintenance scheduleMaintenance(MaintenanceRequest request) {
        HabitatZone zone = habitatZoneRepository.findById(request.getHabitatZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitat Zone not found with ID: " + request.getHabitatZoneId()));

        EquipmentMaintenance em = new EquipmentMaintenance();
        em.setHabitatZone(zone);
        em.setEquipmentName(request.getEquipmentName());
        em.setMaintenanceType(request.getMaintenanceType());
        em.setScheduledDate(request.getScheduledDate());
        em.setStatus(MaintenanceStatus.SCHEDULED);
        em.setCost(request.getCost());
        em.setNotes(request.getNotes());

        EquipmentMaintenance saved = equipmentMaintenanceRepository.save(em);
        auditLogService.logAction(AuditAction.CREATE, "MAINTENANCE", saved.getId(), null,
                "Scheduled maintenance for " + saved.getEquipmentName() + " in " + zone.getName());
        return saved;
    }

    @Override
    public EquipmentMaintenance updateMaintenance(Long id, MaintenanceRequest request) {
        EquipmentMaintenance em = getMaintenanceById(id);

        HabitatZone zone = habitatZoneRepository.findById(request.getHabitatZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitat Zone not found with ID: " + request.getHabitatZoneId()));

        em.setHabitatZone(zone);
        em.setEquipmentName(request.getEquipmentName());
        em.setMaintenanceType(request.getMaintenanceType());
        em.setScheduledDate(request.getScheduledDate());
        em.setCost(request.getCost());
        em.setNotes(request.getNotes());

        EquipmentMaintenance saved = equipmentMaintenanceRepository.save(em);
        auditLogService.logAction(AuditAction.UPDATE, "MAINTENANCE", saved.getId(), null, "Updated maintenance " + saved.getId());
        return saved;
    }

    @Override
    public EquipmentMaintenance updateStatus(Long id, MaintenanceStatus status) {
        EquipmentMaintenance em = getMaintenanceById(id);
        MaintenanceStatus oldStatus = em.getStatus();
        em.setStatus(status);

        if (status == MaintenanceStatus.COMPLETED) {
            em.setCompletedDate(LocalDate.now());
        }

        EquipmentMaintenance saved = equipmentMaintenanceRepository.save(em);
        auditLogService.logAction(AuditAction.UPDATE, "MAINTENANCE", saved.getId(), oldStatus.name(), status.name());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentMaintenance getMaintenanceById(Long id) {
        return equipmentMaintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment maintenance record not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EquipmentMaintenance> searchMaintenance(Long zoneId, MaintenanceStatus status, Pageable pageable) {
        return equipmentMaintenanceRepository.searchMaintenance(zoneId, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentMaintenance> getAllMaintenance() {
        return equipmentMaintenanceRepository.findAll();
    }

    @Override
    public void deleteMaintenance(Long id) {
        EquipmentMaintenance em = getMaintenanceById(id);
        equipmentMaintenanceRepository.delete(em);
        auditLogService.logAction(AuditAction.DELETE, "MAINTENANCE", id, em.getEquipmentName(), "DELETED");
    }
}
