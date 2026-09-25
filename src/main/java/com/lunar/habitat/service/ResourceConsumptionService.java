package com.lunar.habitat.service;

import com.lunar.habitat.dto.response.ResourceReportResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface ResourceConsumptionService {
    BigDecimal getOxygenConsumption(Long zoneId, LocalDateTime start, LocalDateTime end);
    BigDecimal getWaterConsumption(Long zoneId, LocalDateTime start, LocalDateTime end);
    ResourceReportResponse getAggregatedConsumptionReport(LocalDateTime start, LocalDateTime end);
    ResourceReportResponse getDailyConsumptionReport();
    ResourceReportResponse getMonthlyConsumptionReport();
}
