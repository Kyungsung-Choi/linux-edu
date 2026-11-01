import { PROVIDERS, redirectUri, setCookies, stateCookie, newState, safeNext } from '../_lib.js';
export default function handler(req, res) {
  const provider = PROVIDERS[req.query.provider]; const next = safeNext(req.query.next);
  if (!provider || !provider.id()) return res.redirect(302, next + '?login=unavailable#comments');
  const state = newState(); const u = new URL(provider.auth);
  u.searchParams.set('response_type', 'code'); u.searchParams.set('client_id', provider.id()); u.searchParams.set('redirect_uri', redirectUri(req.query.provider)); u.searchParams.set('state', state);
  if (provider.scope) u.searchParams.set('scope', provider.scope);
  setCookies(res, [stateCookie({ state, provider: req.query.provider, next })]);
  res.redirect(302, u.toString());
}
