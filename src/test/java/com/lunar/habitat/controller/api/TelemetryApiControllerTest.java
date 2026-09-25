package com.lunar.habitat.controller.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lunar.habitat.dto.request.TelemetryIngestRequest;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.enums.TelemetrySource;
import com.lunar.habitat.service.TelemetryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TelemetryApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TelemetryService telemetryService;

    @Test
    @WithMockUser(roles = "HABITAT_OPERATOR")
    @DisplayName("POST /api/v1/lunar/telemetry receives sensor data and returns 201 Created")
    void testIngestTelemetrySuccess() throws Exception {
        TelemetryIngestRequest request = new TelemetryIngestRequest();
        request.setHabitatZoneId(1L);
        request.setAtmosphericPressureKpa(new BigDecimal("101.30"));
        request.setWaterPurityPercent(new BigDecimal("98.70"));
        request.setOxygenConsumptionM3(new BigDecimal("150.00"));
        request.setWaterConsumptionLiters(new BigDecimal("900.00"));
        request.setSource(TelemetrySource.SENSOR);

        HabitatZone zone = new HabitatZone("DOME-A", "Habitat Dome Alpha", "Main dome", "Sector 1");
        zone.setId(1L);

        Telemetry saved = new Telemetry();
        saved.setId(42L);
        saved.setHabitatZone(zone);
        saved.setAtmosphericPressureKpa(request.getAtmosphericPressureKpa());
        saved.setWaterPurityPercent(request.getWaterPurityPercent());
        saved.setOxygenConsumptionM3(request.getOxygenConsumptionM3());
        saved.setWaterConsumptionLiters(request.getWaterConsumptionLiters());
        saved.setScrubberAutoAdjusted(false);
        saved.setRecordedAt(LocalDateTime.now());

        when(telemetryService.ingestTelemetry(any(TelemetryIngestRequest.class))).thenReturn(saved);

        mockMvc.perform(post("/api/v1/lunar/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.atmosphericPressureKpa").value(101.30))
                .andExpect(jsonPath("$.scrubberAutoAdjusted").value(false));
    }

    @Test
    @WithMockUser(roles = "HABITAT_OPERATOR")
    @DisplayName("GET /api/v1/lunar/telemetry/{id} returns telemetry record details")
    void testGetTelemetryById() throws Exception {
        HabitatZone zone = new HabitatZone("DOME-A", "Habitat Dome Alpha", "Main dome", "Sector 1");
        zone.setId(1L);

        Telemetry t = new Telemetry();
        t.setId(101L);
        t.setHabitatZone(zone);
        t.setAtmosphericPressureKpa(new BigDecimal("99.50"));

        when(telemetryService.getTelemetryById(101L)).thenReturn(t);

        mockMvc.perform(get("/api/v1/lunar/telemetry/101")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.atmosphericPressureKpa").value(99.50));
    }
}
