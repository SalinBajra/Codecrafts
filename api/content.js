const { fallbackContent, json, readContent } = require('../lib/cms');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' });
  try {
    const result = await readContent();
    res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    res.setHeader('CDN-Cache-Control', 'no-store');
    return res.status(200).json(result.content);
  } catch (_) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    res.setHeader('CDN-Cache-Control', 'no-store');
    return res.status(200).json(fallbackContent());
  }
};
