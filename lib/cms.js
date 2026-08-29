const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SESSION_COOKIE = 'codecrafts_cms_session';
const SESSION_TTL_SECONDS = 60 * 30;
const MAX_PAYLOAD_BYTES = 350000;
const DEFAULT_SUPABASE_URL = 'https://uztrgvutqnplyystqlwm.supabase.co';

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function parseCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((cookies, part) => {
    const index = part.indexOf('=');
    if (index < 0) return cookies;
    cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    return cookies;
  }, {});
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(value) {
  const secret = process.env.CMS_SESSION_SECRET;
  if (!secret) return '';
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function createSession() {
  const payload = base64url(JSON.stringify({ exp: Date.now() + SESSION_TTL_SECONDS * 1000 }));
  return `${payload}.${sign(payload)}`;
}

function isAuthenticated(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token || !process.env.CMS_SESSION_SECRET) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number(session.exp) > Date.now();
  } catch (_) {
    return false;
  }
}

function sessionCookie(token, clear = false) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const age = clear ? 0 : SESSION_TTL_SECONDS;
  return `${SESSION_COOKIE}=${clear ? '' : encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}; Priority=High${secure}`;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const forwardedHost = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  return origin === `${protocol}://${forwardedHost}`;
}

function fallbackContent() {
  const file = path.join(process.cwd(), 'content', 'site-content.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = { apikey: key, 'content-type': 'application/json' };
  if (!String(key).startsWith('sb_secret_')) headers.authorization = `Bearer ${key}`;
  return headers;
}

function hasSupabase() {
  return Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseUrl() {
  return String(process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
}

async function readContent() {
  if (!hasSupabase()) return { content: fallbackContent(), source: 'fallback' };
  const endpoint = `${supabaseUrl()}/rest/v1/site_content?key=eq.primary&select=payload&limit=1`;
  const response = await fetch(endpoint, { headers: supabaseHeaders() });
  if (!response.ok) throw new Error(`CMS read failed: ${response.status}`);
  const rows = await response.json();
  if (!rows[0]?.payload) return { content: fallbackContent(), source: 'supabase-empty' };
  return { content: rows[0].payload, source: 'supabase' };
}

async function writeContent(content) {
  if (!hasSupabase()) throw new Error('Supabase is not configured.');
  const endpoint = `${supabaseUrl()}/rest/v1/site_content?on_conflict=key`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { ...supabaseHeaders(), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key: 'primary', payload: content, updated_at: new Date().toISOString() })
  });
  if (!response.ok) throw new Error(`CMS write failed: ${response.status}`);
}

function validateContent(content) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return 'Content must be an object.';
  const size = Buffer.byteLength(JSON.stringify(content));
  if (size > MAX_PAYLOAD_BYTES) return 'Content payload is too large.';
  const required = ['site', 'seo', 'home', 'work', 'services', 'about', 'contact'];
  if (required.some((key) => !content[key] || typeof content[key] !== 'object')) return 'A required content section is missing.';
  if (!Array.isArray(content.work.projects) || !Array.isArray(content.services.items)) return 'Projects and services must be lists.';
  return null;
}

module.exports = {
  createSession,
  fallbackContent,
  hasSupabase,
  isAuthenticated,
  json,
  readContent,
  sameOrigin,
  safeEqual,
  sessionCookie,
  supabaseHeaders,
  supabaseUrl,
  validateContent,
  writeContent
};
