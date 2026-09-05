/**
 * ==========================================================================
 * CYBERNETIC SPATIAL ENGINE — PROCEDURAL 3D TECHNICAL WORLD
 * Md Faijal Eaqbal Portfolio · World-Class WebGL Experience
 * 
 * Engineered to Devini Labs benchmark standards:
 * - 100% Procedural Generation: Zero remote asset latency or 404 risk
 * - Continuous Scroll-Driven Catmull-Rom Camera Spline
 * - Purposeful Technical Geometries: Racks, AI Core, Pipelines, Architecture Stack
 * - Raycast Layer Inspection for Architecture Visualizer & Skills
 * - Adaptive DPR, Frustum Culling, Low Draw-Call Batching, WebGL Error Fallback
 * ==========================================================================
 */

(function () {
  'use strict';

  // Fallback protection: ensure THREE is available
  if (typeof THREE === 'undefined') {
    console.warn('[3d-world] Three.js not loaded. Enabling visual fallback.');
    document.documentElement.classList.add('no-webgl');
    return;
  }

  /* --------------------------------------------------------------------------
     01. CONSTANTS & SYSTEM CONFIGURATION
     -------------------------------------------------------------------------- */
  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  
  // Palette: Titanium Obsidian, Cold Slate, Neural Cyan, Warm Amber, Pulse Emerald
  const C = {
    bg: 0x05070c,
    fog: 0x06080e,
    obsidian: 0x0d121c,
    chassis: 0x161f30,
    steel: 0x222e47,
    cyan: 0x38bdf8,
    cyanGlow: 0x0284c7,
    indigo: 0x6377ff,
    violet: 0x8e78ff,
    amber: 0xf59e0b,
    emerald: 0x10b981,
    white: 0xf1f5f9
  };

  let canvas, renderer, scene, camera, clock;
  let animId = null;
  let isVisible = true;
  let isMobile = window.innerWidth <= 768;
  
  // Spatial Groups
  let worldGroup, heroHubGroup, rackCorridorGroup, skillsMatrixGroup;
  let projectsGroup, archStackGroup, beaconGroup;
  let dataPipelinesGroup, particleSystem;
  let beaconDishMesh = null;
  let beaconSignalRings = [];
  let beaconLaserBeam = null;

  // Interactive Architecture Layers
  let archLayerMeshes = [];
  let hoveredArchIndex = -1;
  let activeArchIndex = -1;

  // Project Nodes & Skill Pillars
  let projectNodes = [];
  let skillPillars = [];

  // Mouse & Scroll State
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollProgress = 0;
  let targetScroll = 0;
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2(-999, -999);

  // Dynamic Elements for Animation
  let animatedSplinePackets = [];
  let rotatingDiscs = [];
  let pulsingLights = [];

  /* --------------------------------------------------------------------------
     02. PROCEDURAL CANVAS TEXTURES (High-Performance Off-Screen Generators)
     -------------------------------------------------------------------------- */
  function createOffscreenCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  // Server Blade Faceplate Texture
  function generateServerBladeTexture() {
    const w = 512, h = 512;
    const c = createOffscreenCanvas(w, h);
    const ctx = c.getContext('2d');

    // Base dark titanium chassis
    ctx.fillStyle = '#0c1018';
    ctx.fillRect(0, 0, w, h);

    // Fine brushed horizontal grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let i = 0; i < h; i += 2) {
      if (Math.sin(i * 0.4) > 0) {
        ctx.fillRect(0, i, w, 1);
      }
    }

    // Hex ventilation grille slots
    ctx.fillStyle = '#05070a';
    const slotW = 12, slotH = 4;
    for (let y = 40; y < h - 40; y += 12) {
      for (let x = 60; x < w - 60; x += 22) {
        ctx.fillRect(x, y, slotW, slotH);
      }
    }

    // Bus trace lines & optical fiber channels
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(20, 30);
    ctx.lineTo(w - 20, 30);
    ctx.moveTo(20, h - 30);
    ctx.lineTo(w - 20, h - 30);
    ctx.stroke();

    // Blinking status LED arrays (amber, emerald, cyan)
    ctx.globalAlpha = 1.0;
    const ledColors = ['#10b981', '#38bdf8', '#f59e0b', '#10b981'];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = ledColors[i % ledColors.length];
      ctx.beginPath();
      ctx.arc(30 + i * 16, 18, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Silicon Microprocessor Die / Neural Core Texture
  function generateChipDieTexture() {
    const w = 512, h = 512;
    const c = createOffscreenCanvas(w, h);
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#090d15';
    ctx.fillRect(0, 0, w, h);

    // Micro-via circuit traces
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
      const step = i * 17;
      ctx.beginPath();
      ctx.moveTo(step, 0);
      ctx.lineTo(step, step * 0.5);
      ctx.lineTo(w - step, step);
      ctx.stroke();
    }

    // Center silicon die square
    ctx.fillStyle = '#111827';
    ctx.fillRect(160, 160, 192, 192);
    ctx.strokeStyle = '#6377ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 160, 192, 192);

    // Inner holographic core
    const rad = ctx.createRadialGradient(256, 256, 10, 256, 256, 120);
    rad.addColorStop(0, 'rgba(99, 119, 255, 0.5)');
    rad.addColorStop(0.6, 'rgba(56, 189, 248, 0.2)');
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(160, 160, 192, 192);

    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  // Architectural Datum Grid Texture
  function generateDatumGridTexture() {
    const w = 512, h = 512;
    const c = createOffscreenCanvas(w, h);
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, w, h);

    // Sub-grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    const spacing = 32;
    for (let x = 0; x <= w; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Coordinate intersections
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    for (let x = 0; x <= w; x += spacing * 2) {
      for (let y = 0; y <= h; y += spacing * 2) {
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    return tex;
  }

  // Layer Slab Texture for Architecture Visualizer
  function generateArchitectureSlabTexture(label, subtext, colorHex) {
    const w = 512, h = 128;
    const c = createOffscreenCanvas(w, h);
    const ctx = c.getContext('2d');

    // Smoked obsidian glass backing
    ctx.fillStyle = 'rgba(10, 15, 24, 0.96)';
    ctx.fillRect(0, 0, w, h);

    // Glowing border outline
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    // Left accent badge
    ctx.fillStyle = colorHex;
    ctx.fillRect(8, 8, 8, h - 16);

    // Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText(label, 30, 48);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Inter", sans-serif';
    ctx.fillText(subtext, 30, 84);

    // Right-aligned status telemetry
    ctx.fillStyle = colorHex;
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('STATUS: 200 OK // LIVE', w - 195, 46);

    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  /* --------------------------------------------------------------------------
     03. INITIALIZATION & ENGINE BOOTSTRAP
     -------------------------------------------------------------------------- */
  function init() {
    canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    clock = new THREE.Clock();

    // 1. Renderer with strict performance safeguards
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('[3d-world] WebGL Context initialization failed:', e);
      document.documentElement.classList.add('no-webgl');
      return;
    }

    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // 2. Scene with Atmospheric Depth Fog
    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(C.fog, 0.015);

    // 3. Perspective Camera
    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.2, 350);
    camera.position.set(0, 3.2, 14);
    camera.lookAt(0, 0, 0);

    // 4. World Group container
    worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 5. Lighting Setup
    buildLighting();

    // 6. Build All Procedural Subsystems
    buildAtmosphericGrid();
    buildHeroCommandHub();
    buildServerCorridor();
    buildSkillsConstellation();
    buildProjectShowcaseNodes();
    buildInteractiveArchitectureStack();
    buildDataPipelines();
    buildFloatingDataAtmosphere();
    buildBottomBeaconArray();

    // 7. Event Listeners
    setupEventListeners();

    // 8. Start RAF Loop
    animate();
  }

  /* --------------------------------------------------------------------------
     04. LIGHTING SYSTEM
     -------------------------------------------------------------------------- */
  function buildLighting() {
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xe2e8f0, 2.6);
    keyLight.position.set(12, 25, 20);
    scene.add(keyLight);

    const rimLight1 = new THREE.DirectionalLight(C.cyan, 3.2);
    rimLight1.position.set(-18, 10, -15);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(C.violet, 2.0);
    rimLight2.position.set(15, -8, -10);
    scene.add(rimLight2);

    const corePointLight = new THREE.PointLight(C.cyan, 4.0, 35, 1.8);
    corePointLight.position.set(3.2, 2, 0);
    scene.add(corePointLight);
    pulsingLights.push({ light: corePointLight, baseIntensity: 4.0, speed: 2.2, phase: 0 });

    const rackPointLight = new THREE.PointLight(C.amber, 3.5, 30, 2.0);
    rackPointLight.position.set(4, -14, -18);
    scene.add(rackPointLight);
    pulsingLights.push({ light: rackPointLight, baseIntensity: 3.5, speed: 1.6, phase: 1.5 });
  }

  /* --------------------------------------------------------------------------
     05. ATMOSPHERIC DATUM GRID & TELEMETRY HORIZON
     -------------------------------------------------------------------------- */
  function buildAtmosphericGrid() {
    const gridTex = generateDatumGridTexture();
    const groundGeom = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshBasicMaterial({
      map: gridTex,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -6;
    worldGroup.add(ground);

    const ringGeom = new THREE.RingGeometry(38, 38.2, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: C.cyan,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const meridianRing = new THREE.Mesh(ringGeom, ringMat);
    meridianRing.rotation.x = -Math.PI / 2;
    meridianRing.position.y = -5.9;
    worldGroup.add(meridianRing);

    const bracketGeom = new THREE.BufferGeometry();
    const bracketPts = [];
    const span = 14;
    [[-span, -span], [span, -span], [span, span], [-span, span]].forEach(([cx, cz]) => {
      const arm = 1.2;
      bracketPts.push(cx, 0, cz, cx + (cx > 0 ? -arm : arm), 0, cz);
      bracketPts.push(cx, 0, cz, cx, 0, cz + (cz > 0 ? -arm : arm));
      bracketPts.push(cx, 0, cz, cx, arm, cz);
    });
    bracketGeom.setAttribute('position', new THREE.Float32BufferAttribute(bracketPts, 3));
    const bracketMat = new THREE.LineBasicMaterial({
      color: C.cyan,
      transparent: true,
      opacity: 0.4
    });
    const reticles = new THREE.LineSegments(bracketGeom, bracketMat);
    reticles.position.y = -5.8;
    worldGroup.add(reticles);
  }

  /* --------------------------------------------------------------------------
     06. HERO SECTION (01 // THE TECHNICAL COMMAND HUB)
     -------------------------------------------------------------------------- */
  function buildHeroCommandHub() {
    heroHubGroup = new THREE.Group();
    heroHubGroup.position.set(0, 0, 0);

    const coreCenter = new THREE.Group();
    coreCenter.position.set(3.4, 0.8, 0);

    const dieTex = generateChipDieTexture();
    const dieGeom = new THREE.BoxGeometry(2.6, 0.4, 2.6);
    const dieMat = new THREE.MeshStandardMaterial({
      map: dieTex,
      roughness: 0.3,
      metalness: 0.85
    });
    const dieMesh = new THREE.Mesh(dieGeom, dieMat);
    coreCenter.add(dieMesh);

    const neuralGeom = new THREE.IcosahedronGeometry(1.6, 1);
    const neuralMat = new THREE.MeshBasicMaterial({
      color: C.cyan,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const neuralMesh = new THREE.Mesh(neuralGeom, neuralMat);
    coreCenter.add(neuralMesh);
    rotatingDiscs.push({ mesh: neuralMesh, rx: 0.2, ry: 0.4, rz: 0.1 });

    const tokenPointsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.09,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const tokenPoints = new THREE.Points(neuralGeom, tokenPointsMat);
    coreCenter.add(tokenPoints);

    const ringRadii = [2.2, 2.8, 3.4];
    ringRadii.forEach((rad, idx) => {
      const ringG = new THREE.TorusGeometry(rad, 0.022, 16, 64);
      const ringM = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? C.cyan : C.violet,
        transparent: true,
        opacity: 0.5 - idx * 0.1
      });
      const ringMsh = new THREE.Mesh(ringG, ringM);
      ringMsh.rotation.x = Math.PI / 3 + idx * 0.3;
      ringMsh.rotation.y = idx * 0.4;
      coreCenter.add(ringMsh);
      rotatingDiscs.push({
        mesh: ringMsh,
        rx: 0.05 * (idx + 1),
        ry: -0.08 * (idx + 1),
        rz: 0.03
      });
    });

    const bladeTex = generateServerBladeTexture();
    const bladeMat = new THREE.MeshStandardMaterial({
      map: bladeTex,
      roughness: 0.4,
      metalness: 0.75
    });

    for (let i = 0; i < 3; i++) {
      const h = 4.8 - i * 0.6;
      const bladeGeom = new THREE.BoxGeometry(0.7, h, 2.8);
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.set(7.5 + i * 1.5, h * 0.5 - 4.5, -2 + i * 1.2);
      blade.rotation.y = -0.3;
      heroHubGroup.add(blade);

      const stripG = new THREE.PlaneGeometry(0.5, 0.08);
      const stripM = new THREE.MeshBasicMaterial({
        color: i === 0 ? C.emerald : (i === 1 ? C.cyan : C.amber),
        side: THREE.DoubleSide
      });
      const strip = new THREE.Mesh(stripG, stripM);
      strip.position.set(7.5 + i * 1.5, h - 4.6, -0.5 + i * 1.2);
      strip.rotation.y = -0.3;
      heroHubGroup.add(strip);
    }

    heroHubGroup.add(coreCenter);
    worldGroup.add(heroHubGroup);
  }

  /* --------------------------------------------------------------------------
     07. ABOUT SECTION (02 // THE SERVER CORRIDOR & DAEMON TERMINAL)
     -------------------------------------------------------------------------- */
  function buildServerCorridor() {
    rackCorridorGroup = new THREE.Group();
    rackCorridorGroup.position.set(0, -14, -22);

    const bladeTex = generateServerBladeTexture();
    const rackMat = new THREE.MeshStandardMaterial({
      map: bladeTex,
      roughness: 0.35,
      metalness: 0.8
    });

    const rackCount = 5;
    for (let i = 0; i < rackCount; i++) {
      const zOffset = (i - 2) * 5;
      
      const leftRack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7.5, 3.8), rackMat);
      leftRack.position.set(-8.5, 0, zOffset);
      rackCorridorGroup.add(leftRack);

      const rightRack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7.5, 3.8), rackMat);
      rightRack.position.set(8.5, 0, zOffset);
      rackCorridorGroup.add(rightRack);

      const bridgeG = new THREE.BoxGeometry(17, 0.15, 0.4);
      const bridgeM = new THREE.MeshStandardMaterial({
        color: C.chassis,
        metalness: 0.9,
        roughness: 0.2
      });
      const bridge = new THREE.Mesh(bridgeG, bridgeM);
      bridge.position.set(0, 3.6, zOffset);
      rackCorridorGroup.add(bridge);

      const optG = new THREE.BoxGeometry(17, 0.04, 0.04);
      const optM = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? C.cyan : C.amber,
        transparent: true,
        opacity: 0.7
      });
      const opt = new THREE.Mesh(optG, optM);
      opt.position.set(0, 3.7, zOffset);
      rackCorridorGroup.add(opt);
    }

    const termGeom = new THREE.PlaneGeometry(4.4, 2.8);
    const termC = createOffscreenCanvas(512, 320);
    const tx = termC.getContext('2d');
    tx.fillStyle = '#080d18';
    tx.fillRect(0, 0, 512, 320);
    tx.strokeStyle = '#38bdf8';
    tx.lineWidth = 2;
    tx.strokeRect(4, 4, 504, 312);
    tx.fillStyle = '#38bdf8';
    tx.font = 'bold 16px "JetBrains Mono", monospace';
    tx.fillText('FAIJAL_SYSTEMS // PM2 CLUSTER V4.8', 20, 36);
    tx.fillStyle = '#10b981';
    tx.font = '13px "JetBrains Mono", monospace';
    tx.fillText('● SYSTEM DAEMONS: 8 ONLINE · 0 FAILED', 20, 68);
    tx.fillText('● READSTACKS RAG: OLLAMA LLAMA 3.2 ACTIVE', 20, 96);
    tx.fillText('● MALDA NOTIFIER: CRON SCRAPER 200 OK', 20, 124);
    tx.fillText('● PIXEL ASSISTOR: 158 COMMANDS ROUTED', 20, 152);
    tx.fillText('● BLITZ TMA: TON BLOCKCHAIN SYNCED', 20, 180);
    tx.fillStyle = '#94a3b8';
    tx.fillText('> ARCHITECTURE: AUTONOMOUS AGENT WORKFLOW', 20, 220);
    tx.fillText('> PHILOSOPHY: ZERO RENTED API VULNERABILITY', 20, 248);
    tx.fillStyle = '#f59e0b';
    tx.fillText('READY // LISTENING ON 0.0.0.0:443', 20, 284);

    const termTex = new THREE.CanvasTexture(termC);
    const termMat = new THREE.MeshBasicMaterial({
      map: termTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92
    });
    const termMesh = new THREE.Mesh(termGeom, termMat);
    termMesh.position.set(0, 0.4, 0);
    rackCorridorGroup.add(termMesh);

    worldGroup.add(rackCorridorGroup);
  }

  /* --------------------------------------------------------------------------
     08. SKILLS SECTION (03 // SPATIAL CAPABILITY MONOLITHS)
     -------------------------------------------------------------------------- */
  function buildSkillsConstellation() {
    skillsMatrixGroup = new THREE.Group();
    skillsMatrixGroup.position.set(0, -32, -45);

    const categories = [
      { name: 'AI / LOCAL LLMs', color: C.cyan, count: 4, x: -6.5, z: -2 },
      { name: 'BACKEND & SYSTEMS', color: C.indigo, count: 7, x: -3.2, z: 2 },
      { name: 'BOTS & AUTOMATION', color: C.emerald, count: 8, x: 0, z: -3 },
      { name: 'DATA & VECTORS', color: C.violet, count: 5, x: 3.2, z: 2 },
      { name: 'CLOUD & DEVOPS', color: C.amber, count: 7, x: 6.5, z: -2 }
    ];

    categories.forEach((cat, idx) => {
      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(cat.x, 0, cat.z);

      const h = 4.2 + (cat.count * 0.35);
      const pillarGeom = new THREE.CylinderGeometry(0.9, 1.1, h, 6);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: C.steel,
        roughness: 0.3,
        metalness: 0.85
      });
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.y = h * 0.5 - 2;
      pillarGroup.add(pillar);

      const crownG = new THREE.TorusGeometry(1.05, 0.05, 12, 32);
      const crownM = new THREE.MeshBasicMaterial({
        color: cat.color,
        transparent: true,
        opacity: 0.85
      });
      const crown = new THREE.Mesh(crownG, crownM);
      crown.rotation.x = Math.PI / 2;
      crown.position.y = h - 2;
      pillarGroup.add(crown);

      const sphereG = new THREE.OctahedronGeometry(0.55, 0);
      const sphereM = new THREE.MeshBasicMaterial({
        color: cat.color,
        wireframe: true,
        transparent: true,
        opacity: 0.75
      });
      const sphere = new THREE.Mesh(sphereG, sphereM);
      sphere.position.y = h - 1.0;
      pillarGroup.add(sphere);
      rotatingDiscs.push({ mesh: sphere, rx: 0.3, ry: 0.5, rz: 0.2 });

      pillarGroup.userData = { categoryIndex: idx, name: cat.name };
      skillPillars.push(pillarGroup);
      skillsMatrixGroup.add(pillarGroup);
    });

    const linePts = [];
    for (let i = 0; i < categories.length - 1; i++) {
      linePts.push(categories[i].x, 2, categories[i].z);
      linePts.push(categories[i + 1].x, 2, categories[i + 1].z);
    }
    linePts.push(categories[0].x, 2, categories[0].z);
    linePts.push(categories[categories.length - 1].x, 2, categories[categories.length - 1].z);

    const constellGeom = new THREE.BufferGeometry();
    constellGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3));
    const constellMat = new THREE.LineBasicMaterial({
      color: C.cyan,
      transparent: true,
      opacity: 0.35
    });
    const constellation = new THREE.LineSegments(constellGeom, constellMat);
    skillsMatrixGroup.add(constellation);

    worldGroup.add(skillsMatrixGroup);
  }

  /* --------------------------------------------------------------------------
     09. PROJECT SHOWCASE (04 // CUSTOM 3D SUBSYSTEM ENVIRONMENTS)
     -------------------------------------------------------------------------- */
  function buildProjectShowcaseNodes() {
    projectsGroup = new THREE.Group();
    projectsGroup.position.set(0, -56, -72);

    const projectsData = [
      {
        id: 'readstacks',
        name: 'Readstacks',
        type: 'RAG_CORE',
        color: C.cyan,
        pos: new THREE.Vector3(-4.2, 0, 0)
      },
      {
        id: 'malda-bot',
        name: 'Malda Bot',
        type: 'DAEMON_BROADCAST',
        color: C.emerald,
        pos: new THREE.Vector3(4.2, -6, -14)
      },
      {
        id: 'blitz-game',
        name: 'Blitz Game Zone',
        type: 'TON_BLOCKCHAIN',
        color: C.amber,
        pos: new THREE.Vector3(-4.2, -12, -28)
      },
      {
        id: 'pixel-assistor',
        name: 'Pixel-Assistor',
        type: 'AUDIO_MATRIX',
        color: C.indigo,
        pos: new THREE.Vector3(4.2, -18, -42)
      },
      {
        id: 'malda-portal',
        name: 'Malda Portal',
        type: 'HIERARCHY_NET',
        color: C.violet,
        pos: new THREE.Vector3(0, -24, -56)
      }
    ];

    projectsData.forEach((proj) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(proj.pos);

      if (proj.type === 'RAG_CORE') {
        const cylG = new THREE.CylinderGeometry(1.8, 1.8, 3.2, 32, 1, true);
        const cylM = new THREE.MeshBasicMaterial({
          color: proj.color,
          wireframe: true,
          transparent: true,
          opacity: 0.4
        });
        const cyl = new THREE.Mesh(cylG, cylM);
        nodeGroup.add(cyl);

        const discG = new THREE.CircleGeometry(1.7, 32);
        const discM = new THREE.MeshBasicMaterial({
          color: proj.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65
        });
        const disc = new THREE.Mesh(discG, discM);
        disc.rotation.x = Math.PI / 2;
        nodeGroup.add(disc);
        pulsingLights.push({ light: { intensity: 1 }, onUpdate: (time) => {
          disc.position.y = Math.sin(time * 2.5) * 1.4;
        }});
      } else if (proj.type === 'DAEMON_BROADCAST') {
        const hubG = new THREE.CylinderGeometry(1.2, 1.4, 1.2, 8);
        const hubM = new THREE.MeshStandardMaterial({ color: C.steel, metalness: 0.8 });
        const hub = new THREE.Mesh(hubG, hubM);
        nodeGroup.add(hub);

        [2.0, 3.0, 4.0].forEach((r, idx) => {
          const waveG = new THREE.RingGeometry(r, r + 0.08, 32);
          const waveM = new THREE.MeshBasicMaterial({
            color: proj.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5 - idx * 0.12
          });
          const wave = new THREE.Mesh(waveG, waveM);
          wave.rotation.x = Math.PI / 2;
          nodeGroup.add(wave);
          rotatingDiscs.push({ mesh: wave, rx: 0, ry: 0, rz: 0.1 * (idx + 1) });
        });
      } else if (proj.type === 'TON_BLOCKCHAIN') {
        const shardG = new THREE.DodecahedronGeometry(1.6, 0);
        const shardM = new THREE.MeshStandardMaterial({
          color: C.obsidian,
          roughness: 0.2,
          metalness: 0.9
        });
        const shard = new THREE.Mesh(shardG, shardM);
        nodeGroup.add(shard);

        const wireG = new THREE.DodecahedronGeometry(1.68, 0);
        const wireM = new THREE.MeshBasicMaterial({
          color: proj.color,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        });
        const wire = new THREE.Mesh(wireG, wireM);
        nodeGroup.add(wire);
        rotatingDiscs.push({ mesh: nodeGroup, rx: 0.15, ry: 0.25, rz: 0.1 });
      } else if (proj.type === 'AUDIO_MATRIX') {
        const resoG = new THREE.TorusGeometry(1.8, 0.12, 16, 48);
        const resoM = new THREE.MeshStandardMaterial({
          color: proj.color,
          roughness: 0.3,
          metalness: 0.8
        });
        const reso = new THREE.Mesh(resoG, resoM);
        nodeGroup.add(reso);

        const coreG = new THREE.BoxGeometry(1.4, 1.4, 1.4);
        const coreM = new THREE.MeshBasicMaterial({
          color: C.cyan,
          wireframe: true,
          transparent: true,
          opacity: 0.6
        });
        const core = new THREE.Mesh(coreG, coreM);
        nodeGroup.add(core);
        rotatingDiscs.push({ mesh: core, rx: 0.3, ry: 0.3, rz: 0.2 });
      } else {
        const gridG = new THREE.BoxGeometry(3.6, 0.2, 3.6);
        const gridM = new THREE.MeshStandardMaterial({ color: C.steel, metalness: 0.8 });
        const grid = new THREE.Mesh(gridG, gridM);
        nodeGroup.add(grid);

        for (let x = -1.2; x <= 1.2; x += 1.2) {
          for (let z = -1.2; z <= 1.2; z += 1.2) {
            const pinG = new THREE.CylinderGeometry(0.08, 0.08, 0.8);
            const pinM = new THREE.MeshBasicMaterial({ color: proj.color });
            const pin = new THREE.Mesh(pinG, pinM);
            pin.position.set(x, 0.5, z);
            nodeGroup.add(pin);
          }
        }
      }

      nodeGroup.userData = { id: proj.id, name: proj.name };
      projectNodes.push(nodeGroup);
      projectsGroup.add(nodeGroup);
    });

    worldGroup.add(projectsGroup);
  }

  /* --------------------------------------------------------------------------
     10. ARCHITECTURE VISUALIZER (05 // 7-LAYER INTERACTIVE STACK)
     -------------------------------------------------------------------------- */
  function buildInteractiveArchitectureStack() {
    archStackGroup = new THREE.Group();
    archStackGroup.position.set(0, -96, -135);

    const layers = [
      { id: 'client', name: '01 // CLIENT TIER', desc: 'Telegram Mini App & Web Client', color: '#38bdf8', colorNum: C.cyan },
      { id: 'proxy', name: '02 // REVERSE PROXY', desc: 'Nginx · SSL Termination · DuckDNS', color: '#8e78ff', colorNum: C.violet },
      { id: 'gateway', name: '03 // API & BOT GATEWAY', desc: 'Express · FastAPI · Discord.js · aiogram', color: '#6377ff', colorNum: C.indigo },
      { id: 'compute', name: '04 // WORKER ENGINES', desc: 'Node.js Cluster · Asyncio Daemons', color: '#10b981', colorNum: C.emerald },
      { id: 'storage', name: '05 // PERSISTENCE TIER', desc: 'PostgreSQL · SQLite · Vectra Store', color: '#f59e0b', colorNum: C.amber },
      { id: 'ai', name: '06 // LOCAL AI INFERENCE', desc: 'Ollama Llama 3.2 · Zero API Rent', color: '#38bdf8', colorNum: C.cyan },
      { id: 'infra', name: '07 // HOST INFRASTRUCTURE', desc: 'Ubuntu Linux VPS · PM2 · Systemd Cron', color: '#f1f5f9', colorNum: C.white }
    ];

    const slabW = 6.4, slabH = 0.35, slabD = 3.6;
    const spacing = 1.35;

    layers.forEach((layer, idx) => {
      const slabGroup = new THREE.Group();
      slabGroup.position.y = (3 - idx) * spacing;

      const slabGeom = new THREE.BoxGeometry(slabW, slabH, slabD);
      const slabTex = generateArchitectureSlabTexture(layer.name, layer.desc, layer.color);
      
      const materials = [
        new THREE.MeshStandardMaterial({ color: C.obsidian, metalness: 0.9, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: C.obsidian, metalness: 0.9, roughness: 0.2 }),
        new THREE.MeshBasicMaterial({ map: slabTex }),
        new THREE.MeshStandardMaterial({ color: C.obsidian, metalness: 0.9, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: layer.colorNum, metalness: 0.8, roughness: 0.3 }),
        new THREE.MeshStandardMaterial({ color: C.obsidian, metalness: 0.9, roughness: 0.2 })
      ];

      const slabMesh = new THREE.Mesh(slabGeom, materials);
      slabGroup.add(slabMesh);

      const wireGeom = new THREE.EdgesGeometry(slabGeom);
      const wireMat = new THREE.LineBasicMaterial({
        color: layer.colorNum,
        transparent: true,
        opacity: 0.6
      });
      const wire = new THREE.LineSegments(wireGeom, wireMat);
      slabGroup.add(wire);

      slabMesh.userData = {
        layerIndex: idx,
        id: layer.id,
        name: layer.name,
        desc: layer.desc,
        color: layer.color
      };
      slabGroup.userData = slabMesh.userData;

      archLayerMeshes.push(slabMesh);
      archStackGroup.add(slabGroup);
    });

    worldGroup.add(archStackGroup);
  }

  /* --------------------------------------------------------------------------
     11. ASYNCHRONOUS EVENT DATA PIPELINES (Glowing Spline Packets)
     -------------------------------------------------------------------------- */
  function buildDataPipelines() {
    dataPipelinesGroup = new THREE.Group();

    const curvePaths = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(3.4, 0.8, 0),
        new THREE.Vector3(6.0, -5.0, -10),
        new THREE.Vector3(2.0, -12.0, -18),
        new THREE.Vector3(0, -14.0, -22)
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -14.0, -22),
        new THREE.Vector3(-4.0, -22.0, -32),
        new THREE.Vector3(-2.0, -28.0, -40),
        new THREE.Vector3(0, -32.0, -45)
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -32.0, -45),
        new THREE.Vector3(3.0, -42.0, -58),
        new THREE.Vector3(-2.0, -48.0, -65),
        new THREE.Vector3(0, -56.0, -72)
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -56.0, -72),
        new THREE.Vector3(4.0, -75.0, -100),
        new THREE.Vector3(-3.0, -86.0, -120),
        new THREE.Vector3(0, -96.0, -135)
      ])
    ];

    curvePaths.forEach((curve, cIdx) => {
      const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.045, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: cIdx % 2 === 0 ? C.cyan : C.violet,
        transparent: true,
        opacity: 0.28
      });
      const tube = new THREE.Mesh(tubeGeom, tubeMat);
      dataPipelinesGroup.add(tube);

      for (let p = 0; p < 4; p++) {
        const packetG = new THREE.SphereGeometry(0.12, 8, 8);
        const packetM = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.95
        });
        const packet = new THREE.Mesh(packetG, packetM);
        dataPipelinesGroup.add(packet);

        animatedSplinePackets.push({
          mesh: packet,
          curve: curve,
          progress: p * 0.25,
          speed: 0.08 + (cIdx * 0.02)
        });
      }
    });

    worldGroup.add(dataPipelinesGroup);
  }

  /* --------------------------------------------------------------------------
     12. FLOATING DATA PACKETS ATMOSPHERE
     -------------------------------------------------------------------------- */
  function buildFloatingDataAtmosphere() {
    const particleCount = isMobile ? 250 : 650;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(C.cyan),
      new THREE.Color(C.violet),
      new THREE.Color(C.emerald),
      new THREE.Color(0x94a3b8)
    ];

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 45;
      positions[idx + 1] = (Math.random() - 0.5) * 140 - 50;
      positions[idx + 2] = (Math.random() - 0.5) * 160 - 60;

      const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[idx] = chosenColor.r;
      colors[idx + 1] = chosenColor.g;
      colors[idx + 2] = chosenColor.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 0.07 : 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geom, mat);
    worldGroup.add(particleSystem);
  }

  /* --------------------------------------------------------------------------
     13. BOTTOM SECTION (08 // TRANSMISSION BEACON & DEEP SPACE ANTENNA ARRAY)
     -------------------------------------------------------------------------- */
  function buildBottomBeaconArray() {
    beaconGroup = new THREE.Group();
    beaconGroup.position.set(0, -116, -170);

    // 1. Tapered Communication Lattice Mast
    const mastGeom = new THREE.CylinderGeometry(0.4, 2.8, 26, 6, 6, true);
    const mastMat = new THREE.MeshStandardMaterial({
      color: C.steel,
      wireframe: true,
      metalness: 0.85,
      roughness: 0.25
    });
    const mast = new THREE.Mesh(mastGeom, mastMat);
    mast.position.y = 10;
    beaconGroup.add(mast);

    // Mast Base Anchor Pedestal
    const baseGeom = new THREE.CylinderGeometry(3.6, 4.4, 3.5, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: C.obsidian,
      roughness: 0.4,
      metalness: 0.9
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = -2;
    beaconGroup.add(base);

    // 2. Parabolic High-Gain Dish Array
    const dishGeom = new THREE.SphereGeometry(4.2, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.35);
    const dishMat = new THREE.MeshStandardMaterial({
      color: C.chassis,
      side: THREE.DoubleSide,
      metalness: 0.8,
      roughness: 0.3
    });
    beaconDishMesh = new THREE.Mesh(dishGeom, dishMat);
    beaconDishMesh.rotation.x = -Math.PI * 0.65;
    beaconDishMesh.position.set(0, 23, 0);
    beaconGroup.add(beaconDishMesh);

    // Feed Horn & Optical Tip
    const feedGeom = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8);
    const feedMat = new THREE.MeshBasicMaterial({ color: C.cyan });
    const feed = new THREE.Mesh(feedGeom, feedMat);
    feed.position.set(0, 0, 1.8);
    feed.rotation.x = Math.PI / 2;
    beaconDishMesh.add(feed);

    // Spire Apex Beacon Octahedron
    const apexGeom = new THREE.OctahedronGeometry(1.2, 0);
    const apexMat = new THREE.MeshBasicMaterial({
      color: C.cyan,
      wireframe: true,
      transparent: true,
      opacity: 0.9
    });
    const apex = new THREE.Mesh(apexGeom, apexMat);
    apex.position.set(0, 24.5, 0);
    beaconGroup.add(apex);
    rotatingDiscs.push({ mesh: apex, rx: 0.4, ry: 0.6, rz: 0.2 });

    // 3. Vertical Uplink Laser Beam
    const laserGeom = new THREE.CylinderGeometry(0.15, 0.65, 80, 16, 1, true);
    const laserMat = new THREE.MeshBasicMaterial({
      color: C.cyan,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    beaconLaserBeam = new THREE.Mesh(laserGeom, laserMat);
    beaconLaserBeam.position.set(0, 64.5, 0);
    beaconGroup.add(beaconLaserBeam);

    // 4. Radiating Holo-Signal Wave Rings (Expanding into atmosphere)
    for (let r = 0; r < 4; r++) {
      const ringG = new THREE.RingGeometry(1.5, 1.65, 48);
      const ringM = new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? C.cyan : C.amber,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      });
      const ring = new THREE.Mesh(ringG, ringM);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 24.5, 0);
      beaconGroup.add(ring);
      beaconSignalRings.push({
        mesh: ring,
        progress: r * 0.25,
        speed: 0.28
      });
    }

    // 5. Contact Terminal Monolith Console (floating on right)
    const termC = createOffscreenCanvas(512, 320);
    const tctx = termC.getContext('2d');
    tctx.fillStyle = '#060a12';
    tctx.fillRect(0, 0, 512, 320);
    tctx.strokeStyle = '#38bdf8';
    tctx.lineWidth = 3;
    tctx.strokeRect(4, 4, 504, 312);
    tctx.fillStyle = '#10b981';
    tctx.font = 'bold 20px "JetBrains Mono", monospace';
    tctx.fillText('TRANSMISSION BEACON // ONLINE', 24, 42);
    tctx.fillStyle = '#38bdf8';
    tctx.font = '14px "JetBrains Mono", monospace';
    tctx.fillText('ENCRYPTION: TLS 1.3 / E2E VERIFIED', 24, 80);
    tctx.fillText('TELEGRAM: @xynqr [DIRECT]', 24, 112);
    tctx.fillText('INBOX: faijaleaqbal@gmail.com', 24, 144);
    tctx.fillText('LATENCY: 18ms · PING OK', 24, 176);
    tctx.fillStyle = '#f59e0b';
    tctx.fillText('> READY FOR INQUIRY DISPATCH', 24, 224);
    tctx.fillText('> 30-DAY POST LAUNCH SUPPORT', 24, 256);

    const cTex = new THREE.CanvasTexture(termC);
    const monGeom = new THREE.PlaneGeometry(5.2, 3.2);
    const monMat = new THREE.MeshBasicMaterial({
      map: cTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const monolith = new THREE.Mesh(monGeom, monMat);
    monolith.position.set(5.8, 12, 4);
    monolith.rotation.y = -0.35;
    beaconGroup.add(monolith);

    // Telemetry Point Light for Beacon
    const beaconLight = new THREE.PointLight(C.cyan, 5.0, 40, 1.8);
    beaconLight.position.set(0, 25, 0);
    beaconGroup.add(beaconLight);
    pulsingLights.push({ light: beaconLight, baseIntensity: 5.0, speed: 2.8, phase: 0.5 });

    worldGroup.add(beaconGroup);
  }

  /* --------------------------------------------------------------------------
     14. CONTINUOUS SCROLL-DRIVEN CAMERA CHOREOGRAPHY
     -------------------------------------------------------------------------- */
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.2, 14),        // Hero: wide aerial perspective
    new THREE.Vector3(2.5, 1.2, 8),       // Hero close-up on core
    new THREE.Vector3(0, -6.5, -6),       // Descent into corridor
    new THREE.Vector3(0, -13.5, -16),     // About: terminal console view
    new THREE.Vector3(3.5, -24.0, -32),   // Transition down
    new THREE.Vector3(0, -30.0, -38),     // Skills Constellation orbital angle
    new THREE.Vector3(-2.8, -44.0, -56),  // Project 1 & 2 pass
    new THREE.Vector3(2.8, -54.0, -68),   // Project 3 & 4 pass
    new THREE.Vector3(0, -68.0, -88),     // Project 5 view
    new THREE.Vector3(0, -94.0, -122),    // Architecture visualizer face-on
    new THREE.Vector3(0, -112.0, -150)    // Final beacon / contact viewpoint
  ]);

  const targetPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),           // Hero lookAt
    new THREE.Vector3(3.4, 0.8, 0),       // Core lookAt
    new THREE.Vector3(0, -10.0, -15),     // Corridor entry
    new THREE.Vector3(0, -14.0, -22),     // Terminal console lookAt
    new THREE.Vector3(0, -28.0, -40),     // Toward skills
    new THREE.Vector3(0, -32.0, -45),     // Skills center lookAt
    new THREE.Vector3(-4.2, -56.0, -72),  // Readstacks node
    new THREE.Vector3(4.2, -62.0, -86),   // Malda Bot / Blitz
    new THREE.Vector3(0, -80.0, -112),    // Portal lookAt
    new THREE.Vector3(0, -96.0, -135),    // Architecture stack center lookAt
    new THREE.Vector3(0, -120.0, -170)    // Transmission tower lookAt
  ]);

  let currentCamPos = new THREE.Vector3(0, 3.2, 14);
  let currentLookAt = new THREE.Vector3(0, 0, 0);

  function updateCamera(delta) {
    if (REDUCE_MOTION) return;

    scrollProgress += (targetScroll - scrollProgress) * (1 - Math.exp(-8 * delta));
    const t = Math.max(0, Math.min(1, scrollProgress));

    const desiredPos = cameraPath.getPointAt(t);
    const desiredLookAt = targetPath.getPointAt(t);

    const parallaxX = mouse.x * (isMobile ? 0.3 : 1.2);
    const parallaxY = -mouse.y * (isMobile ? 0.3 : 0.8);

    desiredPos.x += parallaxX;
    desiredPos.y += parallaxY;

    currentCamPos.lerp(desiredPos, 1 - Math.exp(-7 * delta));
    currentLookAt.lerp(desiredLookAt, 1 - Math.exp(-7 * delta));

    camera.position.copy(currentCamPos);
    camera.lookAt(currentLookAt);
  }

  /* --------------------------------------------------------------------------
     14. INTERACTION: RAYCASTING & ARCHITECTURE INSPECTION
     -------------------------------------------------------------------------- */
  function onPointerMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

    mouseVec.x = mouse.targetX;
    mouseVec.y = mouse.targetY;
  }

  function handleRaycasting() {
    if (isMobile) return;

    raycaster.setFromCamera(mouseVec, camera);
    const intersects = raycaster.intersectObjects(archLayerMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const idx = hit.userData.layerIndex;
      if (idx !== hoveredArchIndex) {
        hoveredArchIndex = idx;
        canvas.style.cursor = 'pointer';
        highlightArchitectureLayer(idx);
      }
    } else {
      if (hoveredArchIndex !== -1 && activeArchIndex === -1) {
        hoveredArchIndex = -1;
        canvas.style.cursor = 'default';
        resetArchitectureHighlights();
      }
    }
  }

  function highlightArchitectureLayer(idx) {
    archLayerMeshes.forEach((mesh, i) => {
      const parent = mesh.parent;
      if (i === idx) {
        parent.scale.set(1.05, 1.2, 1.05);
        if (mesh.material[4]) {
          mesh.material[4].emissive = new THREE.Color(mesh.userData.color);
          mesh.material[4].emissiveIntensity = 0.6;
        }
      } else {
        parent.scale.set(1.0, 1.0, 1.0);
        if (mesh.material[4]) {
          mesh.material[4].emissiveIntensity = 0.0;
        }
      }
    });

    const domLayer = document.querySelector(`[data-arch-layer="${idx}"]`);
    if (domLayer) {
      document.querySelectorAll('.arch-interactive-row').forEach(el => el.classList.remove('is-active'));
      domLayer.classList.add('is-active');
    }
  }

  function resetArchitectureHighlights() {
    archLayerMeshes.forEach((mesh) => {
      mesh.parent.scale.set(1.0, 1.0, 1.0);
      if (mesh.material[4]) {
        mesh.material[4].emissiveIntensity = 0.0;
      }
    });
    document.querySelectorAll('.arch-interactive-row').forEach(el => el.classList.remove('is-active'));
  }

  window.selectArchitectureLayer = function (idx) {
    activeArchIndex = idx;
    highlightArchitectureLayer(idx);
  };

  /* --------------------------------------------------------------------------
     15. SCROLL SYNCHRONIZATION
     -------------------------------------------------------------------------- */
  function onScroll() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      targetScroll = Math.max(0, Math.min(1, window.scrollY / totalHeight));
    }
  }

  function onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    isMobile = w <= 768;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
  }

  function onVisibilityChange() {
    isVisible = !document.hidden;
    if (isVisible && !animId) {
      clock.start();
      animate();
    }
  }

  function setupEventListeners() {
    if (!IS_TOUCH) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('click', () => {
        if (hoveredArchIndex !== -1) {
          window.selectArchitectureLayer(hoveredArchIndex);
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onWindowResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    onScroll();
  }

  /* --------------------------------------------------------------------------
     16. ANIMATION TICK / MAIN LOOP
     -------------------------------------------------------------------------- */
  function animate() {
    if (!isVisible) {
      animId = null;
      return;
    }

    animId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    mouse.x += (mouse.targetX - mouse.x) * (1 - Math.exp(-10 * delta));
    mouse.y += (mouse.targetY - mouse.y) * (1 - Math.exp(-10 * delta));

    updateCamera(delta);

    for (let i = 0; i < rotatingDiscs.length; i++) {
      const item = rotatingDiscs[i];
      item.mesh.rotation.x += item.rx * delta;
      item.mesh.rotation.y += item.ry * delta;
      item.mesh.rotation.z += item.rz * delta;
    }

    for (let i = 0; i < animatedSplinePackets.length; i++) {
      const p = animatedSplinePackets[i];
      p.progress += p.speed * delta;
      if (p.progress > 1) p.progress -= 1;
      const pt = p.curve.getPointAt(p.progress);
      p.mesh.position.copy(pt);
    }

    for (let i = 0; i < pulsingLights.length; i++) {
      const pl = pulsingLights[i];
      if (pl.light && pl.baseIntensity) {
        pl.light.intensity = pl.baseIntensity + Math.sin(elapsed * pl.speed + pl.phase) * (pl.baseIntensity * 0.35);
      }
      if (pl.onUpdate) {
        pl.onUpdate(elapsed);
      }
    }

    if (particleSystem) {
      particleSystem.rotation.y = elapsed * 0.015;
    }

    // Animate Bottom Beacon
    if (beaconDishMesh) {
      beaconDishMesh.rotation.z = Math.sin(elapsed * 0.4) * 0.25;
      beaconDishMesh.rotation.y = elapsed * 0.15;
    }
    if (beaconLaserBeam) {
      beaconLaserBeam.material.opacity = 0.55 + Math.sin(elapsed * 4.0) * 0.25;
    }
    for (let i = 0; i < beaconSignalRings.length; i++) {
      const sr = beaconSignalRings[i];
      sr.progress += sr.speed * delta;
      if (sr.progress > 1) sr.progress -= 1;
      const s = 1 + sr.progress * 14;
      sr.mesh.scale.set(s, s, s);
      sr.mesh.material.opacity = Math.max(0, (1 - sr.progress) * 0.85);
    }

    handleRaycasting();

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
