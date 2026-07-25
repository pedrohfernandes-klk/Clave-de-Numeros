(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.ClaveHomepageHero = api;
    api.init(document, window);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const OPENING = Object.freeze({
    documents: { x: -18, y: 12, rotate: -1.5, scale: 1, opacity: 0.88 },
    frame: { x: 0, y: 6, rotate: 0, scale: 0.992, opacity: 0.96 },
    rows: { x: 14, y: 0, rotate: 0, scale: 1, opacity: 0.58 },
    connectors: { x: 12, y: 0, rotate: 0, scale: 0.72, opacity: 0.22 },
    validation: { x: 0, y: 12, rotate: 0, scale: 0.82, opacity: 0.12 },
    signals: { x: 8, y: -6, rotate: 0, scale: 0.94, opacity: 0.4 }
  });

  const FINAL = Object.freeze({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
  const LAYERS = Object.freeze(['documents', 'frame', 'rows', 'connectors', 'validation', 'signals']);
  const clamp01 = value => Math.min(1, Math.max(0, value));
  const mix = (from, to, progress) => from + (to - from) * progress;
  const round = value => Math.round(value * 1000) / 1000;

  function sceneProgress(rectTop, viewportHeight, distanceFactor) {
    const start = viewportHeight * 0.12;
    const distance = viewportHeight * distanceFactor;
    return clamp01((start - rectTop) / distance);
  }

  function layerFrame(name, progress, intensity) {
    const from = OPENING[name] || FINAL;
    const p = clamp01(progress);
    const strength = Math.max(0, Math.min(1, intensity));
    return {
      x: round(mix(from.x * strength, FINAL.x, p)),
      y: round(mix(from.y * strength, FINAL.y, p)),
      rotate: round(mix(from.rotate * strength, FINAL.rotate, p)),
      scale: round(mix(1 + (from.scale - 1) * strength, FINAL.scale, p)),
      opacity: round(mix(1 + (from.opacity - 1) * strength, FINAL.opacity, p))
    };
  }

  function shouldEnhance(options) {
    return !options.reducedMotion && options.hasRAF && options.hasObject && options.hasObserver;
  }

  function activeLayerNames(width) {
    if (width <= 760) return ['documents', 'rows', 'validation'];
    if (width <= 980) return ['documents', 'rows', 'connectors', 'validation'];
    return [...LAYERS];
  }

  function applyFrame(layer, frame) {
    layer.style.transform = `translate3d(${frame.x}px, ${frame.y}px, 0) rotate(${frame.rotate}deg) scale(${frame.scale})`;
    layer.style.opacity = String(frame.opacity);
  }

  function resetLayer(layer) {
    layer.style.removeProperty('transform');
    layer.style.removeProperty('opacity');
  }

  function init(rootDocument, rootWindow) {
    const scene = rootDocument.querySelector('[data-homepage-hero]');
    const art = scene && scene.querySelector('[data-homepage-hero-art]');
    const heroRoot = scene && (scene.closest('.hero') || scene);
    const reducedMotion = rootWindow.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasObserver = typeof rootWindow.IntersectionObserver === 'function';
    if (!shouldEnhance({
      reducedMotion,
      hasRAF: typeof rootWindow.requestAnimationFrame === 'function',
      hasObject: Boolean(scene && art),
      hasObserver
    })) return null;

    let layers = null;
    let framePending = false;
    let visible = false;
    let destroyed = false;

    const intensity = () => rootWindow.innerWidth <= 760 ? 0.55 : rootWindow.innerWidth <= 980 ? 0.78 : 1;
    const distanceFactor = () => rootWindow.innerWidth <= 760 ? 0.58 : 0.72;

    const draw = () => {
      framePending = false;
      if (destroyed || !visible || !layers) return;
      const progress = sceneProgress(scene.getBoundingClientRect().top, rootWindow.innerHeight, distanceFactor());
      heroRoot.style.setProperty('--hero-progress', progress.toFixed(3));
      const activeLayers = new Set(activeLayerNames(rootWindow.innerWidth));
      Object.entries(layers).forEach(([name, layer]) => {
        if (activeLayers.has(name)) applyFrame(layer, layerFrame(name, progress, intensity()));
        else resetLayer(layer);
      });
      scene.classList.toggle('is-resolved', progress >= 0.98);
      heroRoot.classList.toggle('is-hero-resolved', progress >= 0.98);
    };

    const schedule = () => {
      if (!framePending && !destroyed && visible && layers) {
        framePending = true;
        rootWindow.requestAnimationFrame(draw);
      }
    };

    const observer = new rootWindow.IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) schedule();
    }, { rootMargin: '20% 0px' });

    const mount = () => {
      if (layers) return;
      let svgDocument;
      try {
        svgDocument = art.contentDocument;
      } catch (error) {
        return;
      }
      if (!svgDocument) return;
      const found = [...svgDocument.querySelectorAll('[data-hero-layer]')];
      const entries = found.map(layer => [layer.getAttribute('data-hero-layer'), layer]);
      if (found.length !== LAYERS.length || !LAYERS.every(name => entries.some(entry => entry[0] === name))) return;
      layers = Object.fromEntries(entries);
      scene.classList.add('is-motion-ready');
      schedule();
    };

    observer.observe(scene);
    art.addEventListener('load', mount, { once: true });
    rootWindow.addEventListener('load', mount, { once: true });
    mount();
    rootWindow.addEventListener('scroll', schedule, { passive: true });
    rootWindow.addEventListener('resize', schedule, { passive: true });
    schedule();

    return {
      destroy() {
        destroyed = true;
        observer.disconnect();
        art.removeEventListener('load', mount);
        rootWindow.removeEventListener('load', mount);
        rootWindow.removeEventListener('scroll', schedule);
        rootWindow.removeEventListener('resize', schedule);
        if (layers) Object.values(layers).forEach(resetLayer);
        if (typeof scene.classList.remove === 'function') {
          scene.classList.remove('is-motion-ready', 'is-resolved');
        }
        if (typeof heroRoot.classList.remove === 'function') {
          heroRoot.classList.remove('is-hero-resolved');
        }
        if (typeof heroRoot.style.removeProperty === 'function') {
          heroRoot.style.removeProperty('--hero-progress');
        }
        layers = null;
      }
    };
  }

  return { clamp01, sceneProgress, layerFrame, activeLayerNames, shouldEnhance, init };
}));
