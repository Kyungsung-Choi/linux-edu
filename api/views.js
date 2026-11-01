import { get, put } from '@vercel/blob';
import { validSlug } from './_lib.js';
// 글별 조회수: 파일 하나(views.json)에 {slug: 횟수}. ETag로 동시 쓰기 충돌을 막고 3번까지 다시 시도한다.
// shortcut: 파일 하나라 방문이 아주 많아지면 충돌이 늘어난다, 하루 수천 건이 넘으면 Redis로 옮긴다.
const mem = globalThis.__viewMem || (globalThis.__viewMem = { map: {}, v: 0 });
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|curl|python|node-fetch/i;
async function load() {
  if (process.env.COMMENTS_STORE === 'memory') return { map: { ...mem.map }, etag: String(mem.v) };
  const r = await get('views.json', { access: 'private', useCache: false }).catch((e) => { if (e?.name === 'BlobNotFoundError') return null; throw e; });
  if (!r || r.statusCode !== 200) return { map: {}, etag: null };
  return { map: JSON.parse(await new Response(r.stream).text()), etag: r.blob.etag };
}
async function save(map, etag) {
  if (process.env.COMMENTS_STORE === 'memory') { if (etag !== String(mem.v)) { const e = new Error('c'); e.conflict = true; throw e; } mem.map = map; mem.v++; return; }
  try { await put('views.json', JSON.stringify(map), { access: 'private', allowOverwrite: true, contentType: 'application/json', ...(etag ? { ifMatch: etag } : {}) }); }
  catch (e) { if (e?.name === 'BlobPreconditionFailedError') e.conflict = true; throw e; }
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const slug = req.query.slug; if (!validSlug(slug)) return res.status(400).json({ error: 'slug' });
    if (req.method === 'GET') return res.status(200).json({ views: (await load()).map[slug] || 0 });
    if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
    if (req.headers.origin !== 'https://angdo.vercel.app' || BOT.test(req.headers['user-agent'] || '')) return res.status(200).json({ views: (await load()).map[slug] || 0 });
    for (let i = 0; i < 3; i++) {
      const { map, etag } = await load(); map[slug] = (map[slug] || 0) + 1;
      try { await save(map, etag); return res.status(200).json({ views: map[slug] }); } catch (e) { if (!e.conflict) throw e; }
    }
    return res.status(200).json({ views: (await load()).map[slug] || 0 });
  } catch (e) { console.error('views', e?.message); return res.status(500).json({ error: 'server' }); }
}
