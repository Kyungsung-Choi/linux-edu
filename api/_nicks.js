import { get, put } from '@vercel/blob';
// 닉네임 대장: 파일 하나({byUid:{uid:닉}, byNick:{소문자닉:uid}}). ETag로 동시 등록 충돌을 막는다.
const mem = globalThis.__nickMem || (globalThis.__nickMem = { d: { byUid: {}, byNick: {} }, v: 0 });
// 글자 종류 제한은 없다. 비어 있지 않고 20자 이내이며 제어문자가 없으면 된다(화면에는 textContent로 넣어 코드가 실행되지 않는다).
export const nickOk = (n) => n.length >= 1 && n.length <= 20 && !/[\u0000-\u001f\u007f]/.test(n);
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
// 운영자 전용 닉네임: 공백을 빼고 소문자로 비교해 '앵두 아빠', 'Admin' 같은 변형도 막는다. 운영자(ADMIN_UIDS)만 쓸 수 있다.
const RESERVED = ['관리자', '앵두아빠'];
export const isReserved = (n) => RESERVED.includes(n.replace(/\s+/g, '').toLowerCase());
