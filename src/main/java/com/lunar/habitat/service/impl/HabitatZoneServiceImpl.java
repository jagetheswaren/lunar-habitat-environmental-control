package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.HabitatZoneRequest;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.exception.DuplicateResourceException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.HabitatZoneRepository;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.HabitatZoneService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class HabitatZoneServiceImpl implements HabitatZoneService {

    private final HabitatZoneRepository habitatZoneRepository;
    private final AuditLogService auditLogService;

    public HabitatZoneServiceImpl(HabitatZoneRepository habitatZoneRepository, AuditLogService auditLogService) {
        this.habitatZoneRepository = habitatZoneRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public HabitatZone createZone(HabitatZoneRequest request) {
        if (habitatZoneRepository.findByCode(request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Habitat zone with code " + request.getCode() + " already exists");
        }

        HabitatZone zone = new HabitatZone(
                request.getCode(),
                request.getName(),
                request.getDescription(),
                request.getLocationDescription()
        );
        if (request.getStatus() != null) {
            zone.setStatus(request.getStatus());
        }

        HabitatZone saved = habitatZoneRepository.save(zone);
        auditLogService.log(AuditAction.CREATE, "HabitatZone", saved.getId().toString(), "Created habitat zone " + saved.getName());
        return saved;
    }

    @Override
    public HabitatZone updateZone(Long id, HabitatZoneRequest request) {
        HabitatZone zone = getZoneById(id);

        if (!zone.getCode().equals(request.getCode()) && habitatZoneRepository.findByCode(request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Habitat zone code " + request.getCode() + " is already taken");
        }

        zone.setCode(request.getCode());
        zone.setName(request.getName());
        zone.setDescription(request.getDescription());
        zone.setLocationDescription(request.getLocationDescription());
        if (request.getStatus() != null) {
            zone.setStatus(request.getStatus());
        }

        HabitatZone updated = habitatZoneRepository.save(zone);
        auditLogService.log(AuditAction.UPDATE, "HabitatZone", updated.getId().toString(), "Updated habitat zone " + updated.getName());
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public HabitatZone getZoneById(Long id) {
        return habitatZoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habitat zone not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public HabitatZone getZoneByCode(String code) {
        return habitatZoneRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Habitat zone not found with code: " + code));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitatZone> getAllZones() {
        return habitatZoneRepository.findAll();
    }

    @Override
    public void deleteZone(Long id) {
        HabitatZone zone = getZoneById(id);
        habitatZoneRepository.delete(zone);
        auditLogService.log(AuditAction.DELETE, "HabitatZone", id.toString(), "Deleted habitat zone " + zone.getName());
    }
}
