package com.lunar.habitat.repository;

import com.lunar.habitat.entity.SalesOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesOrderLineRepository extends JpaRepository<SalesOrderLine, Long> {
}
