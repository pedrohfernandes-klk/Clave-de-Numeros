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