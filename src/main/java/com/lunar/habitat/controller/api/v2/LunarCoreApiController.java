package com.lunar.habitat.controller.api.v2;

import com.lunar.habitat.dto.v2.DiagnosticQueryResponse;
import com.lunar.habitat.dto.v2.LunarCoreHealthResponse;
import com.lunar.habitat.service.LunarCoreIntelligenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v2/lunar-core")
@Tag(name = "LUNAR CORE Operational Intelligence V2", description = "Deterministic habitat health index and grounded mission diagnostics")
public class LunarCoreApiController {

    private final LunarCoreIntelligenceService lunarCoreService;

    public LunarCoreApiController(LunarCoreIntelligenceService lunarCoreService) {
        this.lunarCoreService = lunarCoreService;
    }

    @GetMapping("/health")
    @Operation(summary = "Calculate Habitat Health Index", description = "Deterministic 0-100 composite index for Atmosphere, Water, Life Support, Resources, Maintenance, and Power")
    public ResponseEntity<LunarCoreHealthResponse> getHealthIndex() {
        return ResponseEntity.ok(lunarCoreService.calculateHabitatHealth());
    }

    @GetMapping("/diagnose")
    @Operation(summary = "Interactive Diagnostic Query (GET)", description = "Answers operator questions using deterministic telemetry and incident analysis")
    public ResponseEntity<DiagnosticQueryResponse> diagnoseGet(@RequestParam(name = "q", defaultValue = "Summarize today's habitat health") String query) {
        return ResponseEntity.ok(lunarCoreService.diagnoseQuery(query));
    }

    @PostMapping("/diagnose")
    @Operation(summary = "Interactive Diagnostic Query (POST)", description = "Answers operator questions with request body payload")
    public ResponseEntity<DiagnosticQueryResponse> diagnosePost(@RequestBody Map<String, String> request) {
        String query = request.getOrDefault("query", "Summarize today's habitat health");
        return ResponseEntity.ok(lunarCoreService.diagnoseQuery(query));
    }
}
