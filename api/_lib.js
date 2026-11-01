// 댓글 기능 공용 도구: 서명 쿠키 세션, OAuth 설정, 저장소(Vercel Blob 비공개), 입력 검증
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { get, put } from '@vercel/blob';
import SLUGS from './_slugs.json' with { type: 'json' };

export const SITE = 'https://angdo.vercel.app';
const SECRET = () => { const s = process.env.SESSION_SECRET; if (!s || s.length < 32) throw new Error('SESSION_SECRET 필요'); return s; };
const b64 = (b) => Buffer.from(b).toString('base64url');
const sign = (payload) => { const body = b64(JSON.stringify(payload)); return body + '.' + createHmac('sha256', SECRET()).update(body).digest('base64url'); };
const verify = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, mac] = token.split('.'); const want = createHmac('sha256', SECRET()).update(body).digest('base64url');
  const a = Buffer.from(mac), b = Buffer.from(want); if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() ? p : null; } catch { return null; }
};
export const parseCookies = (req) => Object.fromEntries((req.headers.cookie || '').split(/;\s*/).filter(Boolean).map((c) => { const i = c.indexOf('='); return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))]; }));
const cookie = (name, value, maxAge) => `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
export const setCookies = (res, list) => res.setHeader('Set-Cookie', list);
export const sessionCookie = (user) => cookie('sid', sign({ ...user, exp: Date.now() + 30 * 864e5 }), 30 * 86400);
export const clearCookie = (name) => cookie(name, '', 0);
export const stateCookie = (data) => cookie('oas', sign({ ...data, exp: Date.now() + 10 * 60e3 }), 600);
export const readState = (req) => verify(parseCookies(req).oas);
export const getUser = (req) => { const p = verify(parseCookies(req).sid); return p ? { uid: p.uid, name: p.name, provider: p.provider } : null; };
export const newState = () => randomBytes(16).toString('hex');
export const userId = (provider, rawId) => provider + ':' + createHash('sha256').update(SECRET() + provider + String(rawId)).digest('hex').slice(0, 24);
export const cleanName = (n, fallback) => String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 30) || fallback;

export const PROVIDERS = {
  google: {
    label: '구글', auth: 'https://accounts.google.com/o/oauth2/v2/auth', scope: 'openid profile',
    id: () => process.env.GOOGLE_CLIENT_ID, secret: () => process.env.GOOGLE_CLIENT_SECRET,
    async profile(code, redirect) {
      const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: this.id(), client_secret: this.secret(), redirect_uri: redirect, grant_type: 'authorization_code' }), signal: AbortSignal.timeout(8000) })).json();
      if (!t.access_token) throw new Error('google token');
      const p = await (await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { authorization: 'Bearer ' + t.access_token }, signal: AbortSignal.timeout(8000) })).json();
      if (!p.sub) throw new Error('google profile');
      return { id: p.sub, name: cleanName(p.name || p.given_name, '구글 회원') };
    },
  },
  naver: {
    label: '네이버', auth: 'https://nid.naver.com/oauth2.0/authorize', scope: '',
    id: () => process.env.NAVER_CLIENT_ID, secret: () => process.env.NAVER_CLIENT_SECRET,
    async profile(code, redirect, state) {
      const u = new URL('https://nid.naver.com/oauth2.0/token'); Object.entries({ grant_type: 'authorization_code', client_id: this.id(), client_secret: this.secret(), code, state }).forEach(([k, v]) => u.searchParams.set(k, v));
      const t = await (await fetch(u, { signal: AbortSignal.timeout(8000) })).json();
      if (!t.access_token) throw new Error('naver token');
      const p = (await (await fetch('https://openapi.naver.com/v1/nid/me', { headers: { authorization: 'Bearer ' + t.access_token }, signal: AbortSignal.timeout(8000) })).json()).response;
      if (!p?.id) throw new Error('naver profile');
      return { id: p.id, name: cleanName(p.nickname || p.name, '네이버 회원') };
    },
  },
};
export const redirectUri = (provider) => `${SITE}/api/auth/callback/${provider}`;
export const safeNext = (n) => (typeof n === 'string' && /^\/blog\/[a-z0-9-]+\/?$/.test(n) ? n : '/');

// ---- 저장소: 글(slug)마다 비공개 JSON 하나. ETag로 동시 쓰기 충돌을 막는다
export const validSlug = (s) => typeof s === 'string' && SLUGS.includes(s);
const path = (slug) => `comments/${slug}.json`;
const mem = globalThis.__commentMem || (globalThis.__commentMem = new Map());
export async function load(slug) {
  if (process.env.COMMENTS_STORE === 'memory') return { list: mem.get(slug) || [], etag: String((mem.get(slug) || []).length) };
  const r = await get(path(slug), { access: 'private', useCache: false }).catch((e) => { if (e?.name === 'BlobNotFoundError') return null; throw e; });
  if (!r || r.statusCode !== 200) return { list: [], etag: null };
  const text = await new Response(r.stream).text(); return { list: JSON.parse(text), etag: r.blob.etag };
}
export async function save(slug, list, etag) {
  if (process.env.COMMENTS_STORE === 'memory') { if (etag !== String((mem.get(slug) || []).length)) { const e = new Error('conflict'); e.conflict = true; throw e; } mem.set(slug, list); return; }
  try { await put(path(slug), JSON.stringify(list), { access: 'private', allowOverwrite: true, contentType: 'application/json', ...(etag ? { ifMatch: etag } : {}) }); }
  catch (e) { if (e?.name === 'BlobPreconditionFailedError') e.conflict = true; throw e; }
}
export const cleanText = (t) => String(t ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/\n{3,}/g, '\n\n').trim();
export const sameOrigin = (req) => req.headers.origin === SITE && /^application\/json/.test(req.headers['content-type'] || '');
