const { json, sameOrigin, sessionCookie } = require('../lib/cms');

module.exports = (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!sameOrigin(req)) return json(res, 403, { error: 'Invalid request origin.' });
  res.setHeader('Set-Cookie', sessionCookie('', true));
  return json(res, 200, { ok: true });
};
