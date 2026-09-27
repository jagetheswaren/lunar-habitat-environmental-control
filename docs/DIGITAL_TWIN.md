# 3D Digital Twin Specification

The Lunar Habitat 3D Digital Twin is an interactive WebGL simulation rendered directly in the browser using **Three.js** inside `frontend/src/components/3d/LunarDome3D.tsx`.

---

## 🌐 Architectural Modules & Spatial Layout

The digital twin models an off-world surface installation composed of four interconnected operational sectors:

| Module Name | Sector Code | Spatial Coordinates `[x, y, z]` | Description |
|---|---|---|---|
| **Habitat Dome Alpha** | `SECTOR-01-CREW` | `[-2.6, 0.0, -0.8]` | Main pressurized geodesic dome housing crew quarters, comms hub, and medical bay. |
| **Hydroponics Biosphere** | `SECTOR-02-AGRI` | `[2.4, 0.0, -1.2]` | Pressurized agricultural cylinder for crop cultivation and biomass oxygen regeneration. |
| **Life Support & Reclamation** | `SECTOR-03-ECLSS` | `[0.0, 0.0, 2.2]` | Primary CO₂ amine scrubbers, catalytic water reclamation units, and Sabatier reactor. |
| **Cryo Power & Solar Grid** | `SECTOR-04-ENERGY`| `[-4.2, 0.0, 2.0]` | Dual solar photovoltaic trackers and cryogenic fuel cell energy storage. |

---

## 🎨 Interactive Capabilities

1. **Camera Controls & Orbit:**
   - Smooth mouse/touch rotation, pan, and zoom around the lunar terrain.
   - Cinematic focus transition when an operator clicks on an individual habitat module.
2. **Real-Time Telemetry HUD:**
   - Selecting a module reveals localized environmental metrics: atmospheric pressure, $O_2$ concentration, $CO_2$ ppm, temperature, humidity, and water purity.
3. **Dynamic State Glow & Alert Indication:**
   - **NOMINAL:** Subtle cyan pulse illumination (`#00f0ff`).
   - **WARNING:** Amber caution emission (`#f59e0b`).
   - **CRITICAL:** High-intensity flashing red alarm beacon (`#ef4444`) synchronized with threshold breach alerts.
