import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface ModuleData {
  id: string;
  name: string;
  code: string;
  sector: string;
  position: [number, number, number];
  pressure: number;
  oxygen: string;
  co2: number;
  temperature: number;
  humidity: number;
  waterPurity: number;
  lifeSupport: string;
  scrubber: string;
  power: string;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  statusMessage: string;
}

interface Props {
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  zoneName?: string;
  co2Level?: number;
  pressure?: number;
  waterPurity?: number;
  temperature?: number;
  humidity?: number;
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string) => void;
}

export const LunarDome3D: React.FC<Props> = ({
  status = 'NORMAL',
  zoneName = 'Habitat Dome Alpha',
  co2Level = 428,
  pressure = 101.32,
  waterPurity = 99.4,
  temperature = 22.1,
  humidity = 46,
  selectedModuleId,
  onSelectModule,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Default modules for the interconnected 3D lunar base
  const modules: ModuleData[] = [
    {
      id: 'dome-alpha',
      name: 'Habitat Dome Alpha',
      code: 'DOME-ALPHA',
      sector: 'SECTOR-01-CREW',
      position: [-2.6, 0, -0.8],
      pressure: Number(pressure) || 101.32,
      oxygen: (pressure >= 98 && pressure <= 104) ? 'NOMINAL' : 'REGULATING',
      co2: Number(co2Level) || 428,
      temperature: Number(temperature) || 22.1,
      humidity: Number(humidity) || 46,
      waterPurity: Number(waterPurity) || 99.4,
      lifeSupport: 'ONLINE',
      scrubber: co2Level > 950 ? 'BOOST' : co2Level > 800 ? 'HIGH_INTENSITY' : 'NORMAL',
      power: 'STABLE',
      status: co2Level > 950 ? 'CRITICAL' : co2Level > 800 ? 'WARNING' : 'NOMINAL',
      statusMessage: co2Level > 950 ? 'Critical CO2 ceiling breach' : co2Level > 800 ? 'Elevated CO2 detected' : 'All systems nominal',
    },
    {
      id: 'dome-beta',
      name: 'Hydroponics Dome Beta',
      code: 'DOME-BETA',
      sector: 'SECTOR-02-AGRI',
      position: [2.5, 0, -1.2],
      pressure: 101.25,
      oxygen: 'ENRICHED (21.4%)',
      co2: 410,
      temperature: 23.5,
      humidity: 58,
      waterPurity: 99.8,
      lifeSupport: 'ONLINE',
      scrubber: 'NORMAL',
      power: 'STABLE',
      status: 'NOMINAL',
      statusMessage: 'Biomass photosynthesis in equilibrium',
    },
    {
      id: 'sector-gamma',
      name: 'Life Support Reclamation Gamma',
      code: 'SECTOR-GAMMA',
      sector: 'SECTOR-03-ECLSS',
      position: [0.0, 0, 2.5],
      pressure: 101.40,
      oxygen: 'NOMINAL',
      co2: 395,
      temperature: 20.8,
      humidity: 42,
      waterPurity: 99.6,
      lifeSupport: 'ONLINE',
      scrubber: 'CYCLING',
      power: 'STABLE',
      status: 'NOMINAL',
      statusMessage: 'Water & atmospheric recycling loops active',
    },
    {
      id: 'grid-delta',
      name: 'Solar Array & Power Hub Delta',
      code: 'GRID-DELTA',
      sector: 'SECTOR-04-ENERGY',
      position: [3.4, 0, 1.8],
      pressure: 100.8,
      oxygen: 'INERT_STORAGE',
      co2: 380,
      temperature: 18.5,
      humidity: 35,
      waterPurity: 99.9,
      lifeSupport: 'STANDBY',
      scrubber: 'STANDBY',
      power: 'PEAK_GENERATION (98.4%)',
      status: 'NOMINAL',
      statusMessage: 'Photovoltaic arrays track lunar sun elevation',
    },
  ];

  const [activeModuleId, setActiveModuleId] = useState<string>('dome-alpha');
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 7, 12));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));

  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[0];

  const selectModule = (id: string) => {
    setActiveModuleId(id);
    const mod = modules.find((m) => m.id === id);
    if (mod) {
      targetCamPos.current.set(mod.position[0] * 1.1, 4.5, mod.position[2] + 4.8);
      targetLookAt.current.set(mod.position[0], 1.0, mod.position[2]);
    }
    if (onSelectModule) {
      onSelectModule(id);
    }
  };

  const resetView = () => {
    setActiveModuleId('dome-alpha');
    targetCamPos.current.set(0, 7, 12);
    targetLookAt.current.set(0, 0.5, 0);
  };

  useEffect(() => {
    if (selectedModuleId && selectedModuleId !== activeModuleId) {
      selectModule(selectedModuleId);
    }
  }, [selectedModuleId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0d14, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 7, 12);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x0e1726, 2.0);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xcfe4ff, 2.2);
    sunLight.position.set(12, 18, 10);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    rimLight.position.set(-10, 8, -10);
    scene.add(rimLight);

    // 1. Lunar Terrain Base
    const groundGeo = new THREE.CircleGeometry(9, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x101522,
      roughness: 0.95,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Lunar Ground Wireframe Grid
    const gridHelper = new THREE.GridHelper(18, 28, 0x00f0ff, 0x192738);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Concentric Landing rings
    const ringGeo = new THREE.RingGeometry(8.5, 8.7, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const perimeterRing = new THREE.Mesh(ringGeo, ringMat);
    perimeterRing.rotation.x = -Math.PI / 2;
    perimeterRing.position.y = 0.02;
    scene.add(perimeterRing);

    // Module Meshes Map
    const moduleGroup = new THREE.Group();
    scene.add(moduleGroup);

    const domeAlphaGroup = new THREE.Group();
    domeAlphaGroup.position.set(-2.6, 0, -0.8);
    moduleGroup.add(domeAlphaGroup);

    const domeBetaGroup = new THREE.Group();
    domeBetaGroup.position.set(2.5, 0, -1.2);
    moduleGroup.add(domeBetaGroup);

    const sectorGammaGroup = new THREE.Group();
    sectorGammaGroup.position.set(0.0, 0, 2.5);
    moduleGroup.add(sectorGammaGroup);

    const gridDeltaGroup = new THREE.Group();
    gridDeltaGroup.position.set(3.4, 0, 1.8);
    moduleGroup.add(gridDeltaGroup);

    // Build Module Alpha (Primary Dome)
    const alphaStatus = activeModule.status;
    const alphaColor = alphaStatus === 'CRITICAL' ? 0xff2255 : alphaStatus === 'WARNING' ? 0xffaa00 : 0x00f0ff;

    const domeGeo = new THREE.SphereGeometry(1.8, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeWireMat = new THREE.MeshBasicMaterial({
      color: alphaColor,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const alphaWire = new THREE.Mesh(domeGeo, domeWireMat);
    domeAlphaGroup.add(alphaWire);

    const alphaInnerMat = new THREE.MeshPhysicalMaterial({
      color: 0x071b30,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.7,
      ior: 1.15,
    });
    const alphaInner = new THREE.Mesh(domeGeo, alphaInnerMat);
    domeAlphaGroup.add(alphaInner);

    const alphaSpire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.12, 2.4, 12),
      new THREE.MeshStandardMaterial({ color: alphaColor, emissive: alphaColor, emissiveIntensity: 0.6 })
    );
    alphaSpire.position.y = 1.2;
    domeAlphaGroup.add(alphaSpire);

    const alphaLight = new THREE.PointLight(alphaColor, 2.5, 8);
    alphaLight.position.set(0, 1.5, 0);
    domeAlphaGroup.add(alphaLight);

    // Build Module Beta (Hydroponics - Emerald glow)
    const betaGeo = new THREE.SphereGeometry(1.4, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const betaWire = new THREE.Mesh(
      betaGeo,
      new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.55 })
    );
    domeBetaGroup.add(betaWire);

    const betaInner = new THREE.Mesh(
      betaGeo,
      new THREE.MeshPhysicalMaterial({ color: 0x042416, transparent: true, opacity: 0.5, roughness: 0.2 })
    );
    domeBetaGroup.add(betaInner);

    const betaLight = new THREE.PointLight(0x10b981, 1.8, 6);
    betaLight.position.set(0, 1.2, 0);
    domeBetaGroup.add(betaLight);

    // Build Sector Gamma (Life Support Scrubber Hexagon)
    const gammaGeo = new THREE.CylinderGeometry(1.2, 1.3, 1.4, 6);
    const gammaMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const gammaCylinder = new THREE.Mesh(gammaGeo, gammaMat);
    gammaCylinder.position.y = 0.7;
    sectorGammaGroup.add(gammaCylinder);

    const gammaRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.06, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    gammaRing.rotation.x = Math.PI / 2;
    gammaRing.position.y = 0.8;
    sectorGammaGroup.add(gammaRing);

    // Build Delta Grid (Solar Arrays)
    const solarGroup = new THREE.Group();
    const panelGeo = new THREE.BoxGeometry(0.8, 0.04, 1.4);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x091b38,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0c254d,
      emissiveIntensity: 0.4,
    });
    for (let p = -1; p <= 1; p++) {
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(p * 0.9, 0.6, 0);
      panel.rotation.x = 0.4;
      solarGroup.add(panel);
    }
    gridDeltaGroup.add(solarGroup);

    // Interconnecting Pressurized Resource Tunnels / Pipelines
    const createTunnel = (start: THREE.Vector3, end: THREE.Vector3) => {
      const distance = start.distanceTo(end);
      const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, distance, 12),
        new THREE.MeshStandardMaterial({ color: 0x223249, metalness: 0.7, roughness: 0.4 })
      );
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      cylinder.position.copy(mid);
      cylinder.position.y = 0.18;
      cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
      scene.add(cylinder);

      // Glowing flow ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.02, 6, 16),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7 })
      );
      ring.position.copy(mid);
      ring.position.y = 0.18;
      ring.quaternion.copy(cylinder.quaternion);
      scene.add(ring);
    };

    createTunnel(new THREE.Vector3(-2.6, 0, -0.8), new THREE.Vector3(2.5, 0, -1.2)); // Alpha <-> Beta
    createTunnel(new THREE.Vector3(-2.6, 0, -0.8), new THREE.Vector3(0.0, 0, 2.5));  // Alpha <-> Gamma
    createTunnel(new THREE.Vector3(2.5, 0, -1.2), new THREE.Vector3(3.4, 0, 1.8));   // Beta <-> Delta
    createTunnel(new THREE.Vector3(0.0, 0, 2.5), new THREE.Vector3(3.4, 0, 1.8));   // Gamma <-> Delta

    // Atmospheric Floating Sensor Particles
    const pCount = 70;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 14;
      pPos[i + 1] = Math.random() * 4.5 + 0.2;
      pPos[i + 2] = (Math.random() - 0.5) * 14;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.07,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    let time = 0;
    const currentLookAt = new THREE.Vector3(0, 0.5, 0);

    const animate = () => {
      time += 0.015;

      alphaWire.rotation.y = time * 0.12;
      betaWire.rotation.y = time * 0.1;
      particles.rotation.y = time * 0.03;

      // Pulse alpha light if critical or warning
      if (alphaStatus === 'CRITICAL') {
        alphaLight.intensity = 2.5 + Math.sin(time * 8) * 1.5;
      } else if (alphaStatus === 'WARNING') {
        alphaLight.intensity = 2.0 + Math.sin(time * 4) * 0.8;
      }

      // Smooth camera interpolation toward target
      camera.position.x += (targetCamPos.current.x + mouseX * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (targetCamPos.current.y - mouseY * 0.6 - camera.position.y) * 0.04;
      camera.position.z += (targetCamPos.current.z - camera.position.z) * 0.04;

      currentLookAt.x += (targetLookAt.current.x - currentLookAt.x) * 0.05;
      currentLookAt.y += (targetLookAt.current.y - currentLookAt.y) * 0.05;
      currentLookAt.z += (targetLookAt.current.z - currentLookAt.z) * 0.05;
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeModuleId, status, co2Level, pressure]);

  return (
    <div className="relative w-full h-[430px] rounded-2xl overflow-hidden bg-[#0c0f17] border border-cyan-500/20 shadow-2xl group">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Left: Mission Control Overlay Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            3D LUNAR HABITAT DIGITAL TWIN • V2
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white font-mono">
          {activeModule.name}
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          {activeModule.sector} • LAT: 0.674°N • LON: 23.472°E • ELEV: -1.2 km
        </p>
      </div>

      {/* Top Right: Interactive Module Selector Navigation */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-space-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => selectModule(m.id)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                activeModuleId === m.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {m.code}
            </button>
          ))}
          <button
            onClick={resetView}
            className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-white border-l border-slate-700/60 ml-1 pl-2"
            title="Reset to Full Base View"
          >
            RESET
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border border-cyan-500/30 bg-space-950/80 backdrop-blur-md">
          <span
            className={`w-2 h-2 rounded-full ${
              activeModule.status === 'CRITICAL'
                ? 'bg-red-500 animate-pulse'
                : activeModule.status === 'WARNING'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span
            className={
              activeModule.status === 'CRITICAL'
                ? 'text-red-400 font-bold'
                : activeModule.status === 'WARNING'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }
          >
            {activeModule.status}
          </span>
        </div>
      </div>

      {/* Bottom Floating Telemetry Spec Overlay (Exact user-requested layout) */}
      <div className="absolute bottom-4 left-4 z-10 max-w-sm w-full bg-[#121622]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-2xl font-mono text-xs text-slate-300">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-cyan-500/20">
          <span className="text-white font-bold tracking-wider uppercase text-[11px]">
            {activeModule.code} SPECIFICATION
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">PRIMARY LOOP</span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Pressure:</span>
            <span className="text-cyan-400 font-semibold">{activeModule.pressure.toFixed(1)} kPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Oxygen:</span>
            <span className="text-emerald-400 font-semibold">{activeModule.oxygen}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">CO₂:</span>
            <span
              className={
                activeModule.co2 > 950
                  ? 'text-red-400 font-bold'
                  : activeModule.co2 > 800
                  ? 'text-amber-400 font-semibold'
                  : 'text-emerald-400 font-semibold'
              }
            >
              {activeModule.co2.toFixed(0)} ppm
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Temperature:</span>
            <span className="text-cyan-300">{activeModule.temperature.toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Humidity:</span>
            <span className="text-cyan-300">{activeModule.humidity.toFixed(0)} %</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Water Purity:</span>
            <span className="text-emerald-400 font-semibold">{activeModule.waterPurity.toFixed(1)} %</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Life Support:</span>
            <span className="text-emerald-400 font-semibold">{activeModule.lifeSupport}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Scrubber:</span>
            <span className={activeModule.scrubber === 'BOOST' ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {activeModule.scrubber}
            </span>
          </div>
          <div className="flex justify-between col-span-2 pt-1 border-t border-slate-700/50">
            <span className="text-slate-400">Power:</span>
            <span className="text-cyan-400 font-semibold">{activeModule.power}</span>
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-cyan-500/10 flex items-center gap-1.5 text-[10px] text-slate-400">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              activeModule.status === 'CRITICAL' ? 'bg-red-500' : 'bg-emerald-400'
            }`}
          />
          <span className="truncate">{activeModule.statusMessage}</span>
        </div>
      </div>

      {/* Bottom Right: Quick Interaction Helper */}
      <div className="absolute bottom-3 right-4 z-10 pointer-events-none text-right font-mono text-[10px] text-slate-400">
        <div>INTERCONNECTED MODULES: 4 • PIPELINES: ACTIVE</div>
        <div className="text-cyan-400/80">SELECT MODULE BUTTONS ABOVE TO ZOOM & INSPECT</div>
      </div>
    </div>
  );
};
