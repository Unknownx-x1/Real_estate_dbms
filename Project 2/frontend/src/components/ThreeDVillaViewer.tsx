import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { PropertyItem } from '../types/property';
import { Rotate3d, Play, Pause, Sun, Moon } from 'lucide-react';

interface ThreeDVillaViewerProps {
  currentProperty: PropertyItem;
}

/**
 * Helper to generate procedural architectural textures using HTML5 Canvas
 */
function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8a5937';
  ctx.fillRect(0, 0, 512, 512);

  // Planks
  const plankHeight = 32;
  for (let y = 0; y < 512; y += plankHeight) {
    const tone = 120 + Math.floor(Math.random() * 40);
    ctx.fillStyle = `rgb(${tone + 30}, ${tone - 10}, ${tone - 40})`;
    ctx.fillRect(0, y, 512, plankHeight - 2);

    // Fine wood grain lines
    ctx.strokeStyle = 'rgba(40, 20, 10, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const lineY = y + Math.random() * (plankHeight - 4);
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(512, lineY);
      ctx.stroke();
    }

    // Seam line
    ctx.fillStyle = 'rgba(20, 10, 5, 0.7)';
    ctx.fillRect(0, y + plankHeight - 2, 512, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createConcreteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c7c2b8';
  ctx.fillRect(0, 0, 512, 512);

  // Concrete noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 26;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Formwork board lines
  ctx.strokeStyle = 'rgba(70, 65, 60, 0.35)';
  ctx.lineWidth = 2;
  for (let y = 64; y < 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    // Formwork tie-rod holes
    ctx.fillStyle = 'rgba(40, 38, 35, 0.4)';
    for (let x = 48; x < 512; x += 96) {
      ctx.beginPath();
      ctx.arc(x, y - 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createPaverTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d6d1c7';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 64;
  ctx.strokeStyle = 'rgba(80, 75, 70, 0.4)';
  ctx.lineWidth = 2;

  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const shade = (Math.random() - 0.5) * 15;
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(shade) / 255})`;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Photorealistic 3D Modern Architectural Villa Simulation
 */
export const ThreeDVillaViewer: React.FC<ThreeDVillaViewerProps> = ({ currentProperty }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [activeCameraView, setActiveCameraView] = useState<'isometric' | 'cantilever' | 'elevation'>('isometric');

  const controlsRef = useRef<{
    setCameraPreset: (preset: 'isometric' | 'cantilever' | 'elevation') => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 120);
    camera.position.set(22, 16, 22);
    camera.lookAt(0, 2.5, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isNightMode ? 1.4 : 1.15;

    container.appendChild(renderer.domElement);

    // 3. Textures
    const concreteTex = createConcreteTexture();
    const woodTex = createWoodTexture();
    const paverTex = createPaverTileTexture();

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      isNightMode ? 0x223355 : 0xfffbf4,
      isNightMode ? 0.6 : 1.1
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      isNightMode ? 0x6688cc : 0xfff4e2,
      isNightMode ? 0.8 : 2.8
    );
    sunLight.position.set(24, 32, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Warm Interior & Exterior Landscape Sconces
    const interiorLights: THREE.PointLight[] = [];
    const lightPositions = [
      [0, 2.4, 1, 3.5, 14],     // Ground Living
      [-3, 2.4, -2, 2.5, 10],   // Ground Dining
      [2, 6.0, 1.5, 3.0, 12],   // Upper Master Cantilever
      [-3.5, 6.0, 0, 2.0, 10],  // Upper Studio
      [4.5, 0.4, 4.5, 2.0, 8],  // Underwater Pool Light 1
      [7.5, 0.4, 4.5, 2.0, 8],  // Underwater Pool Light 2
    ];

    lightPositions.forEach(([x, y, z, intensity, dist]) => {
      const isPool = y < 1;
      const color = isPool ? 0x00d8ff : 0xffa944;
      const pl = new THREE.PointLight(color, isNightMode ? intensity * 1.8 : intensity, dist);
      pl.position.set(x, y, z);
      scene.add(pl);
      interiorLights.push(pl);
    });

    // 5. High-End Architectural Materials
    const boardFormedConcreteMat = new THREE.MeshStandardMaterial({
      map: concreteTex,
      roughness: 0.8,
      metalness: 0.05,
    });

    const darkBasaltCladdingMat = new THREE.MeshStandardMaterial({
      color: 0x1f2226,
      roughness: 0.5,
      metalness: 0.25,
    });

    const warmWoodSlatMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.6,
      metalness: 0.05,
    });

    const paverFloorMat = new THREE.MeshStandardMaterial({
      map: paverTex,
      roughness: 0.7,
      metalness: 0.05,
    });

    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x3d5438,
      roughness: 0.9,
      metalness: 0.0,
    });

    const glassCurtainMat = new THREE.MeshPhysicalMaterial({
      color: 0xaaccdd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      metalness: 0.85,
      transmission: 0.6,
      ior: 1.52,
    });

    const poolWaterMat = new THREE.MeshStandardMaterial({
      color: 0x0ca6b9,
      roughness: 0.08,
      metalness: 0.8,
      transparent: true,
      opacity: 0.86,
    });

    const darkSteelMullionMat = new THREE.MeshStandardMaterial({
      color: 0x141618,
      roughness: 0.3,
      metalness: 0.8,
    });

    // 6. Assembly: Full Villa & Landscape Group
    const villaGroup = new THREE.Group();
    scene.add(villaGroup);

    // --- LANDSCAPE & PLINTH ---
    // 1. Surrounding Terrain (Warm Slate / Grass border)
    const terrainGeo = new THREE.BoxGeometry(32, 0.4, 28);
    const terrain = new THREE.Mesh(terrainGeo, lawnMat);
    terrain.position.y = -0.4;
    terrain.receiveShadow = true;
    villaGroup.add(terrain);

    // 2. Large Travertine Paver Terrace
    const paverPlatformGeo = new THREE.BoxGeometry(25, 0.4, 21);
    const paverPlatform = new THREE.Mesh(paverPlatformGeo, paverFloorMat);
    paverPlatform.position.y = -0.15;
    paverPlatform.receiveShadow = true;
    villaGroup.add(paverPlatform);

    // 3. Sunken Infinity Pool with Coping
    const poolWidth = 11;
    const poolDepth = 5.6;
    const poolCopingGeo = new THREE.BoxGeometry(poolWidth + 0.8, 0.2, poolDepth + 0.8);
    const poolCoping = new THREE.Mesh(poolCopingGeo, darkBasaltCladdingMat);
    poolCoping.position.set(6, 0.05, 4.2);
    poolCoping.receiveShadow = true;
    villaGroup.add(poolCoping);

    const poolWaterGeo = new THREE.BoxGeometry(poolWidth, 0.15, poolDepth);
    const poolWater = new THREE.Mesh(poolWaterGeo, poolWaterMat);
    poolWater.position.set(6, 0.1, 4.2);
    villaGroup.add(poolWater);

    // Sunken Pool Basin
    const poolBasinGeo = new THREE.BoxGeometry(poolWidth - 0.2, 0.05, poolDepth - 0.2);
    const poolBasinMat = new THREE.MeshStandardMaterial({ color: 0x004455, roughness: 0.3 });
    const poolBasin = new THREE.Mesh(poolBasinGeo, poolBasinMat);
    poolBasin.position.set(6, 0.01, 4.2);
    villaGroup.add(poolBasin);

    // 4. Teak Hardwood Sun Deck
    const sunDeckGeo = new THREE.BoxGeometry(poolWidth + 0.8, 0.12, 3.6);
    const sunDeck = new THREE.Mesh(sunDeckGeo, warmWoodSlatMat);
    sunDeck.position.set(6, 0.12, -0.8);
    sunDeck.receiveShadow = true;
    villaGroup.add(sunDeck);

    // Modern Sun Loungers with Fabric cushions
    for (let i = 0; i < 3; i++) {
      const loungerFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.15, 0.85),
        darkSteelMullionMat
      );
      loungerFrame.position.set(3.2 + i * 2.8, 0.25, -0.8);
      loungerFrame.castShadow = true;
      villaGroup.add(loungerFrame);

      const cushion = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.1, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.8 })
      );
      cushion.position.set(3.2 + i * 2.8, 0.36, -0.8);
      cushion.castShadow = true;
      villaGroup.add(cushion);
    }

    // --- GROUND FLOOR RESIDENCE ---
    // Concrete Feature Wall (Backdrop)
    const backWallGeo = new THREE.BoxGeometry(11, 4.2, 0.6);
    const backWall = new THREE.Mesh(backWallGeo, boardFormedConcreteMat);
    backWall.position.set(-1.5, 2.1, -4.8);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    villaGroup.add(backWall);

    // Stone Core Service Block (Basalt)
    const serviceCoreGeo = new THREE.BoxGeometry(4.2, 4.2, 5.2);
    const serviceCore = new THREE.Mesh(serviceCoreGeo, darkBasaltCladdingMat);
    serviceCore.position.set(-5, 2.1, -0.5);
    serviceCore.castShadow = true;
    serviceCore.receiveShadow = true;
    villaGroup.add(serviceCore);

    // Intermediate Concrete Ceiling Slab
    const interSlabGeo = new THREE.BoxGeometry(13.5, 0.45, 11);
    const interSlab = new THREE.Mesh(interSlabGeo, boardFormedConcreteMat);
    interSlab.position.set(-1, 4.25, 0.5);
    interSlab.castShadow = true;
    interSlab.receiveShadow = true;
    villaGroup.add(interSlab);

    // Floor-to-Ceiling Glass Walls with Black Steel Frames
    const glassFrontGeo = new THREE.BoxGeometry(8.5, 3.9, 0.08);
    const glassFront = new THREE.Mesh(glassFrontGeo, glassCurtainMat);
    glassFront.position.set(0.8, 2.1, 4.8);
    villaGroup.add(glassFront);

    const glassSideGeo = new THREE.BoxGeometry(0.08, 3.9, 9.5);
    const glassSide = new THREE.Mesh(glassSideGeo, glassCurtainMat);
    glassSide.position.set(4.8, 2.1, 0.2);
    villaGroup.add(glassSide);

    // Black Steel Mullions & Columns
    const mullionPositions = [
      [-1.8, 2.1, 4.82],
      [1.0, 2.1, 4.82],
      [3.8, 2.1, 4.82],
      [4.82, 2.1, -2.5],
      [4.82, 2.1, 1.8],
    ];
    mullionPositions.forEach(([x, y, z]) => {
      const mul = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.9, 0.12), darkSteelMullionMat);
      mul.position.set(x, y, z);
      mul.castShadow = true;
      villaGroup.add(mul);
    });

    // --- DRAMATIC CANTILEVER UPPER FLOOR ---
    // The Master Cantilever Volume extending toward +X
    const cantileverWidth = 11.5;
    const cantileverHeight = 3.6;
    const cantileverDepth = 6.8;

    // Wood-slat cantilevered box
    const cantileverBox = new THREE.Mesh(
      new THREE.BoxGeometry(cantileverWidth, cantileverHeight, cantileverDepth),
      warmWoodSlatMat
    );
    cantileverBox.position.set(2.2, 6.2, 1.2);
    cantileverBox.castShadow = true;
    cantileverBox.receiveShadow = true;
    villaGroup.add(cantileverBox);

    // Concrete Overhang Fascia Frame
    const cantileverFrame = new THREE.Mesh(
      new THREE.BoxGeometry(cantileverWidth + 0.4, 0.2, cantileverDepth + 0.4),
      boardFormedConcreteMat
    );
    cantileverFrame.position.set(2.2, 8.05, 1.2);
    cantileverFrame.castShadow = true;
    villaGroup.add(cantileverFrame);

    // Deep Panoramic Ribbon Window on the Cantilever End (Facing Pool)
    const ribbonWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.4, 5.6),
      glassCurtainMat
    );
    ribbonWin.position.set(8.0, 6.2, 1.2);
    villaGroup.add(ribbonWin);

    // Black framing for ribbon
    const ribbonFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.6, 5.8),
      darkSteelMullionMat
    );
    ribbonFrame.position.set(7.95, 6.2, 1.2);
    villaGroup.add(ribbonFrame);

    // Vertical Wood Sunscreen Louvers on Cantilever
    for (let s = 0; s < 10; s++) {
      const louver = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 2.4, 0.45),
        darkBasaltCladdingMat
      );
      louver.position.set(8.02, 6.2, -1.2 + s * 0.55);
      louver.rotation.y = 0.35;
      louver.castShadow = true;
      villaGroup.add(louver);
    }

    // Outdoor Cantilever Pergola (over the deck)
    const pergolaBeamCount = 7;
    for (let p = 0; p < pergolaBeamCount; p++) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.3, 4.2),
        darkSteelMullionMat
      );
      beam.position.set(1.5 + p * 0.9, 4.2, -2.8);
      beam.castShadow = true;
      villaGroup.add(beam);
    }

    // Upper Balcony with Glass Railing
    const balconyGlass = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.1, 0.05),
      glassCurtainMat
    );
    balconyGlass.position.set(-3.2, 4.95, 5.8);
    villaGroup.add(balconyGlass);

    const balconyHandrail = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.06, 0.1),
      darkSteelMullionMat
    );
    balconyHandrail.position.set(-3.2, 5.5, 5.8);
    villaGroup.add(balconyHandrail);

    // --- LANDSCAPING (Cypress Trees & Sculptural Planters) ---
    const addTree = (x: number, z: number, scale = 1) => {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 4.2 * scale, 8),
        darkBasaltCladdingMat
      );
      trunk.position.set(x, 2.1 * scale, z);
      trunk.castShadow = true;
      villaGroup.add(trunk);

      const foliage = new THREE.Mesh(
        new THREE.ConeGeometry(1.2 * scale, 5.2 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0x223826, roughness: 0.85 })
      );
      foliage.position.set(x, 4.8 * scale, z);
      foliage.castShadow = true;
      villaGroup.add(foliage);

      // Planter
      const planter = new THREE.Mesh(
        new THREE.BoxGeometry(2.4 * scale, 0.6 * scale, 2.4 * scale),
        darkBasaltCladdingMat
      );
      planter.position.set(x, 0.3 * scale, z);
      planter.receiveShadow = true;
      villaGroup.add(planter);
    };

    addTree(-9, 5.5, 1.1);
    addTree(-11, 2.0, 0.9);
    addTree(-7.5, -6.5, 1.0);

    // 7. Interactive Controls: Orbit & Zoom
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = { radius: 28, theta: 0.85, phi: 1.05 };

    const updateCameraFromSpherical = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.lookAt(0.5, 3.2, 0.5);
    };
    updateCameraFromSpherical();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.007;
      spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.08, spherical.phi - deltaY * 0.007));

      updateCameraFromSpherical();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(14, Math.min(48, spherical.radius + e.deltaY * 0.022));
      updateCameraFromSpherical();
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Camera Presets
    const setCameraPreset = (preset: 'isometric' | 'cantilever' | 'elevation') => {
      setActiveCameraView(preset);
      if (preset === 'isometric') {
        spherical = { radius: 28, theta: 0.85, phi: 1.05 };
      } else if (preset === 'cantilever') {
        spherical = { radius: 21, theta: 0.28, phi: 1.25 };
      } else if (preset === 'elevation') {
        spherical = { radius: 26, theta: 1.57, phi: 1.4 };
      }
      updateCameraFromSpherical();
    };

    controlsRef.current = { setCameraPreset };

    // 8. Animation Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Subtle water surface oscillation
      poolWater.position.y = 0.1 + Math.sin(Date.now() * 0.0025) * 0.012;

      // Auto-rotation
      if (isAutoRotate && !isDragging) {
        spherical.theta += 0.003;
        updateCameraFromSpherical();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handler
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
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      concreteTex.dispose();
      woodTex.dispose();
      paverTex.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isAutoRotate, isNightMode]);

  return (
    <div 
      className="relative w-full my-12 md:my-20 p-6 md:p-10 border-hairline transition-all duration-650 flex flex-col items-center select-none overflow-hidden shadow-2xl"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: currentProperty.borderTone,
      }}
    >
      {/* Header Bar */}
      <div 
        className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-hairline"
        style={{ borderColor: currentProperty.borderTone }}
      >
        <div className="flex items-center space-x-3">
          <Rotate3d className="w-5 h-5 opacity-75 animate-spin-slow" style={{ color: currentProperty.textTone }} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-mono tracking-super-wide uppercase opacity-60">
                HIGH-FIDELITY 3D VILLA SIMULATION
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h3 className="text-base sm:text-lg font-editorial font-bold uppercase tracking-wider" style={{ color: currentProperty.textTone }}>
              THE CANTILEVER RESIDENCE // REAL-TIME 3D ARCHITECTURAL SIMULATION
            </h3>
          </div>
        </div>

        {/* View Controls: Angles, Day/Night, Orbit */}
        <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono uppercase">
          <button
            onClick={() => controlsRef.current?.setCameraPreset('isometric')}
            className={`px-3 py-1.5 border-hairline transition-all ${
              activeCameraView === 'isometric' ? 'font-bold opacity-100' : 'opacity-50 hover:opacity-80'
            }`}
            style={{ borderColor: currentProperty.borderTone, color: currentProperty.textTone }}
          >
            [AERIAL ISOMETRIC]
          </button>
          <button
            onClick={() => controlsRef.current?.setCameraPreset('cantilever')}
            className={`px-3 py-1.5 border-hairline transition-all ${
              activeCameraView === 'cantilever' ? 'font-bold opacity-100' : 'opacity-50 hover:opacity-80'
            }`}
            style={{ borderColor: currentProperty.borderTone, color: currentProperty.textTone }}
          >
            [POOL CANTILEVER]
          </button>
          <button
            onClick={() => controlsRef.current?.setCameraPreset('elevation')}
            className={`px-3 py-1.5 border-hairline transition-all ${
              activeCameraView === 'elevation' ? 'font-bold opacity-100' : 'opacity-50 hover:opacity-80'
            }`}
            style={{ borderColor: currentProperty.borderTone, color: currentProperty.textTone }}
          >
            [FACADE ELEVATION]
          </button>
          <button
            onClick={() => setIsNightMode((prev) => !prev)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border-hairline opacity-75 hover:opacity-100 transition-all"
            style={{ borderColor: currentProperty.borderTone, color: currentProperty.textTone }}
          >
            {isNightMode ? (
              <>
                <Sun className="w-3 h-3 text-amber-300" />
                <span>DAYLIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3" />
                <span>DUSK ILLUMINATION</span>
              </>
            )}
          </button>
          <button
            onClick={() => setIsAutoRotate((prev) => !prev)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border-hairline opacity-75 hover:opacity-100 transition-all"
            style={{ borderColor: currentProperty.borderTone, color: currentProperty.textTone }}
          >
            {isAutoRotate ? (
              <>
                <Pause className="w-3 h-3" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>ORBIT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={mountRef} 
        className="w-full h-[440px] sm:h-[560px] md:h-[640px] cursor-grab active:cursor-grabbing relative"
      />

      {/* Footer Specs & Materials */}
      <div 
        className="w-full pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-[8px] sm:text-[9px] font-mono uppercase tracking-widest opacity-65 gap-2"
        style={{ borderColor: currentProperty.borderTone, color: currentProperty.subtleTone }}
      >
        <div className="flex items-center space-x-3">
          <span>DRAG TO ORBIT 360°</span>
          <span>•</span>
          <span>WHEEL TO ZOOM</span>
          <span>•</span>
          <span>BOARD-FORMED CONCRETE • WARM CEDAR BATTENS • BASALT CORE • POOL COPING</span>
        </div>
        <div>
          <span>RENDER ENGINE: THREE.JS WEBGL // SHADOWS PCF-SOFT</span>
        </div>
      </div>
    </div>
  );
};
