package com.lunar.habitat.repository;

import com.lunar.habitat.entity.AuditLog;
import com.lunar.habitat.enums.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:username IS NULL OR LOWER(a.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:entityType IS NULL OR LOWER(a.entityType) LIKE LOWER(CONCAT('%', :entityType, '%'))) AND " +
           "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR a.timestamp <= :endDate) " +
           "ORDER BY a.timestamp DESC")
    Page<AuditLog> searchAuditLogs(@Param("username") String username,
                                   @Param("action") AuditAction action,
                                   @Param("entityType") String entityType,
                                   @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate,
                                   Pageable pageable);
}
