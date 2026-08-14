/**
 * ==========================================================================
 * TRANSPORTE NUEVA ROMA - 3D EXPERIENCE ENGINE ("El Scroll es la Ruta")
 * High-Performance Three.js Procedural Truck & Route Choreography
 * Mobile-First, 60fps Target, Zero Heavy Textures, Instant Loading
 * ==========================================================================
 */

(function () {
  'use strict';

  // Check WebGL availability
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // If WebGL fails, activate clean CSS fallback
  if (!isWebGLAvailable() || typeof THREE === 'undefined') {
    console.warn('[NR Experience] WebGL not supported or Three.js CDN blocked. Activating lightweight fallback.');
    const fallback = document.querySelector('.fallback-truck-container');
    if (fallback) fallback.style.display = 'block';
    return;
  }

  const canvas = document.getElementById('canvas3d');
  if (!canvas) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xF8FAFC, 0.022);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3.2, 11);

  const isMobile = window.innerWidth <= 768;
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance'
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.8));
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // ==========================================================================
  // LIGHTING SYSTEM (Sophisticated Daylight & Warm Golden Logistics Glow)
  // ==========================================================================
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
  sunLight.position.set(12, 18, 14);
  if (!isMobile) {
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
  }
  scene.add(sunLight);

  const warmBounceLight = new THREE.DirectionalLight(0xFDB933, 0.6);
  warmBounceLight.position.set(-10, -2, -8);
  scene.add(warmBounceLight);

  const celesteSkyFill = new THREE.HemisphereLight(0x00A2F4, 0xF8FAFC, 0.7);
  scene.add(celesteSkyFill);

  // ==========================================================================
  // MATERIALS PALETTE (Light Mode Crisp Corporate)
  // ==========================================================================
  const materials = {
    truckCabin: new THREE.MeshStandardMaterial({
      color: 0x1E40AF, // Corporate Blue
      roughness: 0.25,
      metalness: 0.35,
    }),
    truckTrailer: new THREE.MeshStandardMaterial({
      color: 0xFFFFFF, // Clean White Container
      roughness: 0.3,
      metalness: 0.1,
    }),
    orangeAccent: new THREE.MeshStandardMaterial({
      color: 0xF97316, // Brand Logistics Orange
      roughness: 0.3,
      metalness: 0.2,
    }),
    chassisDark: new THREE.MeshStandardMaterial({
      color: 0x1F2937,
      roughness: 0.7,
      metalness: 0.5,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      metalness: 0.9,
      roughness: 0.15,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x00A2F4,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      metalness: 0.8,
    }),
    rubber: new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.9,
      metalness: 0.1,
    }),
    headlightGlow: new THREE.MeshBasicMaterial({
      color: 0xFFFBEB,
    }),
    taillight: new THREE.MeshBasicMaterial({
      color: 0xEF4444,
    }),
    roadAsphalt: new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.9,
    }),
    roadStripe: new THREE.MeshBasicMaterial({
      color: 0xF97316,
    })
  };

  // ==========================================================================
  // PROCEDURAL 3D SEMI-TRUCK & TRAILER ASSEMBLY ("Transporte Nueva Roma")
  // ==========================================================================
  const truckGroup = new THREE.Group();
  const wheelsList = [];

  // Helper function: Wheel Generator
  function createWheel(x, y, z) {
    const wheelGroup = new THREE.Group();
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.24, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, materials.rubber);
    tire.castShadow = !isMobile;
    wheelGroup.add(tire);

    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.25, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, materials.chrome);
    wheelGroup.add(rim);

    wheelGroup.position.set(x, y, z);
    truckGroup.add(wheelGroup);
    wheelsList.push(wheelGroup);
    return wheelGroup;
  }

  // 1. Tractor Cabin
  const cabinGroup = new THREE.Group();

  // Lower Cabin
  const lowerCabinGeo = new THREE.BoxGeometry(1.5, 0.85, 1.8);
  const lowerCabin = new THREE.Mesh(lowerCabinGeo, materials.truckCabin);
  lowerCabin.position.set(0, 0.95, 2.2);
  lowerCabin.castShadow = !isMobile;
  cabinGroup.add(lowerCabin);

  // Upper Cabin (Aerodynamic Roof)
  const upperCabinGeo = new THREE.BoxGeometry(1.46, 1.0, 1.4);
  const upperCabin = new THREE.Mesh(upperCabinGeo, materials.truckCabin);
  upperCabin.position.set(0, 1.75, 2.0);
  upperCabin.castShadow = !isMobile;
  cabinGroup.add(upperCabin);

  // Windshield
  const windshieldGeo = new THREE.BoxGeometry(1.36, 0.55, 0.1);
  const windshield = new THREE.Mesh(windshieldGeo, materials.glass);
  windshield.position.set(0, 1.8, 2.72);
  windshield.rotation.x = -0.15;
  cabinGroup.add(windshield);

  // Front Grille & Chrome Bumper
  const grilleGeo = new THREE.BoxGeometry(1.1, 0.5, 0.08);
  const grille = new THREE.Mesh(grilleGeo, materials.chrome);
  grille.position.set(0, 0.9, 3.12);
  cabinGroup.add(grille);

  const bumperGeo = new THREE.BoxGeometry(1.55, 0.3, 0.2);
  const bumper = new THREE.Mesh(bumperGeo, materials.chassisDark);
  bumper.position.set(0, 0.52, 3.12);
  cabinGroup.add(bumper);

  // Headlights
  const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.05), materials.headlightGlow);
  headlightL.position.set(-0.55, 0.65, 3.22);
  cabinGroup.add(headlightL);

  const headlightR = headlightL.clone();
  headlightR.position.x = 0.55;
  cabinGroup.add(headlightR);

  // Orange Accent Stripe on Cabin
  const stripeGeo = new THREE.BoxGeometry(1.52, 0.08, 1.82);
  const cabinStripe = new THREE.Mesh(stripeGeo, materials.orangeAccent);
  cabinStripe.position.set(0, 1.38, 2.2);
  cabinGroup.add(cabinStripe);

  // Chrome Exhaust Pipes
  const exhaustL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.6, 12), materials.chrome);
  exhaustL.position.set(-0.7, 2.0, 1.2);
  cabinGroup.add(exhaustL);

  const exhaustR = exhaustL.clone();
  exhaustR.position.x = 0.7;
  cabinGroup.add(exhaustR);

  truckGroup.add(cabinGroup);

  // 2. Trailer Chassis & Cargo Container
  const trailerGroup = new THREE.Group();

  // Chassis Beam
  const chassisGeo = new THREE.BoxGeometry(1.4, 0.25, 6.2);
  const chassis = new THREE.Mesh(chassisGeo, materials.chassisDark);
  chassis.position.set(0, 0.72, -1.0);
  chassis.castShadow = !isMobile;
  trailerGroup.add(chassis);

  // Main Cargo Container (Clean White with Corporate Branding Ribs)
  const containerGeo = new THREE.BoxGeometry(1.55, 1.95, 5.8);
  const container = new THREE.Mesh(containerGeo, materials.truckTrailer);
  container.position.set(0, 1.82, -1.0);
  container.castShadow = !isMobile;
  trailerGroup.add(container);

  // Container Accent Roof Stripe (Orange)
  const topStripeGeo = new THREE.BoxGeometry(1.58, 0.08, 5.82);
  const containerTopStripe = new THREE.Mesh(topStripeGeo, materials.orangeAccent);
  containerTopStripe.position.set(0, 2.78, -1.0);
  trailerGroup.add(containerTopStripe);

  // Container Bottom Stripe (Blue)
  const botStripeGeo = new THREE.BoxGeometry(1.58, 0.1, 5.82);
  const containerBotStripe = new THREE.Mesh(botStripeGeo, materials.truckCabin);
  containerBotStripe.position.set(0, 0.88, -1.0);
  trailerGroup.add(containerBotStripe);

  // Container Brand Plate (NUEVA ROMA)
  const brandPlateGeo = new THREE.BoxGeometry(1.6, 0.45, 3.4);
  const brandPlate = new THREE.Mesh(brandPlateGeo, materials.orangeAccent);
  brandPlate.position.set(0, 1.82, -1.0);
  trailerGroup.add(brandPlate);

  // Rear Taillights
  const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.05), materials.taillight);
  tailL.position.set(-0.6, 0.68, -4.08);
  trailerGroup.add(tailL);

  const tailR = tailL.clone();
  tailR.position.x = 0.6;
  trailerGroup.add(tailR);

  truckGroup.add(trailerGroup);

  // 3. Wheels (Tractor + Multi-Axle Trailer)
  createWheel(-0.76, 0.38, 2.7); // Front Tractor Left
  createWheel(0.76, 0.38, 2.7);  // Front Tractor Right
  createWheel(-0.76, 0.38, 1.3); // Rear Tractor Left
  createWheel(0.76, 0.38, 1.3);  // Rear Tractor Right

  // Trailer Tandem Axles
  createWheel(-0.76, 0.38, -2.4); // Trailer Axle 1 L
  createWheel(0.76, 0.38, -2.4);  // Trailer Axle 1 R
  createWheel(-0.76, 0.38, -3.2); // Trailer Axle 2 L
  createWheel(0.76, 0.38, -3.2);  // Trailer Axle 2 R

  // 4. Contact Shadow Plane
  const shadowGeo = new THREE.PlaneGeometry(3.2, 9.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x0F172A,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.set(0, 0.02, -0.4);
  truckGroup.add(contactShadow);

  scene.add(truckGroup);

  // ==========================================================================
  // ASPHALT ROUTE & HIGHWAY STRIPES
  // ==========================================================================
  const roadGroup = new THREE.Group();
  const roadGeo = new THREE.PlaneGeometry(6, 60);
  const roadMesh = new THREE.Mesh(roadGeo, materials.roadAsphalt);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(0, 0, 0);
  roadGroup.add(roadMesh);

  // Center Dashed Route Stripes
  const stripeCount = 14;
  const stripes = [];
  for (let i = 0; i < stripeCount; i++) {
    const sGeo = new THREE.PlaneGeometry(0.16, 2.2);
    const sMesh = new THREE.Mesh(sGeo, materials.roadStripe);
    sMesh.rotation.x = -Math.PI / 2;
    sMesh.position.set(0, 0.015, (i - stripeCount / 2) * 4.2);
    roadGroup.add(sMesh);
    stripes.push(sMesh);
  }
  scene.add(roadGroup);

  // ==========================================================================
  // WARM DUST & HIGHWAY PARTICLES (Atmospheric Sparkles)
  // ==========================================================================
  const particleCount = isMobile ? 70 : 180;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  const particleVel = [];

  for (let i = 0; i < particleCount; i++) {
    particlePos[i * 3] = (Math.random() - 0.5) * 16;
    particlePos[i * 3 + 1] = Math.random() * 5 + 0.2;
    particlePos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    particleVel.push({
      x: (Math.random() - 0.5) * 0.008,
      y: Math.random() * 0.006 + 0.002,
      z: (Math.random() - 0.5) * 0.015
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xF97316,
    size: isMobile ? 0.06 : 0.08,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending
  });
  const dustParticles = new THREE.Points(particleGeo, particleMat);
  scene.add(dustParticles);

  // ==========================================================================
  // SCROLL CHOREOGRAPHY & KINEMATICS ENGINE
  // ==========================================================================
  let currentScrollProgress = 0;
  let targetScrollProgress = 0;

  function calculateScroll() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return 0;
    return Math.max(0, Math.min(1, window.scrollY / totalHeight));
  }

  window.addEventListener('scroll', () => {
    targetScrollProgress = calculateScroll();
  }, { passive: true });

  // Initial calculation
  targetScrollProgress = calculateScroll();
  currentScrollProgress = targetScrollProgress;

  // Responsive Layout Positioning
  function updateCameraAndTruck() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerWidth <= 768) {
      // Mobile framing
      truckGroup.scale.set(0.72, 0.72, 0.72);
    } else if (window.innerWidth <= 1024) {
      truckGroup.scale.set(0.88, 0.88, 0.88);
    } else {
      truckGroup.scale.set(1.05, 1.05, 1.05);
    }
  }
  updateCameraAndTruck();
  window.addEventListener('resize', updateCameraAndTruck);

  // Smooth Interpolation Curves for 6 Scenes
  // Scene 0 - 0.18: Hero
  // Scene 0.18 - 0.40: Fortaleza / Stats
  // Scene 0.40 - 0.65: La Ruta / Mapa Argentina
  // Scene 0.65 - 0.85: Manifiesto de Carga (Servicios)
  // Scene 0.85 - 1.0: Confianza / CTA Final
  function applySceneChoreography(progress) {
    const p = progress;

    if (p < 0.22) {
      // SCENE 1: HERO
      const t = p / 0.22;
      const posX = isMobile ? 0 : 2.4 - t * 0.8;
      const posZ = 0.5 - t * 0.5;
      const rotY = 0.42 - t * 0.25;

      truckGroup.position.set(posX, 0, posZ);
      truckGroup.rotation.set(0, rotY, 0);
      camera.position.set(0, 2.6, 9.8);
      camera.lookAt(posX * 0.3, 1.4, 0);

    } else if (p < 0.45) {
      // SCENE 2: FORTALEZA (3/4 Profile showcasing Container Capacity)
      const t = (p - 0.22) / 0.23;
      const posX = isMobile ? 0.3 : 1.6 - t * 3.2; // glide to left
      const rotY = 0.17 + t * 0.95; // rotates smoothly

      truckGroup.position.set(posX, 0, 0);
      truckGroup.rotation.set(0, rotY, 0);
      camera.position.set(0, 2.9, 10.2);
      camera.lookAt(0, 1.5, 0);

    } else if (p < 0.70) {
      // SCENE 3: LA RUTA (Forward Perspective alignment with Route Map)
      const t = (p - 0.45) / 0.25;
      const posX = isMobile ? 0 : -1.6 + t * 4.2; // moves to right side
      const rotY = 1.12 - t * 1.35; // straightens on highway

      truckGroup.position.set(posX, 0, -1.0 - t * 1.5);
      truckGroup.rotation.set(0, rotY, 0);
      camera.position.set(0, 3.4, 10.5);
      camera.lookAt(0, 1.3, 0);

    } else if (p < 0.88) {
      // SCENE 4: SERVICIOS / MANIFIESTO
      const t = (p - 0.70) / 0.18;
      const posX = isMobile ? 0.2 : 2.6 - t * 1.2;
      const rotY = -0.23 + t * 0.45;

      truckGroup.position.set(posX, 0, -2.5 + t * 1.5);
      truckGroup.rotation.set(0, rotY, 0);
      camera.position.set(0, 2.8, 10.0);
      camera.lookAt(posX * 0.2, 1.4, 0);

    } else {
      // SCENE 5 & 6: CONFIANZA & CTA FINAL (Center Stage Power Stance)
      const t = (p - 0.88) / 0.12;
      const posX = isMobile ? 0 : 1.4 - t * 1.4;
      const rotY = 0.22 - t * 0.22; // aligns straight

      truckGroup.position.set(posX, 0, -1.0 + t * 1.8);
      truckGroup.rotation.set(0, rotY, 0);
      camera.position.set(0, 2.5, 9.6);
      camera.lookAt(0, 1.4, 0);
    }
  }

  // ==========================================================================
  // RENDER LOOP & CONTINUOUS KINEMATICS
  // ==========================================================================
  let clock = new THREE.Clock();
  let isTabVisible = true;

  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isTabVisible) return;

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Smooth lerp for scroll progression
    currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.085;
    applySceneChoreography(currentScrollProgress);

    // Dynamic Suspension Bounce & Vibration
    const speedFactor = 1.0 + Math.abs(targetScrollProgress - currentScrollProgress) * 20;
    const bounce = Math.sin(elapsedTime * 9) * 0.018 * speedFactor;
    cabinGroup.position.y = bounce;
    trailerGroup.position.y = bounce * 0.7;

    // Wheel Rotation
    const wheelRotSpeed = (delta * 6 + Math.abs(targetScrollProgress - currentScrollProgress) * 15);
    wheelsList.forEach(w => {
      w.rotation.x += wheelRotSpeed;
    });

    // Asphalt Stripe Flow (Highway Illusion)
    stripes.forEach(s => {
      s.position.z += delta * 7.5 * (1 + currentScrollProgress * 0.5);
      if (s.position.z > 25) {
        s.position.z = -30;
      }
    });

    // Ambient Dust Drift
    const positions = dustParticles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] += particleVel[i].x;
      positions[idx + 1] += particleVel[i].y;
      positions[idx + 2] += particleVel[i].z + 0.03;

      if (positions[idx + 1] > 6) positions[idx + 1] = 0.2;
      if (positions[idx + 2] > 15) positions[idx + 2] = -15;
    }
    dustParticles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

})();
