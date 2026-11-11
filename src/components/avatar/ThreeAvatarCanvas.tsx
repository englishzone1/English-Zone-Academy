import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { DetailedAvatarConfig } from '../../types/avatar3d';

interface ThreeAvatarCanvasProps {
  config: DetailedAvatarConfig;
  cameraView?: 'face' | 'upper' | 'full';
  angleView?: 'front' | 'three-quarter' | 'side';
  onCameraViewChange?: (view: 'face' | 'upper' | 'full') => void;
  className?: string;
  isInteractive?: boolean;
}

export const ThreeAvatarCanvas: React.FC<ThreeAvatarCanvasProps> = ({
  config,
  cameraView = 'upper',
  angleView = 'front',
  onCameraViewChange,
  className = '',
  isInteractive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);

  // Target camera state for smooth transitions
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.4, 1.8));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.25, 0));

  const [activeCam, setActiveCam] = useState<'face' | 'upper' | 'full'>(cameraView);

  // Camera presets coordinates based on model scale
  const getCameraTarget = useCallback((preset: 'face' | 'upper' | 'full') => {
    switch (preset) {
      case 'face':
        return {
          pos: new THREE.Vector3(0, 1.55, 0.72),
          lookAt: new THREE.Vector3(0, 1.5, 0)
        };
      case 'upper':
        return {
          pos: new THREE.Vector3(0, 1.35, 1.55),
          lookAt: new THREE.Vector3(0, 1.2, 0)
        };
      case 'full':
      default:
        return {
          pos: new THREE.Vector3(0, 0.95, 2.5),
          lookAt: new THREE.Vector3(0, 0.85, 0)
        };
    }
  }, []);

  const switchCameraView = (view: 'face' | 'upper' | 'full') => {
    setActiveCam(view);
    if (onCameraViewChange) {
      onCameraViewChange(view);
    }
    const { pos, lookAt } = getCameraTarget(view);
    targetCamPosRef.current.copy(pos);
    targetLookAtRef.current.copy(lookAt);
    if (controlsRef.current) {
      controlsRef.current.target.copy(lookAt);
    }
  };

  // Determine GLB asset path based on gender and outfit style
  const getModelPath = (gender: string, clothingType: string) => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    if (gender === 'female') {
      if (clothingType === 'modest-blouse' || clothingType === 'royal-abaya' || clothingType === 'academic-robe') {
        return `${cleanBase}models/female_business.glb`;
      }
      return `${cleanBase}models/female_casual.glb`;
    } else {
      if (clothingType === 'tailored-blazer' || clothingType === 'academic-robe') {
        return `${cleanBase}models/male_business.glb`;
      }
      return `${cleanBase}models/male_casual.glb`;
    }
  };

  // Build / Load character into scene
  const loadCharacterModel = useCallback((scene: THREE.Scene, cfg: DetailedAvatarConfig) => {
    setIsLoadingModel(true);

    // Clean up existing character group
    if (characterGroupRef.current) {
      scene.remove(characterGroupRef.current);
      characterGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      });
    }

    const group = new THREE.Group();
    group.name = 'AvatarRoot';
    characterGroupRef.current = group;
    scene.add(group);

    const modelUrl = getModelPath(cfg.gender, cfg.clothingType);

    MeshoptDecoder.ready.then(() => {
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      loader.load(
        modelUrl,
        (gltf) => {
          const rootModel = gltf.scene;

        // Auto-fit & normalize model height to ~1.75m
        const box = new THREE.Box3().setFromObject(rootModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const targetHeight = 1.72;
        const scaleFactor = targetHeight / (size.y || 1.72);
        rootModel.scale.setScalar(scaleFactor);

        // Center bottom of model on the floor at y=0
        rootModel.position.x = -center.x * scaleFactor;
        rootModel.position.y = -box.min.y * scaleFactor;
        rootModel.position.z = -center.z * scaleFactor;

        // Enable shadows and customize materials
        const skinColor = new THREE.Color(cfg.skinTone);
        const clothColor = new THREE.Color(cfg.clothingColor);
        const hijabColor = new THREE.Color(cfg.hijabColor);

        rootModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Clone materials to prevent shared mutations
            if (child.material) {
              const mat = (child.material = child.material.clone());
              if ('roughness' in mat) {
                mat.roughness = 0.65;
              }

              // Color customization based on mesh or material naming
              const matName = (mat.name || '').toLowerCase();
              const meshName = (child.name || '').toLowerCase();

              // If mesh is hair and character is wearing hijab, hide hair to prevent clipping
              if (cfg.hasHijab && cfg.gender === 'female') {
                if (meshName.includes('hair') || matName.includes('hair')) {
                  child.visible = false;
                }
              }

              // Apply skin tone to body / skin meshes
              if (matName.includes('body') || matName.includes('skin') || meshName.includes('body') || meshName.includes('skin')) {
                if ('color' in mat) {
                  mat.color.copy(skinColor);
                }
              }

              // Apply clothing tint to clothing meshes
              if (matName.includes('cloth') || matName.includes('shirt') || matName.includes('suit') || matName.includes('busi') || matName.includes('casual')) {
                if ('color' in mat) {
                  mat.color.lerp(clothColor, 0.45);
                }
              }
            }
          }
        });

        group.add(rootModel);

        // If female and hijab is enabled, attach fitted 3D fabric hijab with smooth cloth drape
        if (cfg.hasHijab && cfg.gender === 'female') {
          const hijabGroup = new THREE.Group();
          hijabGroup.position.set(0, 1.5, 0);

          const hijabMat = new THREE.MeshStandardMaterial({
            color: hijabColor,
            roughness: 0.52,
            metalness: 0.12
          });

          // Head wrap envelope
          const wrapGeo = new THREE.SphereGeometry(0.145, 32, 24);
          wrapGeo.scale(0.92, 1.15, 1.05);
          const wrapMesh = new THREE.Mesh(wrapGeo, hijabMat);
          wrapMesh.position.set(0, 0.02, -0.015);
          wrapMesh.castShadow = true;
          hijabGroup.add(wrapMesh);

          // Shoulder & chest cloth drape with natural folds
          const drapeGeo = new THREE.CylinderGeometry(0.13, 0.28, 0.32, 32, 1, true);
          const drapeMesh = new THREE.Mesh(drapeGeo, hijabMat);
          drapeMesh.position.set(0, -0.16, 0);
          drapeMesh.castShadow = true;
          hijabGroup.add(drapeMesh);

          // Gold brooch pin
          const pinGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.005, 16);
          pinGeo.rotateX(Math.PI / 2);
          const pinMat = new THREE.MeshStandardMaterial({
            color: 0xD4AF37,
            roughness: 0.25,
            metalness: 0.85
          });
          const pinMesh = new THREE.Mesh(pinGeo, pinMat);
          pinMesh.position.set(0.05, -0.08, 0.13);
          hijabGroup.add(pinMesh);

          group.add(hijabGroup);
        }

        // Attach 3D Glasses accessory if active
        if (cfg.accessories && cfg.accessories.includes('glasses')) {
          const glassesGroup = new THREE.Group();
          glassesGroup.position.set(0, 1.53, 0.12);

          const goldMat = new THREE.MeshStandardMaterial({
            color: 0xD4AF37,
            roughness: 0.2,
            metalness: 0.85
          });

          const frameGeo = new THREE.TorusGeometry(0.028, 0.003, 12, 24);
          const frameL = new THREE.Mesh(frameGeo, goldMat);
          frameL.position.x = -0.046;

          const frameR = new THREE.Mesh(frameGeo, goldMat);
          frameR.position.x = 0.046;

          const bridgeGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.038, 8);
          bridgeGeo.rotateZ(Math.PI / 2);
          const bridge = new THREE.Mesh(bridgeGeo, goldMat);

          glassesGroup.add(frameL, frameR, bridge);
          group.add(glassesGroup);
        }

        setIsLoadingModel(false);
      },
      undefined,
      (error) => {
        console.error('Error loading 3D character GLB:', error);
        setIsLoadingModel(false);
      }
    );
  }).catch((err) => {
    console.error('Error initializing MeshoptDecoder:', err);
    setIsLoadingModel(false);
  });
}, []);

  // Three.js Lifecycle Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#FAF8F5'); // English Zone crisp luxury warm background

    // 2. Camera
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    cameraRef.current = camera;

    const { pos, lookAt } = getCameraTarget(activeCam);
    camera.position.copy(pos);
    camera.lookAt(lookAt);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.6;
    controls.maxDistance = 4.2;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.maxPolarAngle = Math.PI * 0.58;
    controls.target.copy(lookAt);
    controls.enabled = isInteractive;

    // 5. Studio Portrait Lighting Setup
    // Soft ambient / hemisphere
    const hemiLight = new THREE.HemisphereLight(0xfff8ee, 0x0A192F, 0.85);
    scene.add(hemiLight);

    // Key directional light with soft studio shadow
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
    keyLight.position.set(2.4, 4.0, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Rim / Backlight for separation (Champagne gold)
    const rimLight = new THREE.DirectionalLight(0xD4AF37, 1.0);
    rimLight.position.set(-2.0, 2.8, -2.4);
    scene.add(rimLight);

    // Soft front fill
    const fillLight = new THREE.PointLight(0xffffff, 0.45, 8);
    fillLight.position.set(0, 1.4, 2.2);
    scene.add(fillLight);

    // Pedestal floor & gold trim ring
    const groundGeo = new THREE.CylinderGeometry(0.85, 0.9, 0.04, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      roughness: 0.35,
      metalness: 0.4
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.02;
    ground.receiveShadow = true;

    const ringGeo = new THREE.TorusGeometry(0.85, 0.015, 16, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      roughness: 0.2,
      metalness: 0.85
    });
    const goldRing = new THREE.Mesh(ringGeo, ringMat);
    goldRing.position.y = 0.001;
    scene.add(ground, goldRing);

    // 6. Initial model load
    loadCharacterModel(scene, config);

    // 7. Render Loop with smooth camera easing
    let isMounted = true;
    const animate = () => {
      if (!isMounted) return;
      reqIdRef.current = requestAnimationFrame(animate);

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPosRef.current, 0.06);
        controlsRef.current.target.lerp(targetLookAtRef.current, 0.06);
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;
      if (newWidth > 0 && newHeight > 0 && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    return () => {
      isMounted = false;
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
      }
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [loadCharacterModel, getCameraTarget, isInteractive]);

  // Reload character model when gender, outfit, or hijab toggle changes
  useEffect(() => {
    if (sceneRef.current) {
      loadCharacterModel(sceneRef.current, config);
    }
  }, [
    config.gender,
    config.clothingType,
    config.clothingColor,
    config.hasHijab,
    config.hijabStyle,
    config.hijabColor,
    config.skinTone,
    config.accessories,
    loadCharacterModel
  ]);

  // Rotation controls
  const rotateCharacter = (deltaAngle: number) => {
    if (characterGroupRef.current) {
      characterGroupRef.current.rotation.y += deltaAngle;
    }
  };

  const setAngle = (angleRad: number) => {
    if (characterGroupRef.current) {
      characterGroupRef.current.rotation.y = angleRad;
    }
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[440px] sm:min-h-[520px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
      />

      {/* Loading Indicator */}
      {isLoadingModel && (
        <div className="absolute inset-0 bg-[#FAF8F5]/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 rounded-3xl">
          <div className="w-10 h-10 border-3 border-[#0A192F] border-t-[#D4AF37] rounded-full animate-spin mb-2" />
          <span className="text-xs font-serif-luxury font-bold text-[#0A192F]">
            Loading 3D Character Model...
          </span>
        </div>
      )}

      {/* Floating 3D Control Bar (Camera View & Angle Presets) */}
      {isInteractive && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none z-20">
          {/* Zoom Framing */}
          <div className="flex items-center gap-1 bg-[#0A192F]/85 backdrop-blur-md p-1.5 rounded-2xl border border-[#D4AF37]/40 shadow-xl pointer-events-auto">
            <button
              type="button"
              onClick={() => switchCameraView('face')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCam === 'face'
                  ? 'bg-[#D4AF37] text-[#0A192F] shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Face
            </button>
            <button
              type="button"
              onClick={() => switchCameraView('upper')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCam === 'upper'
                  ? 'bg-[#D4AF37] text-[#0A192F] shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Upper Body
            </button>
            <button
              type="button"
              onClick={() => switchCameraView('full')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCam === 'full'
                  ? 'bg-[#D4AF37] text-[#0A192F] shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Full Body
            </button>
          </div>

          {/* Angle Presets & Quick Step Rotation */}
          <div className="flex items-center gap-1.5 bg-[#0A192F]/85 backdrop-blur-md p-1.5 rounded-2xl border border-[#D4AF37]/40 shadow-xl pointer-events-auto">
            <button
              type="button"
              onClick={() => setAngle(0)}
              title="Front View"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => setAngle(Math.PI / 4)}
              title="Three-Quarter View"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#F3E5AB] hover:bg-white/10 active:scale-95 transition-all"
            >
              3/4 View
            </button>
            <button
              type="button"
              onClick={() => setAngle(Math.PI / 2)}
              title="Side View"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              Side
            </button>
            <button
              type="button"
              onClick={() => rotateCharacter(Math.PI / 8)}
              title="Rotate +22.5°"
              className="p-1.5 rounded-xl text-[#F3E5AB] hover:bg-white/10 active:scale-95 transition-all text-xs font-mono font-bold"
            >
              ↻
            </button>
          </div>
        </div>
      )}

      {/* 3D Engine Badge */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-[#0A192F]/80 backdrop-blur-md rounded-full border border-[#D4AF37]/30 text-[10px] font-bold text-[#F3E5AB] pointer-events-none flex items-center gap-1.5 z-20">
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        MIT Rigged GLB Engine
      </div>
    </div>
  );
};
