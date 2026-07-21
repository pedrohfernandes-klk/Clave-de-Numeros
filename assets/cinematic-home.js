(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.nav-links');
  const toggle = document.querySelector('.menu-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopQuery = window.matchMedia('(min-width: 1051px)');
  const inertTargets = [
    document.querySelector('main'),
    document.querySelector('.footer'),
    document.querySelector('.brand'),
    document.querySelector('.lang'),
    document.querySelector('.nav-cta')
  ].filter(Boolean);

  const isMenuOpen = () => toggle?.getAttribute('aria-expanded') === 'true';

  const setMenuState = (open, restoreFocus = false) => {
    if (!menu || !toggle) return;
    const label = open ? toggle.dataset.closeLabel : toggle.dataset.openLabel;

    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', label);
    toggle.textContent = label;
    document.body.classList.toggle('no-scroll', open);
    inertTargets.forEach(element => { element.inert = open; });

    if (!open && restoreFocus) {
      toggle.focus();
    }
  };

  if (toggle && menu) {
    toggle.addEventListener('click', event => {
      event.preventDefault();
      setMenuState(!isMenuOpen());
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuState(false)));

    window.addEventListener('keydown', event => {
      if (!isMenuOpen()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuState(false, true);
        return;
      }
      if (event.key === 'Tab') {
        const links = [...menu.querySelectorAll('a')];
        const first = links[0];
        const last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          toggle.focus();
        } else if (event.shiftKey && document.activeElement === toggle) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === toggle) {
          event.preventDefault();
          first.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          toggle.focus();
        }
      }
    });

    desktopQuery.addEventListener('change', event => {
      if (event.matches && isMenuOpen()) setMenuState(false);
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
})();
