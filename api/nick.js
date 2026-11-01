import { getUser, sameOrigin } from './_lib.js';
import { loadNicks, saveNicks, nickOk, myNick } from './_nicks.js';
// 계정당 닉네임 1개를 정하면 바꿀 수 없다. 이미 쓰는 닉네임(대소문자 무시)은 거절한다.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store'); const me = getUser(req);
  if (!me) return res.status(401).json({ error: 'login' });
  try {
    if (req.method === 'GET') return res.status(200).json({ nick: await myNick(me.uid) });
    if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
    if (!sameOrigin(req)) return res.status(403).json({ error: 'origin' });
    const nick = String(req.body?.nick ?? '').trim(); if (!nickOk(nick)) return res.status(400).json({ error: 'nickfmt' });
    for (let i = 0; i < 3; i++) {
      const { d, etag } = await loadNicks();
      if (d.byUid[me.uid]) return res.status(409).json({ error: 'nickset', nick: d.byUid[me.uid] });
      const key = nick.toLowerCase(); if (d.byNick[key]) return res.status(409).json({ error: 'nicktaken' });
      d.byUid[me.uid] = nick; d.byNick[key] = me.uid;
      try { await saveNicks(d, etag); return res.status(201).json({ nick }); } catch (e) { if (!e.conflict) throw e; }
    }
    return res.status(503).json({ error: 'busy' });
  } catch (e) { console.error('nick', e?.message); return res.status(500).json({ error: 'server' }); }
}
