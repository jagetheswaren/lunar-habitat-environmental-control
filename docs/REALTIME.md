# Real-Time Telemetry & Event Streaming

The Lunar Habitat platform features a low-latency real-time pipeline that distributes sensor metrics, actuator responses, and environmental threshold alerts to Mission Control and the 3D Digital Twin.

---

## ⚡ Telemetry & Actuation Pipeline

```mermaid
flowchart TD
    Sensor["Lunar Habitat Sensors (O2, CO2, Temp, Pressure, H2O)"]
    API["TelemetryApiController (/api/v2/telemetry)"]
    TelemSvc["TelemetryService / Ingestion"]
    ThreshEng["ThresholdEngineService"]
    DB[("MySQL Database")]
    AlertEng["EnvironmentalAlertService"]
    Scrubber["ScrubberActuatorService"]
    StreamSvc["TelemetryStreamService"]
    
    subgraph Streaming Channels
        SSE["Server-Sent Events (/api/v2/telemetry/stream)"]
        WS["STOMP WebSocket (/ws -> /topic/telemetry)"]
    end
    
    subgraph Client UI
        UI["Mission Control Dashboard"]
        Twin["3D Digital Twin (Three.js WebGL)"]
    end
    
    Sensor -->|POST JSON| API
    API --> TelemSvc
    TelemSvc --> DB
    TelemSvc --> ThreshEng
    
    ThreshEng -->|Breach Detected| AlertEng
    ThreshEng -->|Hypercapnia CO2 > Limit| Scrubber
    
    AlertEng --> DB
    Scrubber -->|Fan Speed / Amine Loop Adjustment| DB
    
    TelemSvc --> StreamSvc
    AlertEng --> StreamSvc
    Scrubber --> StreamSvc
    
    StreamSvc --> SSE
    StreamSvc --> WS
    
    SSE --> UI
    WS --> UI
    SSE --> Twin
    WS --> Twin
```

---

## 📡 Streaming Protocols

### 1. Server-Sent Events (SSE)
- **Endpoint:** `GET /api/v2/telemetry/stream`
- **Format:** `text/event-stream`
- **Payload:** Serialized `TelemetryV2Response` JSON objects broadcasted whenever new sensor readings are recorded or simulated.
- **Client Handling:** Consumed via the browser's native `EventSource` API with automatic reconnection logic.

### 2. Spring STOMP WebSockets
- **Handshake Endpoint:** `http://localhost:8081/ws` (with SockJS fallback)
- **Subscription Topic:** `/topic/telemetry`
- **Application Broker Prefix:** `/app`
- **Features:** Supports bi-directional operator commands and broadcast state updates.
