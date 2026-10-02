# 3D UI Transformation Tasks Checklist

## Phase 1: 3D Hero / Landing Section
- [x] Add Three.js canvas container to `index.html` hero section
- [x] Create `scripts/3d-scene.js` for WebGL scene, camera, renderer setup
- [x] Implement interactive 3D Cyber Tech Core / Polyhedron geometry with glowing particle ring
- [x] Connect pointer move event listeners for subtle 3D parallax tracking
- [x] Match ambient & point lighting to dark teal/indigo theme

## Phase 2: Scroll-Based 3D Camera & Scene Transitions
- [x] Integrate GSAP and ScrollTrigger scripts
- [x] Map scroll progress to 3D camera position and object rotation per section
- [x] Add smooth section-to-section camera zoom, tilt, and pan transitions
- [x] Synchronize particle field density & colors with section scrolling

## Phase 3: 3D Cards & Spatial Tilt Effects
- [x] Add 3D card tilt & parallax depth script in `scripts/main.js`
- [x] Add CSS `perspective` and `transform-style: preserve-3d` to `.project-card`, `.skill-card`, and `.hero-card-glass`
- [x] Implement mouse position tracking for smooth `rotateX`, `rotateY`, and dynamic glare reflections
- [x] Add 3D element elevation on hover for icons and buttons

## Phase 4: Performance Optimization & Mobile Fallback Engine
- [x] Implement FPS monitor and device capability check
- [x] Add automatic mobile fallback (`< 768px`) reducing WebGL workload and utilizing CSS 3D transforms
- [x] Audit Core Web Vitals and ensure 60 FPS scrolling performance
- [x] Create/update `memory.md` with session progress

## Phase 5: EmailJS Contact Form Integration
- [x] Create `scripts/email-config.js` with `PUBLIC_KEY`, `SERVICE_ID`, `TEMPLATE_ID` credentials object
- [x] Add EmailJS SDK CDN (`email.min.js`) and `scripts/email-config.js` script tag to `index.html`
- [x] Integrate `emailjs.send()` dispatch inside `initContactForm()` in `scripts/main.js`
- [x] Implement button loading state (`Sending...`), green success message, red error message, and automatic form reset

## Phase 6: 3D Sphere Scroll Sync Bugfix
- [x] Decouple `heroGroup.position` from render loop `Math.sin()` floating mutation to eliminate GSAP timeline clashing
- [x] Unify section scroll animations into a master GSAP timeline (`scrub: 0.8`) tied to document scroll
- [x] Apply continuous rotation and pointer parallax exclusively to inner `coreMesh` and `outerWireframe`
- [x] Add `ScrollTrigger.refresh()` after DOM ready and window resize for 1-to-1 scroll tracking accuracy

## Phase 7: EmailJS Non-Delivery Bugfix & Response Verification
- [x] Map both standard (`name`, `email`, `title`, `message`) and fallback template keys (`from_name`, `from_email`, `reply_to`, `subject`, `to_email`) in `templateParams`
- [x] Add strict `response.status === 200` verification before showing success message UI
- [x] Add detailed `console.log('EmailJS API Success Response:', response)` for browser console inspection
- [x] Verified live credentials via direct REST API test (`PUBLIC_KEY: p2UVxEuk_yVgYO1cH`, `SERVICE_ID: service_yspxjnt`, `TEMPLATE_ID: template_anlv48o`)

## Phase 8: Performance & Scroll Lag Elimination
- [x] Eliminate CPU rasterization bottlenecks by replacing SVG `feTurbulence` with GPU-accelerated micro-dither pattern in `styles/main.css`
- [x] Cap Three.js renderer DPR at 1.25 in `scripts/3d-world.js` to reduce GPU pixel fill rate by ~50%
- [x] Restrict 3D raycasting in `scripts/3d-world.js` to active pointer movements within the Architecture section
- [x] Optimize `scripts/liquid-button.js` WebGL2 buttons: reduce idle frame rate from 30 Hz to 8 Hz and pause rendering during active scrolling
- [x] Enable `gsap.ticker.lagSmoothing(500, 33)` in `scripts/main.js` to absorb frame delta spikes smoothly
- [x] Cache scroll bounds in both `scripts/main.js` and `scripts/3d-world.js` to eliminate layout thrashing
- [x] Cache card bounding client rects on `mouseenter` during 3D hover tilt in `scripts/main.js`

