/* CLAVE DE NÚMEROS · v20 · JS mínimo
   ⚠️ A equipa não precisa de editar este ficheiro para mudar textos. */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Menu mobile */
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* Revelações ao scroll (desligadas com prefers-reduced-motion) */
const reveals = document.querySelectorAll('.reveal');
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('in'));
}

/* Método: linha de percurso que se desenha com o scroll (direcção C) */
const method = document.querySelector('.method');
if (method) {
  const progress = method.querySelector('.progress');
  const phases = method.querySelectorAll('.phase');
  if (reduced) {
    phases.forEach(p => p.classList.add('active'));
  } else if (progress) {
    const draw = () => {
      const r = method.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.2)));
      progress.style.setProperty('--p', p.toFixed(3));
      phases.forEach((ph, i) => ph.classList.toggle('active', p >= (i + 0.5) / phases.length));
    };
    document.addEventListener('scroll', draw, { passive: true });
    draw();
  }
}

/* Pesquisa e categorias nas perguntas frequentes (página Guias) */
const faqInput = document.querySelector('[data-faq-filter]');
if (faqInput) {
  const items = [...document.querySelectorAll('.faq details')];
  const empty = document.querySelector('[data-faq-empty]');
  const categoryButtons = [...document.querySelectorAll('[data-faq-category]')];
  const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let activeCategory = 'todos';

  const filterFaq = () => {
    const q = norm(faqInput.value.trim());
    let visible = 0;
    items.forEach(d => {
      const category = d.dataset.category || '';
      const categoryHit = activeCategory === 'todos' || category.split(' ').includes(activeCategory);
      const textHit = !q || norm(d.textContent).includes(q);
      const hit = categoryHit && textHit;
      d.style.display = hit ? '' : 'none';
      if (hit) visible++;
    });
    if (empty) empty.style.display = visible ? 'none' : 'block';
  };

  faqInput.addEventListener('input', filterFaq);
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.faqCategory || 'todos';
      categoryButtons.forEach(item => {
        const active = item === button;
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
        item.classList.toggle('active', active);
      });
      filterFaq();
    });
  });
}

/* Carrossel infinito de testemunhos (3 desktop, 2 tablet, 1 mobile) */
const testimonialCarousel = document.querySelector('[data-testimonial-carousel]');
if (testimonialCarousel) {
  const track = testimonialCarousel.querySelector('.testimonial-track');
  const prev = testimonialCarousel.querySelector('[data-carousel-prev]');
  const next = testimonialCarousel.querySelector('[data-carousel-next]');
  const status = testimonialCarousel.querySelector('[data-carousel-current]');
  const originals = [...track.children].map(item => item.cloneNode(true));
  const total = originals.length;
  let visible = 3;
  let index = 0;
  let moving = false;
  let timer = null;
  let resizeTimer = null;

  const visibleCount = () => window.innerWidth <= 760 ? 1 : (window.innerWidth <= 980 ? 2 : 3);
  const gap = () => parseFloat(getComputedStyle(track).gap) || 0;
  const stepWidth = () => {
    const slide = track.querySelector('.testimonial-slide');
    return slide ? slide.getBoundingClientRect().width + gap() : 0;
  };

  const updateStatus = () => {
    const first = ((index - visible) % total + total) % total;
    const labels = [];
    for (let i = 0; i < visible; i++) labels.push(((first + i) % total) + 1);
    if (status) status.textContent = labels.length === 1 ? String(labels[0]) : `${labels[0]}–${labels[labels.length - 1]}`;
  };

  const setPosition = (animate = true) => {
    track.style.transition = animate && !reduced ? '' : 'none';
    track.style.transform = `translate3d(${-index * stepWidth()}px,0,0)`;
    updateStatus();
  };

  const build = () => {
    visible = Math.min(visibleCount(), total);
    track.innerHTML = '';
    const before = originals.slice(-visible).map(item => item.cloneNode(true));
    const after = originals.slice(0, visible).map(item => item.cloneNode(true));
    [...before, ...originals.map(item => item.cloneNode(true)), ...after].forEach(item => track.appendChild(item));
    index = visible;
    testimonialCarousel.classList.toggle('is-static', total <= visible);
    requestAnimationFrame(() => setPosition(false));
  };

  const move = (direction) => {
    if (moving || total <= visible) return;
    moving = true;
    index += direction;
    setPosition(true);
    if (reduced) {
      moving = false;
      if (index >= total + visible) { index = visible; setPosition(false); }
      if (index < visible) { index = total + visible - 1; setPosition(false); }
    }
  };

  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const start = () => {
    stop();
    if (!reduced && total > visible) timer = setInterval(() => move(1), 6500);
  };

  track.addEventListener('transitionend', () => {
    if (index >= total + visible) {
      index = visible;
      setPosition(false);
    } else if (index < visible) {
      index = total + visible - 1;
      setPosition(false);
    }
    moving = false;
  });

  prev?.addEventListener('click', () => { move(-1); start(); });
  next?.addEventListener('click', () => { move(1); start(); });
  testimonialCarousel.addEventListener('mouseenter', stop);
  testimonialCarousel.addEventListener('mouseleave', start);
  testimonialCarousel.addEventListener('focusin', stop);
  testimonialCarousel.addEventListener('focusout', (event) => {
    if (!testimonialCarousel.contains(event.relatedTarget)) start();
  });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { build(); start(); }, 180);
  });

  build();
  start();
}

/* Formulário de contacto
   ⚠️ CONFIGURAR: substituir o endpoint no atributo action do <form>
   (ver GUIA-DE-EDICAO.md, secção "Formulário"). */
const form = document.querySelector('[data-contact-form]');
if (form) {
  const ok = document.querySelector('[data-notice-ok]');
  const err = document.querySelector('[data-notice-err]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ok.classList.remove('ok'); err.classList.remove('err');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) { ok.classList.add('ok'); form.reset(); ok.focus(); }
      else { err.classList.add('err'); err.focus(); }
    } catch { err.classList.add('err'); err.focus(); }
  });
}

/* Barra de progresso de leitura (desligada com prefers-reduced-motion) */
if (!reduced) {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  const updateBar = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
  };
  document.addEventListener('scroll', updateBar, { passive: true });
  window.addEventListener('resize', updateBar);
  updateBar();
}