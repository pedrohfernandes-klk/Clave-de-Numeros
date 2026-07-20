(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.nav-links');
  const toggle = document.querySelector('.menu-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const closeMenu = () => {
    if (!menu || !toggle) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
      document.body.classList.toggle('no-scroll', open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  let ticking = false;
  const updateScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (!reducedMotion) {
      const hero = document.querySelector('.hero-night');
      const range = hero ? Math.max(hero.offsetHeight * 0.8, 1) : 1;
      root.style.setProperty('--progress', Math.min(y / range, 1).toFixed(4));
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  const revealItems = document.querySelectorAll('.reveal-v2');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(item => observer.observe(item));
  }
})();
