package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.TelemetryIngestRequest;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.enums.TelemetrySource;
import com.lunar.habitat.repository.HabitatZoneRepository;
import com.lunar.habitat.repository.TelemetryRepository;
import com.lunar.habitat.service.impl.TelemetryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TelemetryServiceTest {

    @Mock
    private TelemetryRepository telemetryRepository;

    @Mock
    private HabitatZoneRepository habitatZoneRepository;

    @Mock
    private ThresholdEngineService thresholdEngineService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private TelemetryServiceImpl telemetryService;

    private HabitatZone domeAlpha;

    @BeforeEach
    void setUp() {
        domeAlpha = new HabitatZone("DOME-A", "Habitat Dome Alpha", "Primary crew biosphere", "Sector 4");
        domeAlpha.setId(1L);
    }

    @Test
    @DisplayName("Should ingest telemetry and invoke threshold evaluation engine")
    void testIngestTelemetrySuccess() {
        when(habitatZoneRepository.findById(1L)).thenReturn(Optional.of(domeAlpha));
        when(telemetryRepository.save(any(Telemetry.class))).thenAnswer(invocation -> {
            Telemetry t = invocation.getArgument(0);
            t.setId(10L);
            return t;
        });

        TelemetryIngestRequest request = new TelemetryIngestRequest();
        request.setHabitatZoneId(1L);
        request.setAtmosphericPressureKpa(new BigDecimal("101.32"));
        request.setWaterPurityPercent(new BigDecimal("98.50"));
        request.setOxygenConsumptionM3(new BigDecimal("125.40"));
        request.setWaterConsumptionLiters(new BigDecimal("820.00"));
        request.setCo2LevelPpm(new BigDecimal("520.00"));
        request.setTemperatureCelsius(new BigDecimal("21.50"));
        request.setHumidityPercent(new BigDecimal("45.00"));
        request.setSource(TelemetrySource.SENSOR);

        Telemetry result = telemetryService.ingestTelemetry(request);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals(new BigDecimal("101.32"), result.getAtmosphericPressureKpa());
        assertEquals("DOME-A", result.getHabitatZone().getCode());

        verify(thresholdEngineService, times(1)).evaluate(any(Telemetry.class));
        verify(telemetryRepository, times(1)).save(any(Telemetry.class));
        verify(auditLogService, times(1)).log(any(), any(), any(), any());
    }
}
