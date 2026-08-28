const { isAuthenticated, json, readContent, sameOrigin, validateContent, writeContent } = require('../lib/cms');

module.exports = async (req, res) => {
  if (!isAuthenticated(req)) return json(res, 401, { error: 'Authentication required.' });

  if (req.method === 'GET') {
    try {
      const result = await readContent();
      return json(res, 200, { content: result.content, source: result.source });
    } catch (_) {
      return json(res, 503, { error: 'Could not load CMS content.' });
    }
  }

  if (req.method === 'PUT') {
    if (!sameOrigin(req)) return json(res, 403, { error: 'Invalid request origin.' });
    const content = req.body?.content;
    const validationError = validateContent(content);
    if (validationError) return json(res, 400, { error: validationError });
    const next = { ...content, version: Number(content.version || 0) + 1, updatedAt: new Date().toISOString() };
    try {
      await writeContent(next);
      return json(res, 200, { ok: true, content: next });
    } catch (error) {
      return json(res, 503, { error: error.message || 'Could not publish content.' });
    }
  }

  return json(res, 405, { error: 'Method not allowed.' });
};
