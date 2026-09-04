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
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, { offset: -60 });
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
   04. NAVIGATION & MOBILE OVERLAY
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.getElementById('site-header');
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');
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

  // Mobile menu toggle
  if (toggleBtn && navMenu) {
    const toggleMenu = (open) => {
      toggleBtn.classList.toggle('is-active', open);
      navMenu.classList.toggle('is-open', open);
      toggleBtn.setAttribute('aria-expanded', String(open));
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('is-open');
      toggleMenu(!isOpen);
    });

    navMenu.querySelectorAll('.nav-item-link').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        toggleMenu(false);
        toggleBtn.focus();
      }
    });
  }

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
  if (!chapters.length) return;

  const chapterNames = {
    'home': '01 // OVERVIEW',
    'about': '02 // PHILOSOPHY',
    'scope': '03 // SCOPE',
    'projects': '04 // SELECTED WORK',
    'stack': '05 // SYSTEM MATRIX',
    'chronology': '06 // CHRONOLOGY',
    'contact': '07 // TRANSMISSION'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (chapterIndicator && chapterNames[id]) {
          chapterIndicator.textContent = chapterNames[id];
        }
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
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
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
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

    const hasCredentials = typeof emailjs !== 'undefined' &&
                           typeof EMAILJS_CONFIG !== 'undefined' &&
                           EMAILJS_CONFIG.SERVICE_ID &&
                           EMAILJS_CONFIG.TEMPLATE_ID;

    if (!hasCredentials) {
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
        if (formStatus) {
          formStatus.className = 'form-status-alert success visible';
          formStatus.textContent = 'Transmission noted. (Demo mode fallback)';
        }
        form.reset();
      }, 700);
      return;
    }

    try {
      const templateParams = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        title: 'Engineering Inquiry via Portfolio',
        message: messageInput.value.trim(),
        from_name: nameInput.value.trim(),
        from_email: emailInput.value.trim(),
        reply_to: emailInput.value.trim(),
        subject: 'Engineering Inquiry',
        to_name: 'Md Faijal Eaqbal',
        to_email: 'faijaleaqbal@gmail.com',
        service: serviceInput ? serviceInput.value || 'General Inquiry' : 'General Inquiry',
        budget: budgetInput ? budgetInput.value || 'Not specified' : 'Not specified'
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      if (response && (response.status === 200 || response.text === 'OK')) {
        if (formStatus) {
          formStatus.className = 'form-status-alert success visible';
          formStatus.textContent = 'Transmission successful — direct email dispatched to faijaleaqbal@gmail.com. Response within 6 hours.';
        }
        form.reset();
      } else {
        throw new Error(`EmailJS status ${response ? response.status : 'error'}`);
      }
    } catch (err) {
      console.error('[EmailJS] Transmission error:', err);
      if (formStatus) {
        formStatus.className = 'form-status-alert error visible';
        formStatus.innerHTML = `Transmission could not complete automatically. Please write directly to <a href="mailto:faijaleaqbal@gmail.com" style="text-decoration:underline;color:#fff;">faijaleaqbal@gmail.com</a>.`;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    }
  });
}
