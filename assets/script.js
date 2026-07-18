/* CLAVE DE NÚMEROS · biblioteca de guias · JS mínimo */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Retirar a antiga área de Blogue da navegação e corrigir a numeração. */
document.querySelectorAll('.nav-links a, .footer a').forEach((link) => {
  const href = link.getAttribute('href') || '';
  if (/(^|\/)blogue\//.test(href) || /(^|\/)blog\//.test(href) || link.textContent.trim() === 'Blogue' || link.textContent.trim() === 'Blog') {
    const row = link.closest('.footer p');
    if (row) row.remove(); else link.remove();
  }
});
document.querySelectorAll('.nav-links a').forEach((link) => {
  if (/contactos\.html$|contact\.html$/.test(link.getAttribute('href') || '')) {
    const number = link.querySelector('span');
    if (number) number.textContent = '06';
  }
});

/* Menu mobile */
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

/* Revelações ao scroll */
const reveals = document.querySelectorAll('.reveal');
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
  }), { threshold: .12 });
  reveals.forEach((el) => io.observe(el));
} else reveals.forEach((el) => el.classList.add('in'));

/* Método */
const method = document.querySelector('.method');
if (method) {
  const progress = method.querySelector('.progress');
  const phases = method.querySelectorAll('.phase');
  if (reduced) phases.forEach((phase) => phase.classList.add('active'));
  else if (progress) {
    const draw = () => {
      const r = method.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * .85 - r.top) / (r.height + window.innerHeight * .2)));
      progress.style.setProperty('--p', p.toFixed(3));
      phases.forEach((phase, i) => phase.classList.toggle('active', p >= (i + .5) / phases.length));
    };
    document.addEventListener('scroll', draw, { passive: true }); draw();
  }
}

/* Pesquisa e categorias em FAQ e glossário */
const faqInput = document.querySelector('[data-faq-filter]');
if (faqInput) {
  const scope = faqInput.closest('.faq') || document;
  const items = [...scope.querySelectorAll('details')];
  const empty = scope.querySelector('[data-faq-empty]');
  const buttons = [...scope.querySelectorAll('[data-faq-category]')];
  const norm = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let category = 'todos';
  const filter = () => {
    const q = norm(faqInput.value.trim()); let visible = 0;
    items.forEach((item) => {
      const cats = (item.dataset.category || '').split(' ');
      const show = (category === 'todos' || cats.includes(category)) && (!q || norm(item.textContent).includes(q));
      item.style.display = show ? '' : 'none'; if (show) visible += 1;
    });
    if (empty) empty.style.display = visible ? 'none' : 'block';
  };
  faqInput.addEventListener('input', filter);
  buttons.forEach((button) => button.addEventListener('click', () => {
    category = button.dataset.faqCategory || 'todos';
    buttons.forEach((item) => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', active ? 'true' : 'false'); });
    filter();
  }));
}

/* Carrossel de testemunhos */
const carousel = document.querySelector('[data-testimonial-carousel]');
if (carousel) {
  const track = carousel.querySelector('.testimonial-track');
  const originals = [...track.children].map((item) => item.cloneNode(true));
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const status = carousel.querySelector('[data-carousel-current]');
  const total = originals.length; let visible = 3; let index = 0; let moving = false; let timer; let resizeTimer;
  const count = () => window.innerWidth <= 760 ? 1 : (window.innerWidth <= 980 ? 2 : 3);
  const step = () => { const slide = track.querySelector('.testimonial-slide'); return slide ? slide.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0) : 0; };
  const updateStatus = () => { if (!status) return; const first = ((index - visible) % total + total) % total; status.textContent = visible === 1 ? String(first + 1) : `${first + 1}–${((first + visible - 1) % total) + 1}`; };
  const position = (animate = true) => { track.style.transition = animate && !reduced ? '' : 'none'; track.style.transform = `translate3d(${-index * step()}px,0,0)`; updateStatus(); };
  const build = () => { visible = Math.min(count(), total); track.innerHTML = ''; [...originals.slice(-visible), ...originals, ...originals.slice(0, visible)].forEach((item) => track.appendChild(item.cloneNode(true))); index = visible; carousel.classList.toggle('is-static', total <= visible); requestAnimationFrame(() => position(false)); };
  const move = (dir) => { if (moving || total <= visible) return; moving = true; index += dir; position(true); };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { stop(); if (!reduced && total > visible) timer = setInterval(() => move(1), 6500); };
  track.addEventListener('transitionend', () => { if (index >= total + visible) { index = visible; position(false); } else if (index < visible) { index = total + visible - 1; position(false); } moving = false; });
  prev?.addEventListener('click', () => { move(-1); start(); }); next?.addEventListener('click', () => { move(1); start(); });
  carousel.addEventListener('mouseenter', stop); carousel.addEventListener('mouseleave', start); carousel.addEventListener('focusin', stop); carousel.addEventListener('focusout', (e) => { if (!carousel.contains(e.relatedTarget)) start(); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { build(); start(); }, 180); });
  build(); start();
}

/* Formulário */
const form = document.querySelector('[data-contact-form]');
if (form) {
  const ok = document.querySelector('[data-notice-ok]'); const err = document.querySelector('[data-notice-err]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); ok?.classList.remove('ok'); err?.classList.remove('err');
    try { const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }); if (res.ok) { ok?.classList.add('ok'); form.reset(); ok?.focus(); } else { err?.classList.add('err'); err?.focus(); } }
    catch { err?.classList.add('err'); err?.focus(); }
  });
}

/* Progresso de leitura */
if (!reduced) {
  const bar = document.createElement('div'); bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  const update = () => { const root = document.documentElement; const max = root.scrollHeight - root.clientHeight; bar.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`; };
  document.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
}
