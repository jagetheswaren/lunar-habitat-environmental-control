package com.lunar.habitat.repository;

import com.lunar.habitat.entity.EnvironmentalThreshold;
import com.lunar.habitat.enums.ThresholdParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnvironmentalThresholdRepository extends JpaRepository<EnvironmentalThreshold, Long> {
    Optional<EnvironmentalThreshold> findByParameter(ThresholdParameter parameter);
    List<EnvironmentalThreshold> findByEnabledTrue();
}
