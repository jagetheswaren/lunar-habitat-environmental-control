import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  zoneName?: string;
  co2Level?: number;
  pressure?: number;
}

export const LunarDome3D: React.FC<Props> = ({
  status = 'NORMAL',
  zoneName = 'Habitat Dome Alpha',
  co2Level = 450,
  pressure = 101.3,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0a1b38, 2.5);
    scene.add(ambientLight);

    const domeLightColor = status === 'CRITICAL' ? 0xff0055 : status === 'WARNING' ? 0xffaa00 : 0x00f0ff;
    const pointLight = new THREE.PointLight(domeLightColor, 3, 20);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0x88ccff, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Lunar Ground Grid
    const groundGeo = new THREE.CircleGeometry(6, 32);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x071126,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Outer concentric lunar landing rings
    const ringGeo = new THREE.RingGeometry(5.8, 6.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);

    // Habitat Dome Group
    const domeGroup = new THREE.Group();
    scene.add(domeGroup);

    // Biosphere Geodesic Outer Wireframe
    const domeGeo = new THREE.SphereGeometry(2.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeWireMat = new THREE.MeshBasicMaterial({
      color: domeLightColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const domeWire = new THREE.Mesh(domeGeo, domeWireMat);
    domeGroup.add(domeWire);

    // Biosphere Inner Translucent Shield
    const innerDomeMat = new THREE.MeshPhysicalMaterial({
      color: 0x051b33,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.2,
    });
    const domeInner = new THREE.Mesh(domeGeo, innerDomeMat);
    domeGroup.add(domeInner);

    // Core Habitat Spire
    const spireGeo = new THREE.CylinderGeometry(0.08, 0.2, 3, 16);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = 1.5;
    domeGroup.add(spire);

    // Floating Sensor Dust Particles
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.8 + Math.random() * 2.2;
      const y = Math.random() * 3.5;
      particlePos[i] = Math.cos(angle) * radius;
      particlePos[i + 1] = y;
      particlePos[i + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Orbit Ring
    const orbitCurve = new THREE.EllipseCurve(0, 0, 4.2, 4.2, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(64);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.position.y = 1.2;
    orbitLine.rotation.x = 0.3;
    scene.add(orbitLine);

    // Orbiting Satellite Beacon
    const satGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const satMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const sat = new THREE.Mesh(satGeo, satMat);
    scene.add(sat);

    // Mouse interactive tilt
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
    const animate = () => {
      time += 0.015;

      // Rotate dome wire slightly
      domeWire.rotation.y = time * 0.15;
      particles.rotation.y = time * 0.08;

      // Move satellite along orbit
      const satAngle = time * 0.8;
      sat.position.x = Math.cos(satAngle) * 4.2;
      sat.position.z = Math.sin(satAngle) * 4.2 * Math.cos(0.3);
      sat.position.y = 1.2 + Math.sin(satAngle) * 4.2 * Math.sin(0.3);

      // Camera smooth tilt toward mouse
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (5 - mouseY * 1.5 - camera.position.y) * 0.05;
      camera.lookAt(0, 1.2, 0);

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
  }, [status]);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden lunar-glass border border-cyan-500/20 group">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Mission Control HUD Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            PRIMARY BIOSPHERE DOME
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">{zoneName}</h2>
        <p className="text-xs text-slate-400 font-mono">SECTOR: 01-ALPHA • LAT: 0.674°N • LON: 23.472°E</p>
      </div>

      <div className="absolute top-4 right-4 pointer-events-none z-10 text-right">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border border-cyan-500/30 bg-space-900/80 text-cyan-300">
          <span className={`w-2 h-2 rounded-full ${status === 'CRITICAL' ? 'bg-red-500 animate-pulse' : status === 'WARNING' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          STATUS: {status}
        </div>
        <div className="mt-2 text-xs font-mono text-slate-300">
          <div>PRES: <span className="text-cyan-400 font-semibold">{pressure.toFixed(1)} kPa</span></div>
          <div>CO₂: <span className={co2Level > 950 ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>{co2Level.toFixed(0)} PPM</span></div>
        </div>
      </div>

      <div className="absolute bottom-3 left-4 right-4 pointer-events-none z-10 flex justify-between items-center text-[11px] font-mono text-slate-400 border-t border-cyan-500/10 pt-2">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          REAL-TIME TELEMETRY SHIELD ACTIVE
        </span>
        <span>INTERACTIVE 3D • DRAG TO ROTATE VIEW</span>
      </div>
    </div>
  );
};
