import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { PropertyItem } from '../types/property';
import { Rotate3d, Play, Pause } from 'lucide-react';

interface ThreeDVillaViewerProps {
  currentProperty: PropertyItem;
}

export const ThreeDVillaViewer: React.FC<ThreeDVillaViewerProps> = ({ currentProperty }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [activeCameraView, setActiveCameraView] = useState<'isometric' | 'cantilever' | 'elevation'>('isometric');

  const controlsRef = useRef<{
    setCameraPreset: (preset: 'isometric' | 'cantilever' | 'elevation') => void;
    toggleAutoRotate: () => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(18, 14, 18);
    camera.lookAt(0, 2, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff0dd, 2.6);
    sunLight.position.set(20, 28, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Soft sky fill
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.8);
    scene.add(hemiLight);

    // Interior Warm Glow
    const interiorLight1 = new THREE.PointLight(0xffaa44, 3, 14);
    interiorLight1.position.set(0, 2.2, 0);
    scene.add(interiorLight1);

    const interiorLight2 = new THREE.PointLight(0xffbb66, 2.5, 12);
    interiorLight2.position.set(-2, 5.5, 1);
    scene.add(interiorLight2);

    // 4. Materials
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xd8d3ca,
      roughness: 0.75,
      metalness: 0.05,
    });

    const darkBasaltMat = new THREE.MeshStandardMaterial({
      color: 0x222428,
      roughness: 0.6,
      metalness: 0.2,
    });

    const woodDeckMat = new THREE.MeshStandardMaterial({
      color: 0x9a6944,
      roughness: 0.65,
      metalness: 0.05,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x99ccdd,
      transparent: true,
      opacity: 0.38,
      roughness: 0.1,
      metalness: 0.85,
    });

    const poolWaterMat = new THREE.MeshStandardMaterial({
      color: 0x1aa0b8,
      roughness: 0.15,
      metalness: 0.7,
      transparent: true,
      opacity: 0.88,
    });

    const waterBaseMat = new THREE.MeshStandardMaterial({
      color: 0x005577,
      roughness: 0.5,
    });

    // 5. Villa Construction Group
    const villaGroup = new THREE.Group();
    scene.add(villaGroup);

    // --- A. Ground Plinth & Landscape ---
    // Base platform
    const basePlinthGeo = new THREE.BoxGeometry(22, 0.6, 18);
    const basePlinth = new THREE.Mesh(basePlinthGeo, concreteMat);
    basePlinth.position.y = -0.3;
    basePlinth.receiveShadow = true;
    villaGroup.add(basePlinth);

    // Infinity Pool Basin (Sunken)
    const poolBorderGeo = new THREE.BoxGeometry(9.4, 0.2, 5.4);
    const poolBorder = new THREE.Mesh(poolBorderGeo, darkBasaltMat);
    poolBorder.position.set(5.5, 0.02, 3.5);
    poolBorder.receiveShadow = true;
    villaGroup.add(poolBorder);

    const poolWaterGeo = new THREE.BoxGeometry(9, 0.1, 5);
    const poolWater = new THREE.Mesh(poolWaterGeo, poolWaterMat);
    poolWater.position.set(5.5, 0.08, 3.5);
    villaGroup.add(poolWater);

    // Pool Floor
    const poolFloorGeo = new THREE.PlaneGeometry(9, 5);
    const poolFloor = new THREE.Mesh(poolFloorGeo, waterBaseMat);
    poolFloor.rotation.x = -Math.PI / 2;
    poolFloor.position.set(5.5, 0.01, 3.5);
    villaGroup.add(poolFloor);

    // Teak Sun Deck beside pool
    const deckGeo = new THREE.BoxGeometry(9.4, 0.15, 3.2);
    const deck = new THREE.Mesh(deckGeo, woodDeckMat);
    deck.position.set(5.5, 0.08, -1.2);
    deck.receiveShadow = true;
    villaGroup.add(deck);

    // Minimalist Sun Loungers (2 loungers)
    for (let i = 0; i < 2; i++) {
      const loungerGeo = new THREE.BoxGeometry(2.2, 0.2, 0.9);
      const lounger = new THREE.Mesh(loungerGeo, concreteMat);
      lounger.position.set(3.5 + i * 3.5, 0.22, -1.2);
      lounger.castShadow = true;
      lounger.receiveShadow = true;
      villaGroup.add(lounger);
    }

    // --- B. Ground Floor Residence ---
    // Main structural core wall (Basalt)
    const coreWallGeo = new THREE.BoxGeometry(0.5, 3.8, 8);
    const coreWall = new THREE.Mesh(coreWallGeo, darkBasaltMat);
    coreWall.position.set(-4.5, 1.9, 0);
    coreWall.castShadow = true;
    coreWall.receiveShadow = true;
    villaGroup.add(coreWall);

    // Rear concrete wall
    const rearWallGeo = new THREE.BoxGeometry(9, 3.8, 0.5);
    const rearWall = new THREE.Mesh(rearWallGeo, concreteMat);
    rearWall.position.set(-0.5, 1.9, -4.5);
    rearWall.castShadow = true;
    rearWall.receiveShadow = true;
    villaGroup.add(rearWall);

    // Ground Floor Ceiling / Intermediate Slab
    const midSlabGeo = new THREE.BoxGeometry(11, 0.4, 9.5);
    const midSlab = new THREE.Mesh(midSlabGeo, concreteMat);
    midSlab.position.set(-0.5, 3.8, 0);
    midSlab.castShadow = true;
    midSlab.receiveShadow = true;
    villaGroup.add(midSlab);

    // Ground Floor Large Glass Walls
    const groundGlassFrontGeo = new THREE.BoxGeometry(8, 3.6, 0.1);
    const groundGlassFront = new THREE.Mesh(groundGlassFrontGeo, glassMat);
    groundGlassFront.position.set(0, 1.9, 4.2);
    villaGroup.add(groundGlassFront);

    const groundGlassSideGeo = new THREE.BoxGeometry(0.1, 3.6, 8.2);
    const groundGlassSide = new THREE.Mesh(groundGlassSideGeo, glassMat);
    groundGlassSide.position.set(4, 1.9, 0);
    villaGroup.add(groundGlassSide);

    // Slim Architectural Columns (Blackened Steel)
    const colPositions = [
      [3.8, 1.9, 4],
      [3.8, 1.9, -4],
      [-0.5, 1.9, 4],
    ];
    colPositions.forEach(([x, y, z]) => {
      const colGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.6, 16);
      const col = new THREE.Mesh(colGeo, darkBasaltMat);
      col.position.set(x, y, z);
      col.castShadow = true;
      villaGroup.add(col);
    });

    // --- C. Dramatic Cantilevered Upper Floor ---
    // The iconic hovering box extending dramatically toward the pool (+X direction)
    const cantileverBoxGeo = new THREE.BoxGeometry(10.5, 3.4, 6.5);
    const cantileverBox = new THREE.Mesh(cantileverBoxGeo, concreteMat);
    // Overhangs significantly past the ground floor: center at x = 1.5
    cantileverBox.position.set(1.5, 5.7, 0.5);
    cantileverBox.castShadow = true;
    cantileverBox.receiveShadow = true;
    villaGroup.add(cantileverBox);

    // Deep Panoramic Window Ribbon on the Cantilever Face (Looking over pool)
    const windowRibbonGeo = new THREE.BoxGeometry(0.15, 2.2, 5.8);
    const windowRibbon = new THREE.Mesh(windowRibbonGeo, glassMat);
    windowRibbon.position.set(6.78, 5.7, 0.5);
    villaGroup.add(windowRibbon);

    // Dark mullion border around the ribbon
    const ribbonFrameGeo = new THREE.BoxGeometry(0.2, 2.4, 6);
    const ribbonFrame = new THREE.Mesh(ribbonFrameGeo, darkBasaltMat);
    ribbonFrame.position.set(6.75, 5.7, 0.5);
    villaGroup.add(ribbonFrame);

    // Architectural Wood Screening Louvers on the South Face of Cantilever
    const louverGroup = new THREE.Group();
    for (let l = 0; l < 8; l++) {
      const louverGeo = new THREE.BoxGeometry(0.08, 2.2, 0.35);
      const louver = new THREE.Mesh(louverGeo, woodDeckMat);
      louver.position.set(6.79, 5.7, -1.8 + l * 0.5);
      louver.rotation.y = 0.4;
      louver.castShadow = true;
      louverGroup.add(louver);
    }
    villaGroup.add(louverGroup);

    // Upper Balcony Glass Railing
    const railingGeo = new THREE.BoxGeometry(4.5, 1.1, 0.08);
    const railing = new THREE.Mesh(railingGeo, glassMat);
    railing.position.set(-3.5, 4.45, 4.2);
    villaGroup.add(railing);

    // --- D. Architectural Landscaping (Trees & Zen Basin) ---
    // Minimalist Cypress / Columnar Tree
    const treeTrunkGeo = new THREE.CylinderGeometry(0.1, 0.14, 4.5, 8);
    const treeTrunk = new THREE.Mesh(treeTrunkGeo, woodDeckMat);
    treeTrunk.position.set(-7, 2.25, 4.5);
    treeTrunk.castShadow = true;
    villaGroup.add(treeTrunk);

    const foliageGeo = new THREE.ConeGeometry(1.3, 5, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e4232, roughness: 0.8 });
    const foliageMesh = new THREE.Mesh(foliageGeo, foliageMat);
    foliageMesh.position.set(-7, 5, 4.5);
    foliageMesh.castShadow = true;
    villaGroup.add(foliageMesh);

    // Architectural Planter Box
    const planterGeo = new THREE.BoxGeometry(3, 0.8, 3);
    const planter = new THREE.Mesh(planterGeo, darkBasaltMat);
    planter.position.set(-7, 0.4, 4.5);
    planter.receiveShadow = true;
    villaGroup.add(planter);

    // 6. Interaction: Orbit Drag & Zoom
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = { radius: 26, theta: 0.75, phi: 1.05 };

    const updateCameraFromSpherical = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.lookAt(0.5, 2.8, 0);
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
      spherical.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.007));

      updateCameraFromSpherical();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      // Zoom
      e.preventDefault();
      spherical.radius = Math.max(12, Math.min(42, spherical.radius + e.deltaY * 0.02));
      updateCameraFromSpherical();
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Presets
    const setCameraPreset = (preset: 'isometric' | 'cantilever' | 'elevation') => {
      setActiveCameraView(preset);
      if (preset === 'isometric') {
        spherical = { radius: 26, theta: 0.75, phi: 1.05 };
      } else if (preset === 'cantilever') {
        spherical = { radius: 20, theta: 0.3, phi: 1.25 };
      } else if (preset === 'elevation') {
        spherical = { radius: 24, theta: 1.57, phi: 1.4 };
      }
      updateCameraFromSpherical();
    };

    controlsRef.current = {
      setCameraPreset,
      toggleAutoRotate: () => setIsAutoRotate((prev) => !prev),
    };

    // 7. Animation Loop
    let animationFrameId: number;
    let autoSpeed = 0.0035;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Subtle water shimmer
      poolWater.position.y = 0.08 + Math.sin(Date.now() * 0.003) * 0.015;

      // Auto rotation
      if (isAutoRotate && !isDragging) {
        spherical.theta += autoSpeed;
        updateCameraFromSpherical();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isAutoRotate]);

  return (
    <div 
      className="relative w-full my-12 md:my-20 p-6 md:p-10 border-hairline transition-all duration-650 flex flex-col items-center select-none overflow-hidden shadow-2xl"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: currentProperty.borderTone,
      }}
    >
      {/* Header Info & View Controls */}
      <div 
        className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-hairline"
        style={{ borderColor: currentProperty.borderTone }}
      >
        <div className="flex items-center space-x-3">
          <Rotate3d className="w-5 h-5 opacity-70 animate-spin-slow" style={{ color: currentProperty.textTone }} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-mono tracking-super-wide uppercase opacity-60">
                INTERACTIVE 3D VILLA SIMULATION
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h3 className="text-base sm:text-lg font-editorial font-bold uppercase tracking-wider" style={{ color: currentProperty.textTone }}>
              THE CANTILEVER WATER PAVILION // 3D SPATIAL MODEL
            </h3>
          </div>
        </div>

        {/* View Camera Presets & Play/Pause */}
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
            onClick={() => setIsAutoRotate((prev) => !prev)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border-hairline opacity-75 hover:opacity-100 transition-all"
            style={{ borderColor: currentProperty.borderTone, color: currentProperty.textTone }}
          >
            {isAutoRotate ? (
              <>
                <Pause className="w-3 h-3" />
                <span>PAUSE ORBIT</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>RESUME ORBIT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-[420px] sm:h-[540px] md:h-[620px] cursor-grab active:cursor-grabbing relative"
      />

      {/* Footer Specs & Controls Prompt */}
      <div 
        className="w-full pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-[8px] sm:text-[9px] font-mono uppercase tracking-widest opacity-65 gap-2"
        style={{ borderColor: currentProperty.borderTone, color: currentProperty.subtleTone }}
      >
        <div className="flex items-center space-x-4">
          <span>DRAG TO ORBIT 360°</span>
          <span>•</span>
          <span>SCROLL TO ZOOM</span>
          <span>•</span>
          <span>POURED TERRACOTTA CONCRETE • INFINITY POOL • GLASS ATELIER</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>VOLUMETRIC FIDELITY: 1:1 ARCHITECTURAL</span>
        </div>
      </div>
    </div>
  );
};
