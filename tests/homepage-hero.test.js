'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const hero = require('../assets/homepage-hero.js');


test('clamp01 bounds progress', () => {
  assert.equal(hero.clamp01(-0.5), 0);
  assert.equal(hero.clamp01(0.4), 0.4);
  assert.equal(hero.clamp01(2), 1);
});


test('sceneProgress resolves within seventy-two percent of a viewport', () => {
  assert.equal(hero.sceneProgress(120, 1000, 0.72), 0);
  assert.equal(hero.sceneProgress(-600, 1000, 0.72), 1);
  assert.ok(Math.abs(hero.sceneProgress(-240, 1000, 0.72) - 0.5) < 0.001);
});


test('layerFrame returns controlled opening and exact final states', () => {
  const opening = hero.layerFrame('documents', 0, 1);
  const final = hero.layerFrame('documents', 1, 1);
  assert.deepEqual(opening, { x: -18, y: 12, rotate: -1.5, scale: 1, opacity: 0.88 });
  assert.deepEqual(final, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
});


test('layerFrame reduces mobile travel without changing the final state', () => {
  assert.equal(hero.layerFrame('rows', 0, 0.55).x, 7.7);
  assert.deepEqual(
    hero.layerFrame('rows', 1, 0.55),
    { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
  );
});


test('breakpoints reduce the independently animated layer set', () => {
  assert.deepEqual(hero.activeLayerNames(1440), ['documents', 'frame', 'rows', 'connectors', 'validation', 'signals']);
  assert.deepEqual(hero.activeLayerNames(900), ['documents', 'rows', 'connectors', 'validation']);
  assert.deepEqual(hero.activeLayerNames(390), ['documents', 'rows', 'validation']);
});


test('every layer reaches the identical canonical final state at every intensity', () => {
  const names = ['documents', 'frame', 'rows', 'connectors', 'validation', 'signals'];
  for (const intensity of [1, 0.78, 0.55]) {
    for (const name of names) {
      assert.deepEqual(
        hero.layerFrame(name, 1, intensity),
        { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
      );
    }
  }
});


test('shouldEnhance rejects reduced motion and missing capabilities', () => {
  assert.equal(hero.shouldEnhance({ reducedMotion: true, hasRAF: true, hasObject: true }), false);
  assert.equal(hero.shouldEnhance({ reducedMotion: false, hasRAF: false, hasObject: true }), false);
  assert.equal(hero.shouldEnhance({ reducedMotion: false, hasRAF: true, hasObject: false }), false);
  assert.equal(hero.shouldEnhance({ reducedMotion: false, hasRAF: true, hasObject: true }), true);
});


test('unknown layers remain in the exact final identity state', () => {
  assert.deepEqual(
    hero.layerFrame('unknown', 0, 1),
    { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
  );
});


test('init subscribes to object load before inspecting same-origin content', () => {
  const order = [];
  const classList = { add() {}, toggle() {} };
  const style = { setProperty() {} };
  const layers = ['documents', 'frame', 'rows', 'connectors', 'validation', 'signals']
    .map(name => ({
      getAttribute: () => name,
      style: { removeProperty() {} }
    }));
  const svgDocument = {
    documentElement: {},
    querySelectorAll: () => layers
  };
  const art = {
    get contentDocument() {
      order.push('content');
      return svgDocument;
    },
    addEventListener(type) {
      if (type === 'load') order.push('listen');
    },
    removeEventListener() {}
  };
  const scene = {
    querySelector: () => art,
    closest: () => ({ style, classList }),
    classList,
    getBoundingClientRect: () => ({ top: 120 })
  };
  const rootDocument = { querySelector: () => scene };
  const rootWindow = {
    innerWidth: 1200,
    innerHeight: 1000,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame() {},
    addEventListener() {},
    removeEventListener() {}
  };

  hero.init(rootDocument, rootWindow);

  assert.equal(order[0], 'listen');
});


test('init mounts when the object becomes available before the deferred runtime observes its load', () => {
  const names = ['documents', 'frame', 'rows', 'connectors', 'validation', 'signals'];
  const classes = new Set();
  const windowListeners = {};
  const objectListeners = {};
  const makeStyle = () => ({
    removeProperty(name) { delete this[name]; }
  });
  const layers = names.map(name => ({
    getAttribute: attribute => attribute === 'data-hero-layer' ? name : null,
    style: makeStyle()
  }));
  const heroRoot = {
    classList: { toggle() {} },
    style: { setProperty() {} }
  };
  const art = {
    contentDocument: null,
    addEventListener: (name, callback) => { objectListeners[name] = callback; },
    removeEventListener: name => { delete objectListeners[name]; }
  };
  const scene = {
    classList: {
      add: name => classes.add(name),
      toggle() {}
    },
    closest: () => heroRoot,
    getBoundingClientRect: () => ({ top: 120 }),
    querySelector: selector => selector === '[data-homepage-hero-art]' ? art : null
  };
  const rootDocument = { querySelector: () => scene };
  const rootWindow = {
    innerHeight: 1000,
    innerWidth: 1200,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: callback => { callback(); return 1; },
    addEventListener: (name, callback) => { windowListeners[name] = callback; },
    removeEventListener: name => { delete windowListeners[name]; }
  };

  const controller = hero.init(rootDocument, rootWindow);
  assert.equal(classes.has('is-motion-ready'), false);
  assert.equal(typeof windowListeners.load, 'function');

  art.contentDocument = {
    documentElement: {},
    querySelectorAll: () => layers
  };
  windowListeners.load();

  assert.equal(classes.has('is-motion-ready'), true);
  controller.destroy();
});


test('offscreen scenes do not enqueue animation frames on scroll', () => {
  const names = ['documents', 'frame', 'rows', 'connectors', 'validation', 'signals'];
  const listeners = {};
  const frames = [];
  let observerCallback;
  const layers = names.map(name => ({
    getAttribute: () => name,
    style: { removeProperty() {} }
  }));
  const art = {
    contentDocument: { querySelectorAll: () => layers },
    addEventListener() {},
    removeEventListener() {}
  };
  const scene = {
    classList: { add() {}, toggle() {} },
    closest: () => ({ classList: { toggle() {} }, style: { setProperty() {} } }),
    getBoundingClientRect: () => ({ top: 120 }),
    querySelector: () => art
  };
  const rootWindow = {
    innerHeight: 1000,
    innerWidth: 1200,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: callback => { frames.push(callback); return frames.length; },
    addEventListener: (name, callback) => { listeners[name] = callback; },
    removeEventListener() {},
    IntersectionObserver: class {
      constructor(callback) { observerCallback = callback; }
      observe() {}
      disconnect() {}
    }
  };

  const controller = hero.init({ querySelector: () => scene }, rootWindow);
  while (frames.length) frames.shift()();
  observerCallback([{ isIntersecting: false }]);
  const scheduledBeforeScroll = frames.length;
  listeners.scroll();

  assert.equal(frames.length, scheduledBeforeScroll);
  controller.destroy();
});


test('destroy restores the canonical CSS and SVG fallback state', () => {
  const names = ['documents', 'frame', 'rows', 'connectors', 'validation', 'signals'];
  const makeClassList = () => {
    const values = new Set();
    return {
      values,
      add: name => values.add(name),
      remove: name => values.delete(name),
      toggle: (name, force) => force ? values.add(name) : values.delete(name)
    };
  };
  const makeStyle = () => ({
    properties: {},
    setProperty(name, value) { this.properties[name] = value; },
    removeProperty(name) { delete this.properties[name]; delete this[name]; }
  });
  const sceneClasses = makeClassList();
  const rootClasses = makeClassList();
  const rootStyle = makeStyle();
  const layers = names.map(name => ({ getAttribute: () => name, style: makeStyle() }));
  const art = {
    contentDocument: { querySelectorAll: () => layers },
    addEventListener() {},
    removeEventListener() {}
  };
  const scene = {
    classList: sceneClasses,
    closest: () => ({ classList: rootClasses, style: rootStyle }),
    getBoundingClientRect: () => ({ top: 120 }),
    querySelector: () => art
  };
  const rootWindow = {
    innerHeight: 1000,
    innerWidth: 1200,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: callback => { callback(); return 1; },
    addEventListener() {},
    removeEventListener() {}
  };

  const controller = hero.init({ querySelector: () => scene }, rootWindow);
  assert.equal(sceneClasses.values.has('is-motion-ready'), true);
  assert.equal(typeof layers[0].style.transform, 'string');
  controller.destroy();

  assert.equal(sceneClasses.values.has('is-motion-ready'), false);
  assert.equal(sceneClasses.values.has('is-resolved'), false);
  assert.equal(rootClasses.values.has('is-hero-resolved'), false);
  assert.equal(rootStyle.properties['--hero-progress'], undefined);
  for (const layer of layers) {
    assert.equal(layer.style.transform, undefined);
    assert.equal(layer.style.opacity, undefined);
  }
});
