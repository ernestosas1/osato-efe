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
const RSVP_ENDPOINT = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

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
