import { setCookies, clearCookie, sameOrigin } from '../_lib.js';
export default function handler(req, res) {
  if (req.method !== 'POST' || !(req.headers.origin === 'https://angdo.vercel.app')) return res.status(403).json({ error: 'forbidden' });
  setCookies(res, [clearCookie('sid')]); res.status(200).json({ ok: true });
}
