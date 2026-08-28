const crypto = require('crypto');
const { hasSupabase, isAuthenticated, json, sameOrigin, supabaseHeaders, supabaseUrl } = require('../lib/cms');

const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/svg+xml', 'svg']
]);
const MAX_BYTES = 3 * 1024 * 1024;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!isAuthenticated(req)) return json(res, 401, { error: 'Authentication required.' });
  if (!sameOrigin(req)) return json(res, 403, { error: 'Invalid request origin.' });
  if (!hasSupabase()) return json(res, 503, { error: 'Supabase is not configured.' });

  const type = String(req.body?.type || '').toLowerCase();
  const extension = ALLOWED_TYPES.get(type);
  const encoded = String(req.body?.data || '').replace(/^data:[^;]+;base64,/, '');
  if (!extension || !encoded) return json(res, 400, { error: 'Choose a PNG, JPG, WebP or SVG image.' });

  let file;
  try { file = Buffer.from(encoded, 'base64'); }
  catch (_) { return json(res, 400, { error: 'The image data is invalid.' }); }
  if (!file.length || file.length > MAX_BYTES) return json(res, 400, { error: 'Images must be smaller than 3 MB.' });

  const cleanName = String(req.body?.name || 'image').toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 55) || 'image';
  const objectName = `${new Date().toISOString().slice(0, 10)}/${cleanName}-${crypto.randomBytes(5).toString('hex')}.${extension}`;
  const base = supabaseUrl();
  const endpoint = `${base}/storage/v1/object/codecrafts-media/${objectName}`;
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: { ...supabaseHeaders(), 'content-type': type, 'x-upsert': 'false' }, body: file });
    if (!response.ok) throw new Error(`Storage upload failed: ${response.status}`);
    return json(res, 200, { url: `${base}/storage/v1/object/public/codecrafts-media/${objectName}` });
  } catch (error) {
    return json(res, 502, { error: error.message || 'The image could not be uploaded.' });
  }
};
