export const createRateLimiter = ({ windowMs, max }) => {
  const attempts = new Map();
  return (key, now = Date.now()) => {
    const recent = (attempts.get(key) || []).filter((time) => now - time < windowMs);
    recent.push(now);
    attempts.set(key, recent);
    if (attempts.size > 5000) {
      for (const [entry, times] of attempts) {
        if (!times.some((time) => now - time < windowMs)) attempts.delete(entry);
      }
    }
    return recent.length <= max;
  };
};

export const verifyTurnstile = async ({ secret, token, remoteIp, fetchImpl = fetch }) => {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);
  const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true;
};
