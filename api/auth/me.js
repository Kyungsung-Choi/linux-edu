import { getUser, PROVIDERS } from '../_lib.js';
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store'); const u = getUser(req);
  res.status(200).json({ user: u ? { name: u.name, provider: u.provider } : null, providers: Object.entries(PROVIDERS).filter(([, p]) => p.id() && p.secret()).map(([k, p]) => ({ key: k, label: p.label })) });
}
