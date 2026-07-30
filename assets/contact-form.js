(() => {
  const form = document.querySelector('[data-contact-api-form]');
  if (!form) return;

  const config = window.CLAVE_CONTACT || {};
  const ok = form.querySelector('[data-notice-ok]');
  const error = form.querySelector('[data-notice-err]');
  const button = form.querySelector('button[type="submit"]');
  const captcha = form.querySelector('[data-turnstile]');
  const configured = /^https:\/\//.test(config.apiUrl || '')
    && !config.apiUrl.includes('SUBSTITUIR_')
    && config.turnstileSiteKey
    && !config.turnstileSiteKey.includes('SUBSTITUIR_');

  if (captcha && configured) captcha.dataset.sitekey = config.turnstileSiteKey;

  const showError = () => {
    error?.classList.add('err');
    error?.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    ok?.classList.remove('ok');
    error?.classList.remove('err');
    if (!configured || !form.reportValidity()) return showError();

    const data = new FormData(form);
    const turnstileToken = data.get('cf-turnstile-response');
    if (!turnstileToken) return showError();

    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.get('nome'),
          email: data.get('email'),
          atividade: data.get('atividade'),
          mensagem: data.get('mensagem'),
          idioma: document.documentElement.lang === 'en' ? 'en' : 'pt',
          rgpd: data.get('rgpd') === 'on',
          website: data.get('website') || '',
          turnstileToken
        })
      });
      if (!response.ok) throw new Error('Contact request failed');
      form.reset();
      window.turnstile?.reset();
      ok?.classList.add('ok');
      ok?.focus();
    } catch {
      window.turnstile?.reset();
      showError();
    } finally {
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
