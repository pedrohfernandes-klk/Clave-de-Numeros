const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value) => typeof value === 'string' ? value.trim() : '';

export const validateContact = (input) => {
  const data = {
    nome: clean(input?.nome),
    email: clean(input?.email).toLowerCase(),
    atividade: clean(input?.atividade),
    mensagem: clean(input?.mensagem),
    idioma: clean(input?.idioma) === 'en' ? 'en' : 'pt',
    rgpd: input?.rgpd === true,
    website: clean(input?.website),
    turnstileToken: clean(input?.turnstileToken)
  };

  const errors = {};
  if (data.nome.length < 2 || data.nome.length > 100) errors.nome = 'invalid';
  if (!EMAIL.test(data.email) || data.email.length > 254) errors.email = 'invalid';
  if (data.atividade.length > 100) errors.atividade = 'invalid';
  if (data.mensagem.length < 10 || data.mensagem.length > 5000) errors.mensagem = 'invalid';
  if (!data.rgpd) errors.rgpd = 'required';
  if (!data.turnstileToken) errors.turnstileToken = 'required';

  return { ok: Object.keys(errors).length === 0, data, errors };
};
