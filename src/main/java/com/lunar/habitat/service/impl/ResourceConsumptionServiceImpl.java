package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.response.ResourceReportResponse;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.ResourceInventory;
import com.lunar.habitat.repository.HabitatZoneRepository;
import com.lunar.habitat.repository.ResourceInventoryRepository;
import com.lunar.habitat.repository.TelemetryRepository;
import com.lunar.habitat.service.ResourceConsumptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ResourceConsumptionServiceImpl implements ResourceConsumptionService {

    private final TelemetryRepository telemetryRepository;
    private final HabitatZoneRepository habitatZoneRepository;
    private final ResourceInventoryRepository inventoryRepository;

    public ResourceConsumptionServiceImpl(TelemetryRepository telemetryRepository,
                                           HabitatZoneRepository habitatZoneRepository,
                                           ResourceInventoryRepository inventoryRepository) {
        this.telemetryRepository = telemetryRepository;
        this.habitatZoneRepository = habitatZoneRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public BigDecimal getOxygenConsumption(Long zoneId, LocalDateTime start, LocalDateTime end) {
        return telemetryRepository.calculateTotalOxygenConsumption(zoneId, start, end);
    }

    @Override
    public BigDecimal getWaterConsumption(Long zoneId, LocalDateTime start, LocalDateTime end) {
        return telemetryRepository.calculateTotalWaterConsumption(zoneId, start, end);
    }

    @Override
    public ResourceReportResponse getAggregatedConsumptionReport(LocalDateTime start, LocalDateTime end) {
        ResourceReportResponse response = new ResourceReportResponse();
        response.setPeriodStart(start);
        response.setPeriodEnd(end);

        BigDecimal totalO2 = BigDecimal.ZERO;
        BigDecimal totalH2O = BigDecimal.ZERO;

        List<HabitatZone> zones = habitatZoneRepository.findAll();
        List<ResourceReportResponse.ZoneResourceConsumption> zoneList = new ArrayList<>();

        for (HabitatZone zone : zones) {
            BigDecimal zO2 = telemetryRepository.calculateTotalOxygenConsumption(zone.getId(), start, end);
            BigDecimal zH2O = telemetryRepository.calculateTotalWaterConsumption(zone.getId(), start, end);

            totalO2 = totalO2.add(zO2);
            totalH2O = totalH2O.add(zH2O);

            zoneList.add(new ResourceReportResponse.ZoneResourceConsumption(zone.getCode(), zone.getName(), zO2, zH2O));
        }

        response.setTotalOxygenConsumedM3(totalO2);
        response.setTotalWaterConsumedLiters(totalH2O);
        response.setZoneBreakdowns(zoneList);
        response.setTotalScrubberAdjustments(telemetryRepository.countByScrubberAutoAdjustedTrue());

        List<ResourceInventory> stocks = inventoryRepository.findAll();
        List<ResourceReportResponse.StockLevelItem> stockItems = new ArrayList<>();
        for (ResourceInventory stock : stocks) {
            stockItems.add(new ResourceReportResponse.StockLevelItem(
                    stock.getResourceName(),
                    stock.getSku(),
                    stock.getQuantity(),
                    stock.getUnitOfMeasure().name(),
                    stock.getLocation(),
                    stock.isLowStock()
            ));
        }
        response.setInventoryStock(stockItems);

        return response;
    }

    @Override
    public ResourceReportResponse getDailyConsumptionReport() {
        LocalDateTime start = LocalDateTime.now().minus(24, ChronoUnit.HOURS);
        LocalDateTime end = LocalDateTime.now();
        return getAggregatedConsumptionReport(start, end);
    }

    @Override
    public ResourceReportResponse getMonthlyConsumptionReport() {
        LocalDateTime start = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        LocalDateTime end = LocalDateTime.now();
        return getAggregatedConsumptionReport(start, end);
    }
}
