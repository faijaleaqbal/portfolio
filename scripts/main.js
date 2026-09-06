/**
 * ==========================================================================
 * MAIN INTERACTION & MOTION CONTROLLER
 * Md Faijal Eaqbal Portfolio · Cinematic Engineering Edition
 * Lenis smooth scroll · GSAP choreography · Magnetic cursor · EmailJS pipeline
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initLenisAndGSAP();
  initCustomCursor();
  initNavigation();
  initLiveClock();
  initScrollChapterSpy();
  initMotionChoreography();
  initContactForm();
});

/* --------------------------------------------------------------------------
   01. PRELOADER & BOOT SEQUENCE
   -------------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const barFill = document.getElementById('preloader-bar-fill');
  const pctText = document.getElementById('preloader-percent');
  if (!preloader) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 18) + 12;
    if (progress > 100) progress = 100;

    if (barFill) barFill.style.width = `${progress}%`;
    if (pctText) pctText.textContent = `${progress}%`;

    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('is-loaded');
        document.body.classList.remove('is-locked');
      }, 250);
    }
  }, 45);
}

/* --------------------------------------------------------------------------
   02. LENIS SMOOTH SCROLL & GSAP SYNC
   -------------------------------------------------------------------------- */
let lenisInstance = null;

function initLenisAndGSAP() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (typeof Lenis !== 'undefined' && !reduceMotion && !isTouch) {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

    window.__lenis = lenisInstance;

    // Connect Lenis to GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenisInstance.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  } else if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Smooth anchor scrolling handler
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      let targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      if (targetId === '#work') targetId = '#projects';
      if (targetId === '#journey') targetId = '#chronology';
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = window.innerWidth < 768 ? -100 : -72;
        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, { offset: headerOffset });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   03. PRECISION CUSTOM CURSOR (Desktop Fine Pointer)
   -------------------------------------------------------------------------- */
function initCustomCursor() {
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!hasFinePointer) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  }, { passive: true });

  // Smooth lerp loop for the trailing precision ring
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states
  const interactives = document.querySelectorAll('a, button, input, select, textarea, [data-magnetic], .project-dossier, .scope-card');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

/* --------------------------------------------------------------------------
   04. RESTORED TOP NAVIGATION
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('scroll-progress-bar');

  // Scroll listener for header blur & progress bar
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (header) {
      header.classList.toggle('scrolled', scrollY > 24);
    }

    if (progressBar) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      progressBar.style.width = `${pct}%`;
    }
  }, { passive: true });

  // Footer Year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* --------------------------------------------------------------------------
   05. LIVE CLOCK — MALDA, INDIA (IST UTC+5:30)
   -------------------------------------------------------------------------- */
function initLiveClock() {
  const clockEl = document.getElementById('live-time-ist');
  if (!clockEl) return;

  function updateTime() {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    clockEl.textContent = `${new Intl.DateTimeFormat('en-GB', options).format(now)} IST`;
  }

  updateTime();
  setInterval(updateTime, 1000);
}

/* --------------------------------------------------------------------------
   06. SCROLL CHAPTER SPY
   -------------------------------------------------------------------------- */
function initScrollChapterSpy() {
  const chapters = document.querySelectorAll('section[id]');
  const chapterIndicator = document.getElementById('current-chapter-text');
  const navLinks = document.querySelectorAll('.nav-item-link');
  const navContainer = document.querySelector('.site-nav');
  if (!chapters.length) return;

  const chapterNames = {
    'home': '01 // OVERVIEW',
    'about': '02 // PHILOSOPHY',
    'scope': '03 // SCOPE',
    'projects': '04 // SELECTED WORK',
    'work': '04 // SELECTED WORK',
    'architecture': '05 // SYSTEM ARCHITECTURE',
    'stack': '06 // SYSTEM MATRIX',
    'chronology': '07 // CHRONOLOGY',
    'journey': '07 // CHRONOLOGY',
    'contact': '08 // TRANSMISSION'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (chapterIndicator && chapterNames[id]) {
          chapterIndicator.textContent = chapterNames[id];
        }
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          const isMatch = href === `#${id}` ||
            (id === 'projects' && href === '#work') ||
            (id === 'chronology' && href === '#journey');
          link.classList.toggle('active', isMatch);
          if (isMatch && navContainer && window.innerWidth < 768) {
            const offset = link.offsetLeft - 24;
            navContainer.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
          }
        });
      }
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

  chapters.forEach((chapter) => observer.observe(chapter));
}

/* --------------------------------------------------------------------------
   07. GSAP MOTION & SCROLLTRIGGER REVEALS
   -------------------------------------------------------------------------- */
function initMotionChoreography() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (reduceMotion) {
    document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach((el) => {
      el.classList.add('is-revealed');
    });
    return;
  }

  // Hero Opening Entrance (GSAP)
  if (typeof gsap !== 'undefined') {
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from('.hero-status-pill', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.2)
      .from('.hero-title', { y: 35, autoAlpha: 0, duration: 1.1 }, 0.35)
      .from('.hero-statement', { y: 24, autoAlpha: 0, duration: 0.9 }, 0.5)
      .from('.hero-cta-group', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.65)
      .from('.hero-metrics', { y: 20, autoAlpha: 0, duration: 0.9 }, 0.8)
      .from('.hero-dossier-card', { y: 40, autoAlpha: 0, duration: 1.2 }, 0.5);
  }

  // Robust Section-Level Observer Reveals
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

  document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach((el) => {
    revealObserver.observe(el);
  });

  // Subtle 3D Card Hover Tilt (Desktop Only)
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (isFinePointer && typeof gsap !== 'undefined') {
    const tiltCards = document.querySelectorAll('.hero-dossier-card, .project-dossier');
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotationY: x * 6,
          rotationX: -y * 5,
          duration: 0.4,
          ease: 'power1.out',
          transformPerspective: 1000
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
        });
      });
    });
  }
}

/* --------------------------------------------------------------------------
   08. CONTACT TRANSMISSION PIPELINE & EMAILJS SUBMISSION
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const serviceInput = document.getElementById('contact-service');
  const budgetInput = document.getElementById('contact-budget');
  const messageInput = document.getElementById('contact-message');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-contact-btn');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = (input, errorEl, condition) => {
    if (!input) return condition;
    input.classList.toggle('invalid', !condition);
    if (errorEl) errorEl.classList.toggle('visible', !condition);
    return condition;
  };

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      validate(nameInput, nameError, nameInput.value.trim().length >= 2);
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      validate(emailInput, emailError, emailRegex.test(emailInput.value.trim()));
    });
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => {
      validate(messageInput, messageError, messageInput.value.trim().length >= 10);
    });
  }

  // Initialize EmailJS when configured
  if (typeof emailjs !== 'undefined' && typeof EMAILJS_CONFIG !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY) {
    try {
      emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
    } catch (err) {
      console.warn('[EmailJS] Init warning:', err);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isNameValid = validate(nameInput, nameError, nameInput.value.trim().length >= 2);
    const isEmailValid = validate(emailInput, emailError, emailRegex.test(emailInput.value.trim()));
    const isMessageValid = validate(messageInput, messageError, messageInput.value.trim().length >= 10);

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      if (formStatus) {
        formStatus.className = 'form-status-alert error visible';
        formStatus.textContent = 'Please correct the highlighted fields before sending.';
      }
      return;
    }

    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Transmitting...';
    }

    if (formStatus) {
      formStatus.className = 'form-status-alert';
      formStatus.textContent = '';
    }

    const inquiryData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      service: serviceInput ? serviceInput.value || 'General Inquiry' : 'General Inquiry',
      budget: budgetInput ? budgetInput.value || 'Not specified' : 'Not specified',
      message: messageInput.value.trim()
    };

    let delivered = false;
    let deliveryChannel = '';

    // Channel 1: Attempt EmailJS if credentials and library exist
    const hasCredentials = typeof emailjs !== 'undefined' &&
                           typeof EMAILJS_CONFIG !== 'undefined' &&
                           EMAILJS_CONFIG.SERVICE_ID &&
                           EMAILJS_CONFIG.TEMPLATE_ID;

    if (hasCredentials) {
      try {
        const templateParams = {
          name: inquiryData.name,
          email: inquiryData.email,
          title: 'Engineering Inquiry via Portfolio',
          message: inquiryData.message,
          from_name: inquiryData.name,
          from_email: inquiryData.email,
          reply_to: inquiryData.email,
          subject: 'Engineering Inquiry',
          to_name: 'Md Faijal Eaqbal',
          to_email: 'faijaleaqbal@gmail.com',
          service: inquiryData.service,
          budget: inquiryData.budget
        };

        const response = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          templateParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        );

        if (response && (response.status === 200 || response.text === 'OK')) {
          delivered = true;
          deliveryChannel = 'email';
        }
      } catch (emailErr) {
        console.warn('[Contact] EmailJS primary channel unavailable, engaging server fallback:', emailErr);
      }
    }

    // Channel 2: Direct Server API Dispatch (Instant Telegram Notification & Persistent Storage)
    if (!delivered) {
      try {
        const serverRes = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inquiryData)
        });

        if (serverRes.ok) {
          const resJson = await serverRes.json();
          if (resJson.success) {
            delivered = true;
            deliveryChannel = 'server';
          }
        }
      } catch (serverErr) {
        console.warn('[Contact] Server dispatch channel error:', serverErr);
      }
    }

    // Process Delivery Status
    if (delivered) {
      if (formStatus) {
        formStatus.className = 'form-status-alert success visible';
        formStatus.textContent = 'Transmission successful — direct dispatch sent to Md Faijal Eaqbal. Response within 6 hours.';
      }
      form.reset();
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    } else {
      // Channel 3: Interactive Fail-Safe with prefilled Gmail / Mailto actions
      const encSub = encodeURIComponent(`Portfolio Inquiry from ${inquiryData.name} [${inquiryData.service}]`);
      const encBody = encodeURIComponent(
        `Hi Faijal,\n\nName: ${inquiryData.name}\nEmail: ${inquiryData.email}\nService: ${inquiryData.service}\nBudget: ${inquiryData.budget}\n\nMessage:\n${inquiryData.message}\n`
      );
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=faijaleaqbal@gmail.com&su=${encSub}&body=${encBody}`;
      const mailtoUrl = `mailto:faijaleaqbal@gmail.com?subject=${encSub}&body=${encBody}`;

      if (formStatus) {
        formStatus.className = 'form-status-alert error visible';
        formStatus.innerHTML = `
          <div style="margin-bottom:0.4rem;"><strong>Transmission could not complete automatically.</strong> Please dispatch directly with 1-click:</div>
          <div style="display:flex;gap:0.6rem;flex-wrap:wrap;margin-top:0.5rem;">
            <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 0.85rem;background:#ef4444;color:#fff;border-radius:4px;text-decoration:none;font-weight:600;font-size:0.75rem;"><i class="fa-brands fa-google"></i> Open Pre-filled in Gmail</a>
            <a href="${mailtoUrl}" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 0.85rem;background:#1e293b;border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:4px;text-decoration:none;font-weight:600;font-size:0.75rem;"><i class="fa-solid fa-envelope"></i> Open Default Mail</a>
          </div>
        `;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  });
}

/* --------------------------------------------------------------------------
   09. INTERACTIVE TECHNICAL ARCHITECTURE VISUALIZER
   -------------------------------------------------------------------------- */
const ARCH_LAYERS_DATA = [
  {
    tier: '01 // CLIENT TIER',
    headline: 'Telegram Mini App, Web & Discord Clients',
    desc: 'Edge consumer interfaces engineered for sub-50ms interaction response. Implements TON Connect 2.0 cryptographic wallet handshakes, mobile touch ergonomics, and resilient WebSocket reconnect loops.',
    metrics: [
      { label: 'ROUNDTRIP LATENCY', value: '< 45ms' },
      { label: 'TRANSPORT', value: 'WSS / HTTPS' },
      { label: 'BUNDLE FOOTPRINT', value: '< 180KB' },
      { label: 'CLIENT ISOLATION', value: 'JWT / Session' }
    ],
    decisions: [
      'Custom TON provider abstraction prevents third-party wallet spoofing.',
      'Lightweight Vanilla JS and strict asset minimization keeps initial paint under 350ms.',
      'Idempotency tokens prevent duplicate state transitions during mobile network swaps.'
    ]
  },
  {
    tier: '02 // REVERSE PROXY & EDGE',
    headline: 'Nginx Reverse Proxy, Let\'s Encrypt SSL & DDoS Filter',
    desc: 'Front-line entry bastion terminating TLS 1.3 across all subdomains (faijaleaqbal, readstacks, blitzgamezone, maldacollege). Features rate limiting buffers, security headers, and static caching.',
    metrics: [
      { label: 'SSL PROTOCOL', value: 'TLS 1.3 Strict' },
      { label: 'BUFFER CAPACITY', value: '256KB Upstream' },
      { label: 'MAX REQ SIZE', value: '50MB Streaming' },
      { label: 'UPTIME SLA', value: '99.98%' }
    ],
    decisions: [
      'Configured dedicated proxy buffer sizes to eliminate HTTP 502 bad gateway spikes from oversized OAuth tokens.',
      'Strict SSL cipher suites with DH parameters generated on-host.',
      'Location-based proxy pass isolates each project repository into independent internal network ports.'
    ]
  },
  {
    tier: '03 // API & BOT GATEWAY',
    headline: 'Express.js, FastAPI & Async Dispatchers',
    desc: 'Central routing and event arbitration bus. Ingests webhook callbacks from Telegram and Discord gateways, parses REST commands, and enforces role-based access control.',
    metrics: [
      { label: 'EVENT ROUTING', value: '158 Slash Cmds' },
      { label: 'CONCURRENCY', value: 'Asyncio Non-Block' },
      { label: 'AUTH ENGINE', value: 'JWT + Hash Verification' },
      { label: 'MIDDLEWARE', value: 'CORS + Rate Limit' }
    ],
    decisions: [
      'Segregated bot polling and webhook ingestion to avoid CPU starvation on single-threaded workers.',
      'Unified error formatting across all endpoints for deterministic front-end handling.',
      'Memory-efficient stream piping directly into response sockets for audio and large payloads.'
    ]
  },
  {
    tier: '04 // WORKER ENGINES & DAEMONS',
    headline: 'Node.js Cluster, BeautifulSoup4 & Cron Daemons',
    desc: 'Asynchronous background processes executing scheduled tasks, portal scraping loops, anti-fraud evaluation, and notification queue dispatch.',
    metrics: [
      { label: 'SCRAPE CYCLE', value: 'Continuous Cron' },
      { label: 'PROCESS MODEL', value: 'PM2 Cluster' },
      { label: 'RETRY POLICY', value: 'Exponential Backoff' },
      { label: 'DEDUPLICATION', value: 'SHA-256 Hash' }
    ],
    decisions: [
      'HTML scraping parses DOM trees with fallback selectors to withstand college website markup changes.',
      'Content hashing prevents broadcast notification storms when only whitespace changes on upstream notices.',
      'Automated restart on memory threshold (>250MB) prevents long-term daemon memory leaks.'
    ]
  },
  {
    tier: '05 // PERSISTENCE & VECTOR STORAGE',
    headline: 'PostgreSQL, SQLite & Vectra Vector Spaces',
    desc: 'Multi-model data persistence layer. Relational transaction ledgers in PostgreSQL/SQLite combined with per-user isolated vector embeddings in Vectra for semantic document retrieval.',
    metrics: [
      { label: 'RELATIONAL STORE', value: 'PostgreSQL / SQLite' },
      { label: 'VECTOR SPACE', value: 'vectra Cosine' },
      { label: 'INDEX TYPE', value: 'HNSW / Flat Vector' },
      { label: 'TRANSACTIONS', value: 'ACID Compliant' }
    ],
    decisions: [
      'Zero-cost local vector persistence using vectra avoids recurring cloud vector DB subscription costs.',
      'Per-user isolated vector stores guarantee 100% data confidentiality between document workspaces.',
      'Automated nightly SQLite WAL checkpointing and tarball backups to secure storage.'
    ]
  },
  {
    tier: '06 // LOCAL AI INFERENCE ENGINE',
    headline: 'Ollama Llama 3.2 & Token Budgeting Engine',
    desc: 'Self-hosted local inference runtime executing Llama 3.2 models without external API subscriptions. Features token budgeting, context chunking, and streaming SSE tokens.',
    metrics: [
      { label: 'LOCAL MODEL', value: 'Llama 3.2 (Ollama)' },
      { label: 'TOKEN STREAMING', value: 'Server-Sent Events' },
      { label: 'EXTERNAL API COST', value: '$0.00 / Zero Rent' },
      { label: 'CONTEXT WINDOW', value: '8K Budgeted' }
    ],
    decisions: [
      '100% local processing eliminates cloud API rate limits, downtime, and recurring billing liabilities.',
      'Dynamic chunk pruning ensures prompt context never overflows inference context budget.',
      'Streaming responses streamed straight to client sockets for instantaneous perceived response.'
    ]
  },
  {
    tier: '07 // HOST INFRASTRUCTURE & LINUX CORE',
    headline: 'Ubuntu Cloud Host, PM2 & Systemd Services',
    desc: 'Underlying cloud Linux environment hosting all microservices, bots, reverse proxies, and local AI runtimes with 24/7 autonomous recovery and telemetry monitoring.',
    metrics: [
      { label: 'OS ENVIRONMENT', value: 'Ubuntu Linux LTS' },
      { label: 'PROCESS CONTROL', value: 'PM2 + Systemd' },
      { label: 'CONTAINERS', value: 'Docker & Compose' },
      { label: 'RECOVERY', value: 'Autonomous Watchdog' }
    ],
    decisions: [
      'Custom bash backup automation scripts with automated exclusions for logs and build caches.',
      'Strict unprivileged user permissions (azureuser) with sudo privilege isolation.',
      'Direct PM2 cluster zero-downtime reloads during git pull deployments.'
    ]
  }
];

function initArchitectureVisualizer() {
  const rows = document.querySelectorAll('.arch-interactive-row');
  const titleEl = document.getElementById('arch-detail-tier');
  const headlineEl = document.getElementById('arch-detail-headline');
  const descEl = document.getElementById('arch-detail-desc');
  const metricsEl = document.getElementById('arch-detail-metrics');
  const decisionsEl = document.getElementById('arch-detail-decisions');

  if (!rows.length || !titleEl) return;

  function updateDetailView(idx) {
    const data = ARCH_LAYERS_DATA[idx];
    if (!data) return;

    titleEl.textContent = data.tier;
    headlineEl.textContent = data.headline;
    descEl.textContent = data.desc;

    if (metricsEl) {
      metricsEl.innerHTML = data.metrics.map(m => `
        <div class="arch-metric-box">
          <span class="metric-lbl">${m.label}</span>
          <span class="metric-val">${m.value}</span>
        </div>
      `).join('');
    }

    if (decisionsEl) {
      decisionsEl.innerHTML = data.decisions.map(d => `
        <li>
          <i class="fa-solid fa-code-branch" aria-hidden="true"></i>
          <span>${d}</span>
        </li>
      `).join('');
    }

    rows.forEach(r => r.classList.remove('is-active'));
    const activeRow = document.querySelector(`[data-arch-layer="${idx}"]`);
    if (activeRow) activeRow.classList.add('is-active');

    // Notify 3D World Engine
    if (typeof window.selectArchitectureLayer === 'function') {
      window.selectArchitectureLayer(idx);
    }
  }

  rows.forEach((row) => {
    row.addEventListener('click', () => {
      const idx = parseInt(row.getAttribute('data-arch-layer'), 10);
      updateDetailView(idx);
      playSynthesizedClick(600);
    });

    row.addEventListener('mouseenter', () => {
      const idx = parseInt(row.getAttribute('data-arch-layer'), 10);
      if (typeof window.selectArchitectureLayer === 'function') {
        window.selectArchitectureLayer(idx);
      }
    });
  });

  // Default to Layer 0 (Client)
  updateDetailView(0);
}

/* --------------------------------------------------------------------------
   10. PROJECT PROGRESSIVE DISCLOSURE TABS
   -------------------------------------------------------------------------- */
function initProjectTabs() {
  const dossiers = document.querySelectorAll('.project-dossier');
  dossiers.forEach((dossier) => {
    const tabBtns = dossier.querySelectorAll('.dossier-tab-btn');
    const panes = dossier.querySelectorAll('.dossier-pane');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('is-active'));
        panes.forEach(p => p.classList.remove('is-active'));

        btn.classList.add('is-active');
        const activePane = dossier.querySelector(`[data-pane="${targetTab}"]`);
        if (activePane) activePane.classList.add('is-active');
      });
    });
  });
}

// DOM listener initialization
document.addEventListener('DOMContentLoaded', () => {
  initArchitectureVisualizer();
  initProjectTabs();
});

/* --------------------------------------------------------------------------
   11. TACTILE 3D BUTTONS PHYSICS & TILT DYNAMICS
   -------------------------------------------------------------------------- */
function init3DButtons() {
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouch) return;

  const buttons = document.querySelectorAll(
    '.btn-primary, .btn-secondary, .btn-header-cta, .btn-submit-transmission, .dossier-tab-btn, .arch-interactive-row, .signal-channel-card, .footer-social-btn, .nav-item-link, .brand-anchor, .hud-spatial-badge'
  );

  buttons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      const tiltX = -normY * 12;
      const tiltY = normX * 12;

      btn.style.transform = `perspective(600px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(8px) translateY(-3px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init3DButtons();
});
