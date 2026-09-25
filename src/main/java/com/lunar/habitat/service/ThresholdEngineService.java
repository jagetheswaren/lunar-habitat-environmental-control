package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.ThresholdRequest;
import com.lunar.habitat.entity.EnvironmentalThreshold;
import com.lunar.habitat.entity.Telemetry;
import java.util.List;

public interface ThresholdEngineService {
    void evaluate(Telemetry telemetry);
    List<EnvironmentalThreshold> getAllThresholds();
    List<EnvironmentalThreshold> getActiveThresholds();
    EnvironmentalThreshold getThresholdById(Long id);
    EnvironmentalThreshold createThreshold(ThresholdRequest request);
    EnvironmentalThreshold updateThreshold(Long id, ThresholdRequest request);
    void deleteThreshold(Long id);
}
