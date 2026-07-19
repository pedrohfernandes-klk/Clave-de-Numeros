/* Perfis da equipa — apenas comportamento. O conteúdo vive no HTML. */
(() => {
  const section = document.querySelector('#equipa');
  const dialog = document.querySelector('.team-profile-dialog');
  if (!section || !dialog || section.dataset.profilesReady === 'true') return;
  section.dataset.profilesReady = 'true';

  const cards = [...section.querySelectorAll('.team-profile-card')];
  const photo = dialog.querySelector('[data-team-photo]');
  const name = dialog.querySelector('[data-team-name]');
  const role = dialog.querySelector('[data-team-role]');
  const body = dialog.querySelector('[data-team-body]');
  const close = dialog.querySelector('[data-team-close]');
  let opener = null;

  /* Os perfis são lidos do HTML já presente em cada cartão. */
  const profiles = cards.map((card) => {
    const img = card.querySelector('.team-profile-photo');
    const full = card.querySelector('[data-team-full]');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : '',
      name: (card.querySelector('b') || {}).textContent || '',
      role: (card.querySelector('small') || {}).textContent || '',
      html: full ? full.innerHTML : ''
    };
  });

  const openProfile = (index, trigger) => {
    const profile = profiles[index];
    if (!profile) return;
    opener = trigger;
    if (photo) { photo.src = profile.src; photo.alt = profile.alt; }
    if (name) name.textContent = profile.name;
    if (role) role.textContent = profile.role;
    if (body && profile.html) body.innerHTML = profile.html;
    document.documentElement.classList.add('team-dialog-open');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    requestAnimationFrame(() => close && close.focus());
  };

  const closeProfile = () => {
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  /* O cartão inteiro abre o perfil — fotografia incluída. */
  cards.forEach((card, index) => {
    const button = card.querySelector('[data-team-open]');
    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      openProfile(index, button || card);
    });
    card.addEventListener('keydown', (event) => {
      if (event.target !== card) return;
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProfile(index, button || card); }
    });
  });

  close && close.addEventListener('click', closeProfile);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeProfile(); });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('team-dialog-open');
    opener && opener.focus();
  });
})();
