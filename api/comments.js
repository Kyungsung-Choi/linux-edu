import { cleanName, getUser, validSlug, load, save, cleanText, sameOrigin } from './_lib.js';
const MAX = 1000, PER_SLUG = 300, GAP_MS = 15000;
const ADMIN = () => (process.env.ADMIN_UIDS || '').split(',').map((s) => s.trim()).filter(Boolean);
const pub = (c, me) => ({ id: c.id, name: c.name, provider: c.provider, text: c.text, at: c.at, mine: !!me && (c.uid === me.uid || ADMIN().includes(me.uid)) });
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store'); const me = getUser(req);
  try {
    if (req.method === 'GET') {
      const slug = req.query.slug; if (!validSlug(slug)) return res.status(400).json({ error: 'slug' });
      const { list } = await load(slug); return res.status(200).json({ comments: list.map((c) => pub(c, me)) });
    }
    if (!sameOrigin(req) && req.method !== 'DELETE') return res.status(403).json({ error: 'origin' });
    if (req.method === 'DELETE' && req.headers.origin !== 'https://angdo.vercel.app') return res.status(403).json({ error: 'origin' });
    if (!me) return res.status(401).json({ error: 'login' });
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (req.method === 'POST') {
          const { slug, text, nick } = req.body || {}; if (!validSlug(slug)) return res.status(400).json({ error: 'slug' });
          const nm = cleanName(nick, '').slice(0, 12); if (nm.length < 2) return res.status(400).json({ error: 'nick' });
          const t = cleanText(text); if (!t) return res.status(400).json({ error: 'empty' }); if (t.length > MAX) return res.status(400).json({ error: 'long' });
          const { list, etag } = await load(slug);
          if (list.length >= PER_SLUG) return res.status(429).json({ error: 'full' });
          const last = [...list].reverse().find((c) => c.uid === me.uid); if (last && Date.now() - last.at < GAP_MS) return res.status(429).json({ error: 'fast' });
          const c = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), uid: me.uid, name: nm, provider: me.provider, text: t, at: Date.now() };
          await save(slug, [...list, c], etag); return res.status(201).json({ comment: pub(c, me) });
        }
        if (req.method === 'DELETE') {
          const { slug, id } = req.query; if (!validSlug(slug) || !id) return res.status(400).json({ error: 'args' });
          const { list, etag } = await load(slug); const c = list.find((x) => x.id === id);
          if (!c) return res.status(404).json({ error: 'none' }); if (c.uid !== me.uid && !ADMIN().includes(me.uid)) return res.status(403).json({ error: 'owner' });
          await save(slug, list.filter((x) => x.id !== id), etag); return res.status(200).json({ ok: true });
        }
        return res.status(405).json({ error: 'method' });
      } catch (e) { if (!e.conflict || attempt === 2) throw e; }
    }
  } catch (e) { console.error('comments', e?.name, e?.message); return res.status(500).json({ error: 'server' }); }
}
