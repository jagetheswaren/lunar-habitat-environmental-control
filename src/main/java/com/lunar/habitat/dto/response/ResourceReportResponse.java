package com.lunar.habitat.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ResourceReportResponse {

    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private BigDecimal totalOxygenConsumedM3 = BigDecimal.ZERO;
    private BigDecimal totalWaterConsumedLiters = BigDecimal.ZERO;
    private long totalScrubberAdjustments;
    private List<ZoneResourceConsumption> zoneBreakdowns = new ArrayList<>();
    private List<StockLevelItem> inventoryStock = new ArrayList<>();

    public ResourceReportResponse() {}

    public static class ZoneResourceConsumption {
        private String zoneCode;
        private String zoneName;
        private BigDecimal oxygenConsumedM3;
        private BigDecimal waterConsumedLiters;

        public ZoneResourceConsumption() {}

        public ZoneResourceConsumption(String zoneCode, String zoneName, BigDecimal oxygenConsumedM3, BigDecimal waterConsumedLiters) {
            this.zoneCode = zoneCode;
            this.zoneName = zoneName;
            this.oxygenConsumedM3 = oxygenConsumedM3 != null ? oxygenConsumedM3 : BigDecimal.ZERO;
            this.waterConsumedLiters = waterConsumedLiters != null ? waterConsumedLiters : BigDecimal.ZERO;
        }

        public String getZoneCode() {
            return zoneCode;
        }

        public void setZoneCode(String zoneCode) {
            this.zoneCode = zoneCode;
        }

        public String getZoneName() {
            return zoneName;
        }

        public void setZoneName(String zoneName) {
            this.zoneName = zoneName;
        }

        public BigDecimal getOxygenConsumedM3() {
            return oxygenConsumedM3;
        }

        public void setOxygenConsumedM3(BigDecimal oxygenConsumedM3) {
            this.oxygenConsumedM3 = oxygenConsumedM3;
        }

        public BigDecimal getWaterConsumedLiters() {
            return waterConsumedLiters;
        }

        public void setWaterConsumedLiters(BigDecimal waterConsumedLiters) {
            this.waterConsumedLiters = waterConsumedLiters;
        }
    }

    public static class StockLevelItem {
        private String resourceName;
        private String sku;
        private BigDecimal quantity;
        private String unitOfMeasure;
        private String location;
        private boolean lowStock;

        public StockLevelItem() {}

        public StockLevelItem(String resourceName, String sku, BigDecimal quantity, String unitOfMeasure, String location, boolean lowStock) {
            this.resourceName = resourceName;
            this.sku = sku;
            this.quantity = quantity;
            this.unitOfMeasure = unitOfMeasure;
            this.location = location;
            this.lowStock = lowStock;
        }

        public String getResourceName() {
            return resourceName;
        }

        public void setResourceName(String resourceName) {
            this.resourceName = resourceName;
        }

        public String getSku() {
            return sku;
        }

        public void setSku(String sku) {
            this.sku = sku;
        }

        public BigDecimal getQuantity() {
            return quantity;
        }

        public void setQuantity(BigDecimal quantity) {
            this.quantity = quantity;
        }

        public String getUnitOfMeasure() {
            return unitOfMeasure;
        }

        public void setUnitOfMeasure(String unitOfMeasure) {
            this.unitOfMeasure = unitOfMeasure;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public boolean isLowStock() {
            return lowStock;
        }

        public void setLowStock(boolean lowStock) {
            this.lowStock = lowStock;
        }
    }

    public LocalDateTime getPeriodStart() {
        return periodStart;
    }

    public void setPeriodStart(LocalDateTime periodStart) {
        this.periodStart = periodStart;
    }

    public LocalDateTime getPeriodEnd() {
        return periodEnd;
    }

    public void setPeriodEnd(LocalDateTime periodEnd) {
        this.periodEnd = periodEnd;
    }

    public BigDecimal getTotalOxygenConsumedM3() {
        return totalOxygenConsumedM3;
    }

    public void setTotalOxygenConsumedM3(BigDecimal totalOxygenConsumedM3) {
        this.totalOxygenConsumedM3 = totalOxygenConsumedM3;
    }

    public BigDecimal getTotalWaterConsumedLiters() {
        return totalWaterConsumedLiters;
    }

    public void setTotalWaterConsumedLiters(BigDecimal totalWaterConsumedLiters) {
        this.totalWaterConsumedLiters = totalWaterConsumedLiters;
    }

    public long getTotalScrubberAdjustments() {
        return totalScrubberAdjustments;
    }

    public void setTotalScrubberAdjustments(long totalScrubberAdjustments) {
        this.totalScrubberAdjustments = totalScrubberAdjustments;
    }

    public List<ZoneResourceConsumption> getZoneBreakdowns() {
        return zoneBreakdowns;
    }

    public void setZoneBreakdowns(List<ZoneResourceConsumption> zoneBreakdowns) {
        this.zoneBreakdowns = zoneBreakdowns;
    }

    public List<StockLevelItem> getInventoryStock() {
        return inventoryStock;
    }

    public void setInventoryStock(List<StockLevelItem> inventoryStock) {
        this.inventoryStock = inventoryStock;
    }
}
