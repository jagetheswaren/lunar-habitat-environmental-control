package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.HabitatZoneRequest;
import com.lunar.habitat.entity.HabitatZone;
import java.util.List;

public interface HabitatZoneService {
    HabitatZone createZone(HabitatZoneRequest request);
    HabitatZone updateZone(Long id, HabitatZoneRequest request);
    HabitatZone getZoneById(Long id);
    HabitatZone getZoneByCode(String code);
    List<HabitatZone> getAllZones();
    void deleteZone(Long id);
}
