import { get, put } from '@vercel/blob';
// 닉네임 대장: 파일 하나({byUid:{uid:닉}, byNick:{소문자닉:uid}}). ETag로 동시 등록 충돌을 막는다.
const mem = globalThis.__nickMem || (globalThis.__nickMem = { d: { byUid: {}, byNick: {} }, v: 0 });
export const NICK_RE = /^[가-힣a-zA-Z0-9_]{2,12}$/;
const RESERVED = ['관리자', '운영자', '앵두아빠', 'admin', 'administrator', 'system'];
export const nickOk = (n) => NICK_RE.test(n) && !RESERVED.includes(n.toLowerCase());
export async function loadNicks() {
  if (process.env.COMMENTS_STORE === 'memory') return { d: structuredClone(mem.d), etag: String(mem.v) };
  const r = await get('nicks.json', { access: 'private', useCache: false }).catch((e) => { if (e?.name === 'BlobNotFoundError') return null; throw e; });
  if (!r || r.statusCode !== 200) return { d: { byUid: {}, byNick: {} }, etag: null };
  return { d: JSON.parse(await new Response(r.stream).text()), etag: r.blob.etag };
}
export async function saveNicks(d, etag) {
  if (process.env.COMMENTS_STORE === 'memory') { if (etag !== String(mem.v)) { const e = new Error('c'); e.conflict = true; throw e; } mem.d = d; mem.v++; return; }
  try { await put('nicks.json', JSON.stringify(d), { access: 'private', allowOverwrite: true, contentType: 'application/json', ...(etag ? { ifMatch: etag } : {}) }); }
  catch (e) { if (e?.name === 'BlobPreconditionFailedError') e.conflict = true; throw e; }
}
export const myNick = async (uid) => (await loadNicks()).d.byUid[uid] || null;
