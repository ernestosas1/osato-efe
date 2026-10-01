// ===== Envelope intro =====
const envelopeIntro = document.getElementById('envelopeIntro');

if (envelopeIntro) {
  const envelopeSkip = document.getElementById('envelopeSkip');

  const finishIntro = () => {
    document.body.style.overflow = '';
    envelopeIntro.classList.add('hide');
    setTimeout(() => {
      envelopeIntro.style.display = 'none';
    }, 650);
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsapAvailable = typeof gsap !== 'undefined';

  if (prefersReducedMotion || !gsapAvailable) {
    // Skip the animated sequence entirely: the visitor's OS asked for reduced
    // motion, or GSAP failed to load (e.g. offline). The envelope intro still
    // plays fresh on every page load/reload otherwise (by design).
    envelopeIntro.style.display = 'none';
  } else {
    document.body.style.overflow = 'hidden';

    const envelopeBg = document.getElementById('envelopeBg');
    const envelope3d = document.getElementById('envelope3d');
    const envelopeEyebrow = document.getElementById('envelopeEyebrow');
    const envelopeHint = document.getElementById('envelopeHint');
    const envelopeCard = document.getElementById('envelopeCard');
    const envelopeFlap = document.getElementById('envelopeFlap');
    const envelopePocket = envelopeIntro.querySelector('.envelope-pocket');
    const envelopeBack = envelopeIntro.querySelector('.envelope-back');
    const envelopeSealWrap = document.getElementById('envelopeSeal');
    const sealLeft = envelopeIntro.querySelector('.seal-left');
    const sealRight = envelopeIntro.querySelector('.seal-right');
    const envelopeNamesReveal = document.getElementById('envelopeNamesReveal');
    const particleCanvas = document.getElementById('envelopeParticles');

    let opened = false;
    let masterTimeline = null;

    // Ambient background zoom (plays immediately, independent of opening the seal)
    gsap.to(envelopeBg, { scale: 1, duration: 4, ease: 'power1.out' });

    // Floating gold particles, drifting upward with a gentle sway
    const stopParticles = (() => {
      const ctx = particleCanvas.getContext('2d');
      let w, h, particles, rafId;

      function resize() {
        w = particleCanvas.width = window.innerWidth;
        h = particleCanvas.height = window.innerHeight;
      }

      function makeParticles(count) {
        return Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.4 + 0.15,
          drift: Math.random() * 0.6 - 0.3,
          phase: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.5 + 0.2,
        }));
      }

      resize();
      particles = makeParticles(60);

      function draw() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach((p) => {
          p.y -= p.speed;
          p.x += Math.sin(p.phase + p.y * 0.01) * p.drift * 0.3;
          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
          ctx.fill();
        });
        rafId = requestAnimationFrame(draw);
      }

      window.addEventListener('resize', resize);
      draw();

      return () => {
        window.removeEventListener('resize', resize);
        if (rafId) cancelAnimationFrame(rafId);
      };
    })();

    const finish = () => {
      stopParticles();
      finishIntro();
    };

    const openEnvelope = () => {
      if (opened) return;
      opened = true;
      envelopeSealWrap.style.animation = 'none';

      masterTimeline = gsap.timeline({
        onComplete: () => setTimeout(finish, 1900),
      });

      masterTimeline
        .to(envelopeEyebrow, { opacity: 0, duration: 0.3 }, 0)
        .to(envelopeHint, { opacity: 0, duration: 0.3 }, 0)
        .to(sealLeft, { xPercent: -165, yPercent: 70, rotation: -55, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
        .to(sealRight, { xPercent: 65, yPercent: 70, rotation: 55, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
        .to(envelopeFlap, { rotateX: -175, duration: 1.1, ease: 'power3.inOut' }, 0.3)
        // The rings rise up out of the pocket...
        .to(envelopeCard, { yPercent: -45, duration: 1, ease: 'power2.out' }, 0.7)
        .to(envelopePocket, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 1.1)
        // ...fade the inner back wall too, so the zooming floral background
        // shows through behind the names reveal instead of a flat dark panel...
        .to(envelopeBack, { opacity: 0, duration: 0.8, ease: 'power1.out' }, 1.3)
        // ...keep rising and grow into the hero of the transition...
        .to(envelopeCard, { yPercent: -120, scale: 1.2, duration: 1, ease: 'power2.inOut' }, 1.6)
        // ...then dissolve directly into the names reveal (no blank/black gap in between).
        .to(envelopeCard, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 2.3)
        .fromTo(envelopeNamesReveal, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, 2.0);
    };

    envelopeSealWrap.addEventListener('click', openEnvelope);
    envelopeSealWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });

    envelopeSkip.addEventListener('click', () => {
      if (masterTimeline) masterTimeline.kill();
      gsap.killTweensOf([
        envelopeBg, envelopeEyebrow, envelopeHint, sealLeft, sealRight,
        envelopeFlap, envelopeCard, envelopePocket, envelope3d, envelopeNamesReveal,
      ]);
      finish();
    });
  }
}

// ===== Sticky nav background on scroll =====
const siteHeader = document.querySelector('.site-header');

function updateHeaderScrolled() {
  siteHeader.classList.toggle('scrolled', window.scrollY > 40);
}

updateHeaderScrolled();
window.addEventListener('scroll', updateHeaderScrolled);

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Floating cards: reveal as they scroll into view =====
const revealCards = document.querySelectorAll('.timeline-card, .schedule-card');

if (revealCards.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealCards.forEach(card => revealObserver.observe(card));
}

// ===== Gallery slider =====
const gallerySlides = document.querySelectorAll('.gallery-slide');
const galleryPrev = document.querySelector('.gallery-prev');
const galleryNext = document.querySelector('.gallery-next');

if (gallerySlides.length) {
  let currentSlide = 0;

  function showSlide(index) {
    gallerySlides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  }

  function goToNextSlide() {
    currentSlide = (currentSlide + 1) % gallerySlides.length;
    showSlide(currentSlide);
  }

  function goToPrevSlide() {
    currentSlide = (currentSlide - 1 + gallerySlides.length) % gallerySlides.length;
    showSlide(currentSlide);
  }

  let sliderTimer = setInterval(goToNextSlide, 2000);

  function restartSliderTimer() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(goToNextSlide, 2000);
  }

  galleryNext.addEventListener('click', () => {
    goToNextSlide();
    restartSliderTimer();
  });

  galleryPrev.addEventListener('click', () => {
    goToPrevSlide();
    restartSliderTimer();
  });
}

// ===== Countdown timer =====
const countdownEl = document.getElementById('countdown');
const weddingDate = new Date(countdownEl.dataset.weddingDate).getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = weddingDate - now;

  if (diff <= 0) {
    countdownEl.innerHTML = '<p style="font-family: var(--font-serif); font-size: 1.5rem;">Today\'s the day!</p>';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== RSVP form submission =====
// EDIT ME: paste the Web App URL you get after deploying the Google Apps
// Script from SETUP.md. Leave as-is and the form will just show an error
// telling you it isn't configured yet.
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzAWTDBLpNFJiVtSBfjIELpy3iPgrVd8cvuOFdY14LsXNm_qyM4TjFdIyQ-HqtZD6Gk/exec';

const rsvpForm = document.getElementById('rsvpForm');
const rsvpStatus = document.getElementById('rsvpStatus');

rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!RSVP_ENDPOINT || RSVP_ENDPOINT.startsWith('PASTE_')) {
    rsvpStatus.textContent = 'RSVP form is not connected yet — see SETUP.md.';
    rsvpStatus.className = 'rsvp-status error';
    return;
  }

  const submitBtn = rsvpForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  rsvpStatus.textContent = 'Sending...';
  rsvpStatus.className = 'rsvp-status';

  const formData = new FormData(rsvpForm);

  try {
    await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors', // Apps Script web apps don't return CORS headers
      body: formData,
    });

    // With mode: 'no-cors' we can't read the response, so we optimistically
    // assume success — Apps Script either accepts the POST or the fetch
    // itself throws (network/URL error), which the catch block below handles.
    rsvpStatus.textContent = 'Thank you! Your RSVP has been received.';
    rsvpStatus.className = 'rsvp-status success';
    rsvpForm.reset();
  } catch (err) {
    rsvpStatus.textContent = 'Something went wrong — please try again or contact us directly.';
    rsvpStatus.className = 'rsvp-status error';
  } finally {
    submitBtn.disabled = false;
  }
});
