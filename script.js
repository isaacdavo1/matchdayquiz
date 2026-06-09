(function () {
  'use strict';

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.hidden = isOpen;
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });
  }

  // Header waitlist dropdown (hover on desktop, tap to toggle on touch)
  const waitlistDropdown = document.querySelector('.waitlist-dropdown');
  const waitlistTrigger = document.querySelector('.waitlist-dropdown__trigger');
  const waitlistPanel = document.getElementById('header-waitlist-panel');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (waitlistDropdown && waitlistTrigger && waitlistPanel && !canHover) {
    waitlistTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = waitlistDropdown.classList.toggle('is-open');
      waitlistTrigger.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!waitlistDropdown.contains(e.target)) {
        waitlistDropdown.classList.remove('is-open');
        waitlistTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (waitlistDropdown && waitlistTrigger && canHover) {
    waitlistDropdown.addEventListener('mouseenter', () => {
      waitlistTrigger.setAttribute('aria-expanded', 'true');
    });

    waitlistDropdown.addEventListener('mouseleave', () => {
      waitlistTrigger.setAttribute('aria-expanded', 'false');
    });
  }

  const dropdownForm = document.querySelector('.waitlist-dropdown__form');
  if (dropdownForm) {
    dropdownForm.addEventListener('submit', handleWaitlistSubmit);
  }

  // Hero waitlist form
  const form = document.getElementById('waitlist');
  const toast = document.getElementById('toast');

  if (form) {
    form.addEventListener('submit', handleWaitlistSubmit);
  }

  function handleWaitlistSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]');
    if (email && email.value) {
      showToast();
      e.target.reset();
      waitlistDropdown?.classList.remove('is-open');
      waitlistTrigger?.setAttribute('aria-expanded', 'false');
    }
  }

  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => { toast.hidden = true; }, 400);
    }, 3000);
  }

  // Scroll reveal for cards
  const revealElements = document.querySelectorAll(
    '.feature-card, .step, .category-card, .testimonial-card, .leaderboard-card, .faq-item, .cta-card'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  // Header shadow on scroll
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener(
      'scroll',
      () => {
        header.style.boxShadow = window.scrollY > 10
          ? '0 4px 24px rgba(0, 0, 0, 0.3)'
          : 'none';
      },
      { passive: true }
    );
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
