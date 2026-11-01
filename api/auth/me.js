import { getUser, PROVIDERS } from '../_lib.js';
import { myNick } from '../_nicks.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store'); const u = getUser(req);
  let nick = null; if (u) { try { nick = await myNick(u.uid); } catch { /* 닉네임을 못 읽어도 로그인 상태는 보여준다 */ } }
  res.status(200).json({ user: u ? { provider: u.provider, nick } : null, providers: Object.entries(PROVIDERS).filter(([, p]) => p.id() && p.secret()).map(([k, p]) => ({ key: k, label: p.label })) });
}
