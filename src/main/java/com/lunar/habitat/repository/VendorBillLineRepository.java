package com.lunar.habitat.repository;

import com.lunar.habitat.entity.VendorBillLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorBillLineRepository extends JpaRepository<VendorBillLine, Long> {
}
