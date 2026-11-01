import { PROVIDERS, redirectUri, readState, setCookies, sessionCookie, clearCookie, userId } from '../../_lib.js';
export default async function handler(req, res) {
  const name = req.query.provider; const provider = PROVIDERS[name]; const st = readState(req);
  const back = (st?.next || '/') + '?login=';
  try {
    if (!provider || !st || st.provider !== name || !req.query.state || req.query.state !== st.state) throw new Error('state');
    if (req.query.error || !req.query.code) throw new Error('denied');
    const p = await provider.profile(String(req.query.code), redirectUri(name), String(req.query.state));
    setCookies(res, [sessionCookie({ uid: userId(name, p.id), name: p.name, provider: name }), clearCookie('oas')]);
    res.redirect(302, back + 'ok#comments');
  } catch (e) {
    setCookies(res, [clearCookie('oas')]); res.redirect(302, back + 'fail#comments');
  }
}
