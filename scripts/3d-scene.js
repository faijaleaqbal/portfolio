/**
 * ==========================================================================
 * CYBERNETIC SPATIAL ARCHITECTURE — WEBGL ENGINE
 * Md Faijal Eaqbal Portfolio · Original 3D Procedural System
 * Multi-layer geometry · Scroll camera choreography · Performance safeguards
 * ==========================================================================
 */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('[3d-scene] Three.js not found. 3D layer bypassed.');
    return;
  }

  let canvas, renderer, scene, camera, clock;
  let coreGroup, innerCore, outerCage, vertexPoints, networkLines, particleField;
  let networkPositions, linePositions;
  
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  let isMobile = windowWidth <= 768;
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let scrollProgress = 0;
  let targetScrollProgress = 0;

  let isVisible = true;
  let animFrameId = null;
  let lastFrameTime = 0;

  // Palette: electric cobalt, subtle violet, faint slate
  const PALETTE = {
    core: 0x6377ff,
    cage: 0x8e78ff,
    particleA: new THREE.Color(0x6377ff),
    particleB: new THREE.Color(0x8e78ff),
    particleC: new THREE.Color(0x38bdf8),
    particleD: new THREE.Color(0x272d42)
  };

  function init() {
    canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    clock = new THREE.Clock();

    // 1. Renderer Setup
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance'
    });
    updateRendererSize();

    // 2. Scene & Camera Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 0.1, 100);
    camera.position.set(2.5, 0.8, 14);

    // 3. Build Procedural Systems
    buildCyberneticCore();
    buildConstellationNetwork();
    buildAtmosphericParticles();

    // 4. Register Event Listeners
    if (!isTouch && !isMobile) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onWindowResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Initial scroll sync
    onScroll();

    // 5. Start RAF Loop
    animate();
  }

  function updateRendererSize() {
    const pixelRatio = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.6);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(windowWidth, windowHeight);
  }

  /**
   * Central Procedural Geometric Node (Inner Icosahedron + Outer Dodecahedron Cage)
   */
  function buildCyberneticCore() {
    coreGroup = new THREE.Group();
    coreGroup.position.set(2.5, 0, 0); // Positioned to complement right-hand side in hero viewport

    // Inner wireframe icosahedron
    const innerGeom = new THREE.IcosahedronGeometry(2.2, isMobile ? 0 : 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: PALETTE.core,
      wireframe: true,
      transparent: true,
      opacity: 0.38
    });
    innerCore = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerCore);

    // Glowing vertex points on inner core
    const pointsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: isMobile ? 0.08 : 0.12,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    vertexPoints = new THREE.Points(innerGeom, pointsMat);
    coreGroup.add(vertexPoints);

    // Outer concentric geometric cage
    const outerGeom = new THREE.DodecahedronGeometry(3.4, 0);
    const outerMat = new THREE.MeshBasicMaterial({
      color: PALETTE.cage,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    outerCage = new THREE.Mesh(outerGeom, outerMat);
    coreGroup.add(outerCage);

    scene.add(coreGroup);
  }

  /**
   * Constellation Network: Connected coordinate lines representing distributed bot/data networks
   */
  function buildConstellationNetwork() {
    const nodeCount = isMobile ? 24 : 54;
    networkPositions = [];

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 26;
      const y = (Math.random() - 0.5) * 22;
      const z = (Math.random() - 0.5) * 16 - 2;
      networkPositions.push(new THREE.Vector3(x, y, z));
    }

    // Dynamic Line Segments
    const maxConnections = isMobile ? 32 : 90;
    linePositions = new Float32Array(maxConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: PALETTE.core,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });

    networkLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(networkLines);

    updateNetworkConnections();
  }

  function updateNetworkConnections() {
    if (!networkLines || !networkPositions) return;

    let index = 0;
    const maxDist = isMobile ? 6.5 : 7.8;
    const positions = networkLines.geometry.attributes.position.array;

    for (let i = 0; i < networkPositions.length; i++) {
      for (let j = i + 1; j < networkPositions.length; j++) {
        const dist = networkPositions[i].distanceTo(networkPositions[j]);
        if (dist < maxDist && index < positions.length - 6) {
          positions[index++] = networkPositions[i].x;
          positions[index++] = networkPositions[i].y;
          positions[index++] = networkPositions[i].z;

          positions[index++] = networkPositions[j].x;
          positions[index++] = networkPositions[j].y;
          positions[index++] = networkPositions[j].z;
        }
      }
    }

    networkLines.geometry.setDrawRange(0, index / 3);
    networkLines.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Deep Atmospheric Particle Nebula
   */
  function buildAtmosphericParticles() {
    const count = isMobile ? 80 : 340;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 38;
      positions[i3 + 1] = (Math.random() - 0.5) * 36;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;

      const roll = Math.random();
      const col = roll < 0.35 ? PALETTE.particleA :
                  roll < 0.60 ? PALETTE.particleB :
                  roll < 0.80 ? PALETTE.particleC : PALETTE.particleD;

      colors[i3]     = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isMobile ? 0.05 : 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleField = new THREE.Points(geometry, material);
    scene.add(particleField);
  }

  /* --------------------------------------------------------------------------
     Event Handlers & Scroll Calculation
     -------------------------------------------------------------------------- */
  function onPointerMove(e) {
    targetMouseX = (e.clientX / windowWidth - 0.5) * 2;
    targetMouseY = (e.clientY / windowHeight - 0.5) * 2;
  }

  function onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      targetScrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    }
  }

  function onWindowResize() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    isMobile = windowWidth <= 768;

    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    updateRendererSize();

    // Adjust core position for mobile vs desktop
    if (coreGroup) {
      coreGroup.position.x = isMobile ? 0 : 2.5;
    }
  }

  function onVisibilityChange() {
    isVisible = !document.hidden;
    if (isVisible && !animFrameId && !reduceMotion) {
      clock.start();
      animate();
    }
  }

  /* --------------------------------------------------------------------------
     Animation & Choreography Render Loop
     -------------------------------------------------------------------------- */
  function animate(timestamp) {
    if (!isVisible) {
      animFrameId = null;
      return;
    }

    // Prefers-reduced-motion: render 1 clean frame, stop loop to save CPU
    if (reduceMotion) {
      renderer.render(scene, camera);
      animFrameId = null;
      return;
    }

    animFrameId = requestAnimationFrame(animate);

    // Frame throttle: 30 FPS on touch devices to conserve battery
    if (isTouch && timestamp && timestamp - lastFrameTime < 1000 / 30) return;
    lastFrameTime = timestamp || 0;

    const elapsed = clock.getElapsedTime();

    // Smooth lerp for mouse and scroll
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;

    // 1. Core Geometry Continuous Rotation
    if (coreGroup) {
      innerCore.rotation.y = elapsed * 0.12;
      innerCore.rotation.x = elapsed * 0.08;
      outerCage.rotation.y = -elapsed * 0.07;
      outerCage.rotation.z = elapsed * 0.05;

      // Subtle breath scale
      const breath = 1 + Math.sin(elapsed * 0.8) * 0.03;
      coreGroup.scale.set(breath, breath, breath);
    }

    // 2. Camera Choreography Linked to Scroll Progression
    // The camera descends through coordinate planes as user journeys down the page
    const camTargetX = (isMobile ? 0 : 2.2) * (1 - scrollProgress) + mouseX * 0.6;
    const camTargetY = 0.8 - scrollProgress * 12 - mouseY * 0.6;
    const camTargetZ = 14 - Math.sin(scrollProgress * Math.PI) * 3;

    camera.position.x += (camTargetX - camera.position.x) * 0.06;
    camera.position.y += (camTargetY - camera.position.y) * 0.06;
    camera.position.z += (camTargetZ - camera.position.z) * 0.06;

    // Camera tilts gently along scroll trajectory
    camera.lookAt(
      (isMobile ? 0 : 1.0) * (1 - scrollProgress),
      -scrollProgress * 12,
      0
    );

    // 3. Particle Field Drift
    if (particleField) {
      particleField.rotation.y = elapsed * 0.01 + mouseX * 0.02;
      particleField.rotation.x = -elapsed * 0.006 + mouseY * 0.02;
    }

    // 4. Subtle Node Drift in Constellation
    if (networkPositions && !isMobile && Math.floor(elapsed * 60) % 2 === 0) {
      for (let i = 0; i < networkPositions.length; i++) {
        networkPositions[i].y += Math.sin(elapsed + i) * 0.003;
      }
      updateNetworkConnections();
    }

    renderer.render(scene, camera);
  }

  // Self Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
