/* ============================================================
   METABODY CLUB — JavaScript
   - Navbar scroll effect
   - Mobile menu toggle
   - FAQ accordion
   - Scroll-triggered fade-up animations
   ============================================================ */

// ── NAVBAR SCROLL ──────────────────────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ── MOBILE MENU ────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── FAQ ACCORDION ──────────────────────────────────────────
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer   = item.querySelector('.faq-answer');

  question.addEventListener('click', () => {
    const isOpen = question.getAttribute('aria-expanded') === 'true';

    // Close all others
    faqItems.forEach(other => {
      if (other !== item) {
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-answer').classList.remove('open');
      }
    });

    // Toggle current
    question.setAttribute('aria-expanded', String(!isOpen));
    answer.classList.toggle('open', !isOpen);
  });
});

// ── SCROLL-TRIGGERED FADE-UP ANIMATIONS ───────────────────
// Add fade-up classes to target elements
const fadeTargets = [
  { selector: '.proof-item',      delay: true  },
  { selector: '.result-card',     delay: true  },
  { selector: '.service-card',    delay: true  },
  { selector: '.step',            delay: true  },
  { selector: '.team-card',       delay: true  },
  { selector: '.plan-card',       delay: true  },
  { selector: '.faq-item',        delay: false },
  { selector: '.section-title',   delay: false },
  { selector: '.results-testimonial', delay: false },
];

const delays = ['', 'fade-up-delay-1', 'fade-up-delay-2', 'fade-up-delay-3', 'fade-up-delay-4'];

fadeTargets.forEach(({ selector, delay }) => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('fade-up');
    if (delay) {
      el.classList.add(delays[Math.min(i % 4, 4)]);
    }
  });
});

// Intersection Observer
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── SMOOTH ACTIVE NAV HIGHLIGHTING ────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color = 'var(--b-light)';
          }
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));
