/* CLAVE DE NÚMEROS · biblioteca de guias · JS mínimo */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

(() => {
  const path = window.location.pathname;
  const isEnglish = /\/en\//.test(path);
  const setText = (selector, html) => {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = html;
  };

  const isHome = /\/(pt|en)\/?(?:index\.html)?$/.test(path);
  if (isHome) {
    setText('.hero h1.display', isEnglish
      ? 'Clear accounts.<br><span class="accent">Simple decisions.</span>'
      : 'Contas claras.<br><span class="accent">Decisões simples.</span>');
    setText('#servicos .section-head h2.display, #services .section-head h2.display', isEnglish
      ? 'We adapt to your reality.'
      : 'Adaptamo-nos à sua realidade.');
    setText('#servicos .section-head p, #services .section-head p', isEnglish
      ? 'Every company and activity has its own needs. Our accounting, tax and management services adapt to each client’s framework, size, tax obligations and way of working. The service sheets explain what is included, when it is useful and how the support is provided.'
      : 'Cada empresa e atividade têm necessidades próprias. Os nossos serviços de contabilidade, fiscalidade e gestão ajustam-se ao enquadramento, dimensão, obrigações fiscais e forma de trabalho de cada cliente. Nas fichas de serviço explicamos o que está incluído, quando é útil e como é feito o acompanhamento.');
    setText('#para-quem .section-head h2.display, #who-we-serve .section-head h2.display', isEnglish
      ? 'More clarity, less noise.'
      : 'Mais clareza, menos ruído.');
    setText('#para-quem .section-head p, #who-we-serve .section-head p', isEnglish
      ? 'A company, an independent activity, an online business or a specific tax situation all involve different obligations. Identify the profile closest to your reality and discover the areas in which Clave de Números can support your activity.'
      : 'Uma sociedade, uma atividade independente, um negócio online ou uma situação fiscal específica têm obrigações diferentes. Identifique o perfil mais próximo da sua realidade e conheça as áreas em que a Clave de Números pode acompanhar a sua atividade.');
    setText('#razoes .section-head h2.display, #reasons .section-head h2.display', isEnglish
      ? 'A collaboration built on trust.'
      : 'Uma colaboração baseada na confiança.');

    const origin = document.querySelector('#origem .split > div, #origins .split > div');
    if (origin) {
      const paragraph = origin.querySelector('p');
      const highlight = origin.querySelector('blockquote');
      if (paragraph) paragraph.textContent = isEnglish
        ? 'Clave de Números grew from a professional path that began in 2011 with the preparation of investment projects for companies. Accounting developed naturally in response to clients’ needs, and the company was incorporated in 2013. Since then, it has grown consistently while maintaining close, long-term relationships.'
        : 'A Clave de Números nasceu de um percurso iniciado em 2011 na elaboração de projetos de investimento para empresas. A contabilidade surgiu naturalmente, como resposta às necessidades dos clientes, e a empresa foi constituída em 2013. Desde então, tem crescido de forma consistente, mantendo relações próximas e duradouras.';
      if (highlight) highlight.textContent = isEnglish
        ? 'Responsiveness, availability and rigour continue to distinguish Clave de Números.'
        : 'Rapidez de resposta, disponibilidade e rigor continuam a distinguir a Clave de Números.';
    }
  }

  if (/\/(servicos|services)\.html$/.test(path)) setText('.page-hero h1.display', isEnglish ? 'Organise. Support. Decide.' : 'Organizar. Acompanhar. Decidir.');
  if (/\/(sobre|about)\.html$/.test(path)) setText('.page-hero h1.display', isEnglish ? 'A firm built on relationships.' : 'Uma empresa de relações.');
  if (/\/(guias|guides)\.html$/.test(path)) setText('.page-hero h1.display', isEnglish ? 'Understand and organise your activity.' : 'Conheça e organize a sua atividade.');
})();

(() => {
  const path = window.location.pathname;
  const body = document.body;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '../assets/visual-system.css';
  document.head.appendChild(stylesheet);
  const pageClass = /\/(servicos|services)\.html$/.test(path) ? 'page-services'
    : /\/(para-empresas|for-businesses|para-particulares|for-individuals)\.html$/.test(path) ? 'page-profiles'
    : /\/(sobre|about)\.html$/.test(path) ? 'page-about'
    : /\/(guias|guides)\.html$/.test(path) ? 'page-guides'
    : /\/(contactos|contact)\.html$/.test(path) ? 'page-contact'
    : /\/(pt|en)\/?(?:index\.html)?$/.test(path) ? 'page-home' : 'page-content';
  body.classList.add(pageClass);
  document.querySelectorAll('.hero-media, .page-hero .hero-media').forEach((media) => media.classList.add('visual-hero'));
  document.querySelectorAll('main > .section > .container').forEach((container, index) => {
    if (index % 2 !== 0 || container.querySelector(':scope > .visual-mark')) return;
    const mark = document.createElement('span'); mark.className = 'visual-mark'; mark.setAttribute('aria-hidden', 'true'); container.prepend(mark);
  });
  document.querySelectorAll('.service-card, .post-card, .reason').forEach((card, index) => {
    if (index % 3 !== 1 || card.querySelector(':scope > .visual-mark')) return;
    const mark = document.createElement('span'); mark.className = 'visual-mark'; mark.setAttribute('aria-hidden', 'true'); card.appendChild(mark);
  });
  document.querySelectorAll('.section-head, .split').forEach((block, index) => {
    if (index % 3 !== 0 || block.nextElementSibling?.classList.contains('modular-rule')) return;
    const rule = document.createElement('div'); rule.className = 'modular-rule'; rule.setAttribute('aria-hidden', 'true'); block.insertAdjacentElement('afterend', rule);
  });
  if (body.classList.contains('page-guides')) {
    const guideType = (href) => /document|documentacao/.test(href) ? 'documents' : /sistema|system/.test(href) ? 'system' : /abrir-empresa|open-company/.test(href) ? 'company' : /lucro|caixa|tesouraria|cash|profit/.test(href) ? 'cash' : /trabalhador|worker|employee/.test(href) ? 'worker' : /fecho|inventar|closing|year-end/.test(href) ? 'closing' : 'regimes';
    document.querySelectorAll('#guias-essenciais .service-card, #essential-guides .service-card').forEach((card) => {
      if (card.querySelector('.guide-thumb')) return;
      const thumb = document.createElement('span'); thumb.className = `guide-thumb guide-thumb--${guideType(card.getAttribute('href') || '')}`; thumb.setAttribute('aria-hidden', 'true'); card.prepend(thumb);
    });
  }
  requestAnimationFrame(() => body.classList.add('visual-ready'));
})();

(() => {
  const path = window.location.pathname;
  const isEnglish = /\/en\//.test(path);
  const isContact = /\/(contactos|contact)\.html$/.test(path);
  if (!isContact || document.querySelector('[data-office-map]')) return;
  if (!document.querySelector('link[href$="local-photos.css"]')) {
    const stylesheet = document.createElement('link'); stylesheet.rel = 'stylesheet'; stylesheet.href = '../assets/local-photos.css'; document.head.appendChild(stylesheet);
  }
  const main = document.querySelector('main'); if (!main) return;
  const mapQuery = encodeURIComponent('Rua Cidade de Ponta Delgada, Loja 136, 2870-261 Montijo');
  const section = document.createElement('section'); section.className = 'section soft local-photo-section'; section.dataset.officeMap = '';
  section.innerHTML = `<div class="container"><div class="contact-place-head"><p class="kicker">Montijo · Portugal</p><h2 class="display">${isEnglish ? 'Where are we?' : 'Onde estamos?'}</h2><p>${isEnglish ? 'Our office is located in Montijo. We support clients throughout Portugal.' : 'O escritório localiza-se no Montijo. Acompanhamos clientes em todo o país.'}</p></div><div class="contact-map-card contact-map-card-wide"><iframe title="${isEnglish ? 'Map showing the Clave de Números office in Montijo' : 'Mapa com a localização da Clave de Números no Montijo'}" src="https://www.google.com/maps?q=${mapQuery}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><div class="contact-map-meta"><p><strong>Clave de Números</strong><br>Rua Cidade de Ponta Delgada, Loja 136<br>2870-261 Montijo</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener noreferrer">${isEnglish ? 'Open in Google Maps →' : 'Abrir no Google Maps →'}</a></div></div></div>`;
  main.appendChild(section);
})();

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); });

const reveals = document.querySelectorAll('.reveal');
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); } }), { threshold: .12 });
  reveals.forEach((el) => io.observe(el));
} else reveals.forEach((el) => el.classList.add('in'));

const method = document.querySelector('.method');
if (method) {
  const progress = method.querySelector('.progress'); const phases = method.querySelectorAll('.phase');
  if (reduced) phases.forEach((phase) => phase.classList.add('active'));
  else if (progress) {
    const draw = () => { const r = method.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (window.innerHeight * .85 - r.top) / (r.height + window.innerHeight * .2))); progress.style.setProperty('--p', p.toFixed(3)); phases.forEach((phase, i) => phase.classList.toggle('active', p >= (i + .5) / phases.length)); };
    document.addEventListener('scroll', draw, { passive: true }); draw();
  }
}

const faqInput = document.querySelector('[data-faq-filter]');
if (faqInput) {
  const scope = faqInput.closest('.faq') || document; const items = [...scope.querySelectorAll('details')]; const empty = scope.querySelector('[data-faq-empty]'); const buttons = [...scope.querySelectorAll('[data-faq-category]')]; const norm = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  buttons.forEach((button) => { const key = button.dataset.faqCategory || 'todos'; if (key !== 'todos' && !items.some((item) => (item.dataset.category || '').split(' ').includes(key))) button.hidden = true; });
  let category = 'todos';
  const filter = () => { const q = norm(faqInput.value.trim()); let visible = 0; items.forEach((item) => { const cats = (item.dataset.category || '').split(' '); const show = (category === 'todos' || cats.includes(category)) && (!q || norm(item.textContent).includes(q)); item.style.display = show ? '' : 'none'; if (show) visible += 1; }); if (empty) empty.style.display = visible ? 'none' : 'block'; };
  faqInput.addEventListener('input', filter);
  buttons.forEach((button) => button.addEventListener('click', () => { category = button.dataset.faqCategory || 'todos'; buttons.forEach((item) => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', active ? 'true' : 'false'); }); filter(); }));
}

const carousel = document.querySelector('[data-testimonial-carousel]');
if (carousel) {
  const track = carousel.querySelector('.testimonial-track'); const originals = [...track.children].map((item) => item.cloneNode(true)); const prev = carousel.querySelector('[data-carousel-prev]'); const next = carousel.querySelector('[data-carousel-next]'); const status = carousel.querySelector('[data-carousel-current]'); const total = originals.length; let visible = 3; let index = 0; let moving = false; let timer; let resizeTimer;
  const count = () => window.innerWidth <= 760 ? 1 : (window.innerWidth <= 980 ? 2 : 3); const step = () => { const slide = track.querySelector('.testimonial-slide'); return slide ? slide.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0) : 0; };
  const updateStatus = () => { if (!status) return; const first = ((index - visible) % total + total) % total; status.textContent = visible === 1 ? String(first + 1) : `${first + 1}–${((first + visible - 1) % total) + 1}`; };
  const position = (animate = true) => { track.style.transition = animate && !reduced ? '' : 'none'; track.style.transform = `translate3d(${-index * step()}px,0,0)`; updateStatus(); };
  const build = () => { visible = Math.min(count(), total); track.innerHTML = ''; [...originals.slice(-visible), ...originals, ...originals.slice(0, visible)].forEach((item) => track.appendChild(item.cloneNode(true))); index = visible; carousel.classList.toggle('is-static', total <= visible); requestAnimationFrame(() => position(false)); };
  const move = (dir) => { if (moving || total <= visible) return; moving = true; index += dir; position(true); }; const stop = () => { clearInterval(timer); timer = null; }; const start = () => { stop(); if (!reduced && total > visible) timer = setInterval(() => move(1), 6500); };
  track.addEventListener('transitionend', () => { if (index >= total + visible) { index = visible; position(false); } else if (index < visible) { index = total + visible - 1; position(false); } moving = false; });
  prev?.addEventListener('click', () => { move(-1); start(); }); next?.addEventListener('click', () => { move(1); start(); }); carousel.addEventListener('mouseenter', stop); carousel.addEventListener('mouseleave', start); carousel.addEventListener('focusin', stop); carousel.addEventListener('focusout', (e) => { if (!carousel.contains(e.relatedTarget)) start(); }); document.addEventListener('visibilitychange', () => document.hidden ? stop() : start()); window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { build(); start(); }, 180); }); build(); start();
}

const form = document.querySelector('[data-contact-form]');
if (form) {
  const ok = document.querySelector('[data-notice-ok]'); const err = document.querySelector('[data-notice-err]');
  form.addEventListener('submit', async (event) => { event.preventDefault(); ok?.classList.remove('ok'); err?.classList.remove('err'); try { const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }); if (res.ok) { ok?.classList.add('ok'); form.reset(); ok?.focus(); } else { err?.classList.add('err'); err?.focus(); } } catch { err?.classList.add('err'); err?.focus(); } });
}

if (!reduced) {
  const bar = document.createElement('div'); bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  const update = () => { const root = document.documentElement; const max = root.scrollHeight - root.clientHeight; bar.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`; };
  document.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
}