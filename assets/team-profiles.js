(() => {
  const section = document.querySelector('#equipa');
  if (!section || section.dataset.profilesReady === 'true') return;
  section.dataset.profilesReady = 'true';

  const profiles = [
    {
      photoClass: 'team-photo-isabel',
      name: 'Isabel Monteiro',
      role: 'Fundadora e Contabilista Certificada',
      summary: 'Dirige a Clave de Números e acompanha diretamente os clientes, articulando o conhecimento técnico com a leitura global de cada atividade.',
      paragraphs: [
        'Licenciada em Gestão pela Universidade de Évora, Isabel Monteiro iniciou o seu percurso profissional na elaboração de projetos de investimento para empresas, área que esteve na origem da atividade que viria a dar forma à Clave de Números.',
        'Como fundadora e Contabilista Certificada, dirige o trabalho da empresa e mantém uma visão transversal sobre os clientes, os respetivos processos e as decisões que exigem maior enquadramento contabilístico, fiscal ou de gestão.',
        'O seu trabalho combina experiência, autoridade técnica, disponibilidade e conhecimento direto de cada atividade, ajudando os clientes a compreender melhor as suas obrigações e a tomar decisões com mais segurança.'
      ]
    },
    {
      photoClass: 'team-photo-gisela',
      name: 'Gisela Oliveira',
      role: 'Técnica de Contabilidade · Coordenação operacional',
      summary: 'Coordena processos contabilísticos e fiscais, acompanha empresas clientes e assegura organização, prazos e articulação interna.',
      paragraphs: [
        'A trabalhar na área desde 2020, Gisela Oliveira assegura a coordenação operacional dos processos contabilísticos e fiscais, com especial atenção à organização, ao controlo de prazos e ao acompanhamento regular das empresas clientes.',
        'Mantém contacto direto com os clientes, assegurando um acompanhamento atento, organizado e rigoroso.',
        'Articulada, organizada e fiável, contribui para que cada processo avance com clareza, método e rigor.'
      ]
    },
    {
      photoClass: 'team-photo-ana',
      name: 'Ana Fernandes',
      role: 'Administrativa de Contabilidade',
      summary: 'Acompanha ENI e trabalhadores independentes, com especial atenção à organização documental, IRS e obrigações fiscais.',
      paragraphs: [
        'Com cerca de quinze anos de experiência na área da contabilidade, Ana Fernandes acompanha sobretudo Empresários em Nome Individual e trabalhadores independentes.',
        'O seu trabalho passa pela organização dos processos, pela preparação e acompanhamento do IRS e pela gestão da documentação necessária ao cumprimento das obrigações fiscais.',
        'Com uma presença próxima e atenta, contribui para que cada cliente tenha os seus elementos organizados, os prazos controlados e uma relação mais clara com a sua atividade.'
      ]
    },
    {
      photoClass: 'team-photo-tatiana',
      name: 'Tatiana dos Santos',
      role: 'Assistente Administrativa',
      summary: 'Assegura a gestão documental, as tarefas administrativas e a organização das comunicações do dia a dia.',
      paragraphs: [
        'Tatiana dos Santos assegura a gestão documental, o acompanhamento das tarefas administrativas e a organização das comunicações necessárias ao funcionamento diário da Clave de Números.',
        'O seu trabalho ajuda a manter os processos organizados, a informação acessível e a articulação entre equipa e clientes mais fluida.',
        'Com método, atenção ao detalhe e sentido prático, contribui para que o acompanhamento administrativo decorra com clareza e continuidade.'
      ]
    }
  ];

  const grid = section.querySelector('.team-grid');
  if (!grid) return;
  grid.innerHTML = profiles.map((profile, index) => `
    <article class="member team-profile-card reveal in" data-team-index="${index}">
      <div class="${profile.photoClass} team-profile-photo" role="img" aria-label="Fotografia de ${profile.name}"></div>
      <div class="team-profile-summary">
        <b>${profile.name}</b>
        <small>${profile.role}</small>
        <p>${profile.summary}</p>
        <button class="team-profile-button" type="button" data-team-open="${index}" aria-haspopup="dialog">Saber mais <span aria-hidden="true">→</span></button>
      </div>
    </article>`).join('');

  const dialog = document.createElement('dialog');
  dialog.className = 'team-profile-dialog';
  dialog.setAttribute('aria-labelledby', 'team-profile-name');
  dialog.innerHTML = `
    <div class="team-profile-dialog-card">
      <button class="team-profile-close" type="button" aria-label="Fechar perfil" data-team-close>Fechar <span aria-hidden="true">×</span></button>
      <div class="team-profile-dialog-grid">
        <div class="team-profile-dialog-photo" data-team-photo role="img"></div>
        <div class="team-profile-dialog-copy">
          <p class="kicker">Conheça a equipa</p>
          <h2 class="display" id="team-profile-name" data-team-name></h2>
          <p class="team-profile-role" data-team-role></p>
          <div class="team-profile-body" data-team-body></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(dialog);

  let opener = null;
  const photo = dialog.querySelector('[data-team-photo]');
  const name = dialog.querySelector('[data-team-name]');
  const role = dialog.querySelector('[data-team-role]');
  const body = dialog.querySelector('[data-team-body]');
  const close = dialog.querySelector('[data-team-close]');

  const openProfile = (index, button) => {
    const profile = profiles[index];
    if (!profile) return;
    opener = button;
    photo.className = `team-profile-dialog-photo ${profile.photoClass}`;
    photo.setAttribute('aria-label', `Fotografia de ${profile.name}`);
    name.textContent = profile.name;
    role.textContent = profile.role;
    body.innerHTML = profile.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');
    document.documentElement.classList.add('team-dialog-open');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    requestAnimationFrame(() => close.focus());
  };

  const closeProfile = () => {
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.documentElement.classList.remove('team-dialog-open');
    opener?.focus();
  };

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-team-open]');
    if (button) openProfile(Number(button.dataset.teamOpen), button);
  });
  close.addEventListener('click', closeProfile);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeProfile(); });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('team-dialog-open');
    opener?.focus();
  });
})();