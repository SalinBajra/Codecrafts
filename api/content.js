const { fallbackContent, json, readContent } = require('../lib/cms');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' });
  try {
    const result = await readContent();
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    return res.status(200).json(result.content);
  } catch (_) {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=600');
    return res.status(200).json(fallbackContent());
  }
};
