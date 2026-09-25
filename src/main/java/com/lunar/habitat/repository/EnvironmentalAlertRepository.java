package com.lunar.habitat.repository;

import com.lunar.habitat.entity.EnvironmentalAlert;
import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnvironmentalAlertRepository extends JpaRepository<EnvironmentalAlert, Long> {

    List<EnvironmentalAlert> findByStatusOrderByCreatedAtDesc(AlertStatus status);

    long countByStatus(AlertStatus status);

    long countByStatusAndSeverity(AlertStatus status, AlertSeverity severity);

    @Query("SELECT a FROM EnvironmentalAlert a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:severity IS NULL OR a.severity = :severity) AND " +
           "(:zoneId IS NULL OR a.habitatZone.id = :zoneId) " +
           "ORDER BY a.createdAt DESC")
    Page<EnvironmentalAlert> searchAlerts(@Param("status") AlertStatus status,
                                          @Param("severity") AlertSeverity severity,
                                          @Param("zoneId") Long zoneId,
                                          Pageable pageable);
}
