const { createSession, json, sameOrigin, safeEqual, sessionCookie } = require('../lib/cms');

const attempts = new Map();

module.exports = (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!sameOrigin(req)) return json(res, 403, { error: 'Invalid request origin.' });
  if (!process.env.CMS_ADMIN_PASSWORD || !process.env.CMS_SESSION_SECRET) {
    return json(res, 503, { error: 'CMS authentication is not configured.' });
  }

  const address = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (attempts.get(address) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 8) return json(res, 429, { error: 'Too many attempts. Try again later.' });

  const password = String(req.body?.password || '');
  if (!safeEqual(password, process.env.CMS_ADMIN_PASSWORD)) {
    recent.push(now);
    attempts.set(address, recent);
    return json(res, 401, { error: 'Incorrect password.' });
  }

  attempts.delete(address);
  res.setHeader('Set-Cookie', sessionCookie(createSession()));
  return json(res, 200, { ok: true });
};
