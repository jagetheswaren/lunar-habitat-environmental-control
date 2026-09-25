package com.lunar.habitat.repository;

import com.lunar.habitat.entity.HabitatZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitatZoneRepository extends JpaRepository<HabitatZone, Long> {
    Optional<HabitatZone> findByCode(String code);
    List<HabitatZone> findByStatus(String status);
}
