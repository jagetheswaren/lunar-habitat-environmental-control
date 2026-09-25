package com.lunar.habitat.repository;

import com.lunar.habitat.entity.Telemetry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {

    List<Telemetry> findByHabitatZoneIdOrderByRecordedAtDesc(Long habitatZoneId);

    Optional<Telemetry> findFirstByHabitatZoneIdOrderByRecordedAtDesc(Long habitatZoneId);

    @Query("SELECT t FROM Telemetry t WHERE " +
           "(:zoneId IS NULL OR t.habitatZone.id = :zoneId) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:scrubberAdjusted IS NULL OR t.scrubberAutoAdjusted = :scrubberAdjusted) AND " +
           "(:startDateTime IS NULL OR t.recordedAt >= :startDateTime) AND " +
           "(:endDateTime IS NULL OR t.recordedAt <= :endDateTime) " +
           "ORDER BY t.recordedAt DESC")
    Page<Telemetry> filterTelemetry(@Param("zoneId") Long zoneId,
                                   @Param("status") String status,
                                   @Param("scrubberAdjusted") Boolean scrubberAdjusted,
                                   @Param("startDateTime") LocalDateTime startDateTime,
                                   @Param("endDateTime") LocalDateTime endDateTime,
                                   Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.oxygenConsumptionM3), 0) FROM Telemetry t WHERE " +
           "(:zoneId IS NULL OR t.habitatZone.id = :zoneId) AND " +
           "(t.recordedAt BETWEEN :startDateTime AND :endDateTime)")
    BigDecimal calculateTotalOxygenConsumption(@Param("zoneId") Long zoneId,
                                               @Param("startDateTime") LocalDateTime startDateTime,
                                               @Param("endDateTime") LocalDateTime endDateTime);

    @Query("SELECT COALESCE(SUM(t.waterConsumptionLiters), 0) FROM Telemetry t WHERE " +
           "(:zoneId IS NULL OR t.habitatZone.id = :zoneId) AND " +
           "(t.recordedAt BETWEEN :startDateTime AND :endDateTime)")
    BigDecimal calculateTotalWaterConsumption(@Param("zoneId") Long zoneId,
                                              @Param("startDateTime") LocalDateTime startDateTime,
                                              @Param("endDateTime") LocalDateTime endDateTime);

    @Query("SELECT AVG(t.atmosphericPressureKpa) FROM Telemetry t WHERE t.recordedAt >= :since")
    Double getAveragePressureSince(@Param("since") LocalDateTime since);

    @Query("SELECT AVG(t.waterPurityPercent) FROM Telemetry t WHERE t.recordedAt >= :since")
    Double getAverageWaterPuritySince(@Param("since") LocalDateTime since);

    @Query("SELECT AVG(t.co2LevelPpm) FROM Telemetry t WHERE t.recordedAt >= :since")
    Double getAverageCo2Since(@Param("since") LocalDateTime since);

    @Query("SELECT MIN(t.atmosphericPressureKpa) FROM Telemetry t WHERE t.recordedAt >= :since")
    BigDecimal getMinPressureSince(@Param("since") LocalDateTime since);

    @Query("SELECT MAX(t.atmosphericPressureKpa) FROM Telemetry t WHERE t.recordedAt >= :since")
    BigDecimal getMaxPressureSince(@Param("since") LocalDateTime since);

    long countByScrubberAutoAdjustedTrue();
}
