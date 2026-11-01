// 실행: COMMENTS_STORE=memory SESSION_SECRET=... node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.COMMENTS_STORE = 'memory'; process.env.SESSION_SECRET = 'x'.repeat(40);
process.env.GOOGLE_CLIENT_ID = 'gid'; process.env.GOOGLE_CLIENT_SECRET = 'gsec'; process.env.NAVER_CLIENT_ID = 'nid'; process.env.NAVER_CLIENT_SECRET = 'nsec'; process.env.KAKAO_CLIENT_ID = 'kid'; process.env.KAKAO_CLIENT_SECRET = 'ksec';
const lib = await import('../api/_lib.js');
const login = (await import('../api/auth/login.js')).default, cb = (await import('../api/auth/callback/[provider].js')).default, me = (await import('../api/auth/me.js')).default, logout = (await import('../api/auth/logout.js')).default, comments = (await import('../api/comments.js')).default;
const SITE = 'https://angdo.vercel.app';
const mkRes = () => { const r = { code: 200, headers: {}, body: null, loc: null }; r.setHeader = (k, v) => { r.headers[k] = v; }; r.status = (c) => { r.code = c; return r; }; r.json = (b) => { r.body = b; return r; }; r.redirect = (c, l) => { r.code = c; r.loc = l; return r; }; return r; };
const cookieOf = (res, name) => (res.headers['Set-Cookie'] || []).map((c) => c.split(';')[0]).find((c) => c.startsWith(name + '='));
const call = async (h, req) => { const res = mkRes(); await h({ method: 'GET', query: {}, headers: {}, ...req }, res); return res; };
async function signIn(provider, rawId, name) {
  const l = await call(login, { query: { provider, next: '/blog/alphabet-3y/' } }); const state = new URL(l.loc).searchParams.get('state'); const oas = cookieOf(l, 'oas');
  globalThis.fetch = async (url) => ({ json: async () => (String(url).includes('token') ? { access_token: 't' } : provider === 'google' ? { sub: rawId, name } : provider === 'kakao' ? { id: rawId } : { response: { id: rawId, nickname: name } }) });
  const c = await call(cb, { query: { provider, code: 'c', state }, headers: { cookie: oas } }); return { res: c, sid: cookieOf(c, 'sid') };
}
import nickH from '../api/nick.js';
let nn = 0;
const claim = (sid, nick) => call(nickH, { method: 'POST', headers: { cookie: sid || '', origin: SITE, 'content-type': 'application/json' }, body: { nick } });
// 일반 시험용: 닉네임이 없으면 자동으로 하나 정한 뒤 댓글을 쓴다(닉네임 시험은 postRaw를 쓴다)
const post = async (sid, body, extra = {}) => { if (sid && (await call(me, { headers: { cookie: sid } })).body.user?.nick === null) await claim(sid, 'tester' + ++nn); return postRaw(sid, body, extra); };
const postRaw = (sid, body, extra = {}) => call(comments, { method: 'POST', headers: { cookie: sid || '', origin: SITE, 'content-type': 'application/json' }, body, ...extra });

test('로그인 주소: 공급자별 주소·state 쿠키·안전한 next', async () => {
  const g = await call(login, { query: { provider: 'google', next: '/blog/alphabet-3y/' } }); const u = new URL(g.loc);
  assert.equal(u.host, 'accounts.google.com'); assert.equal(u.searchParams.get('redirect_uri'), SITE + '/api/auth/callback/google'); assert.ok(u.searchParams.get('state')); assert.equal(u.searchParams.get('scope'), 'openid profile');
  const n = await call(login, { query: { provider: 'naver', next: 'https://evil.com' } }); assert.equal(new URL(n.loc).host, 'nid.naver.com');
  assert.ok(cookieOf(n, 'oas'));
  const bad = await call(login, { query: { provider: 'x' } }); assert.match(bad.loc, /login=unavailable/);
});
test('콜백: state 불일치·쿠키 없음이면 로그인 실패', async () => {
  const l = await call(login, { query: { provider: 'google', next: '/blog/a/' } }); const oas = cookieOf(l, 'oas');
  const r1 = await call(cb, { query: { provider: 'google', code: 'c', state: 'WRONG' }, headers: { cookie: oas } }); assert.match(r1.loc, /login=fail/); assert.ok(!cookieOf(r1, 'sid'));
  const r2 = await call(cb, { query: { provider: 'google', code: 'c', state: new URL(l.loc).searchParams.get('state') } }); assert.match(r2.loc, /login=fail/);
  const r3 = await call(cb, { query: { provider: 'naver', code: 'c', state: new URL(l.loc).searchParams.get('state') }, headers: { cookie: oas } }); assert.ok(!cookieOf(r3, 'sid'));
});
test('구글·네이버 로그인 성공 → 세션 쿠키(HttpOnly·Secure), 이메일 저장 없음', async () => {
  const g = await signIn('google', 'g-123', '홍길동'); assert.match(g.res.loc, /login=ok#comments/); const raw = g.res.headers['Set-Cookie'].find((c) => c.startsWith('sid='));
  assert.match(raw, /HttpOnly/); assert.match(raw, /Secure/); assert.match(raw, /SameSite=Lax/); assert.ok(!raw.includes('g-123'));
  const m = await call(me, { headers: { cookie: g.sid } }); assert.equal(m.body.user.provider, 'google'); assert.deepEqual(m.body.providers.map((p) => p.key), ['google', 'naver', 'kakao']);
  const n = await signIn('naver', 'n-9', '별명'); assert.equal((await call(me, { headers: { cookie: n.sid } })).body.user.provider, 'naver');
});
test('변조·만료된 세션은 거부', async () => {
  const g = await signIn('google', 'g-1', 'A'); const bad = g.sid.slice(0, -2) + (g.sid.endsWith('A') ? 'BB' : 'AA');
  assert.equal((await call(me, { headers: { cookie: bad } })).body.user, null);
  assert.equal((await post(bad, { slug: 'alphabet-3y', text: 'hi' })).code, 401);
});
test('댓글: 로그인 없이 쓰기 불가, 로그인하면 가능, 목록 조회는 누구나', async () => {
  assert.equal((await post(null, { slug: 'alphabet-3y', text: 'hi' })).code, 401);
  const g = await signIn('google', 'g-2', '댓글러'); const ok = await post(g.sid, { slug: 'alphabet-3y', text: '  안녕하세요  ' }); assert.equal(ok.code, 201); assert.equal(ok.body.comment.text, '안녕하세요'); assert.equal(ok.body.comment.mine, true);
  const list = await call(comments, { query: { slug: 'alphabet-3y' } }); assert.equal(list.body.comments.length, 1); assert.equal(list.body.comments[0].mine, false); assert.ok(!('uid' in list.body.comments[0]));
});
test('댓글: 없는 글 주소·빈 내용·1000자 초과·연속 작성 거부', async () => {
  const g = await signIn('google', 'g-3', 'B');
  assert.equal((await post(g.sid, { slug: '../../etc', text: 'x' })).code, 400); assert.equal((await post(g.sid, { slug: 'no-such-post', text: 'x' })).code, 400);
  assert.equal((await post(g.sid, { slug: 'anthropic-s1', text: '   ' })).code, 400); assert.equal((await post(g.sid, { slug: 'anthropic-s1', text: 'a'.repeat(1001) })).code, 400);
  assert.equal((await post(g.sid, { slug: 'anthropic-s1', text: '첫 댓글' })).code, 201); assert.equal((await post(g.sid, { slug: 'anthropic-s1', text: '바로 또' })).code, 429);
});
test('보안: 다른 사이트에서 온 요청·JSON 아닌 요청 거부', async () => {
  const g = await signIn('google', 'g-4', 'C');
  assert.equal((await call(comments, { method: 'POST', headers: { cookie: g.sid, origin: 'https://evil.com', 'content-type': 'application/json' }, body: { slug: 'fomc-20261028', text: 'x' } })).code, 403);
  assert.equal((await call(comments, { method: 'POST', headers: { cookie: g.sid, origin: SITE, 'content-type': 'text/plain' }, body: { slug: 'fomc-20261028', text: 'x' } })).code, 403);
  assert.equal((await call(comments, { method: 'DELETE', headers: { cookie: g.sid, origin: 'https://evil.com' }, query: { slug: 'fomc-20261028', id: 'x' } })).code, 403);
  assert.equal((await call(logout, { method: 'POST', headers: { origin: 'https://evil.com' } })).code, 403);
});
test('삭제: 본인만 가능(다른 사람은 403)', async () => {
  const a = await signIn('google', 'g-5', 'A5'), b = await signIn('naver', 'n-5', 'B5');
  const c = (await post(a.sid, { slug: 'amzn-intc-20261030', text: '내 댓글' })).body.comment;
  const del = (sid) => call(comments, { method: 'DELETE', headers: { cookie: sid, origin: SITE }, query: { slug: 'amzn-intc-20261030', id: c.id } });
  assert.equal((await del(b.sid)).code, 403); assert.equal((await del(a.sid)).code, 200);
  assert.equal((await call(comments, { query: { slug: 'amzn-intc-20261030' } })).body.comments.length, 0);
});
test('이름·본문에 들어간 태그는 글자 그대로 저장(화면에서 textContent로만 출력)', async () => {
  const g = await signIn('google', 'g-6', '<img src=x onerror=alert(1)>'); const me2 = await call(me, { headers: { cookie: g.sid } }); assert.ok(!/[<>]/.test(me2.body.user.name));
  const r = await post(g.sid, { slug: 'alphabet-q3-20261028', text: '<script>alert(1)</script>' }); assert.equal(r.body.comment.text, '<script>alert(1)</script>');
});

test('조회수: 방문 때마다 1씩 늘고, 봇·다른 출처는 세지 않는다', async () => {
  const { default: h } = await import('../api/views.js');
  const call = async (method, headers = {}) => { let out; const res = { setHeader() {}, status() { return this; }, json(b) { out = b; return this; } }; await h({ method, query: { slug: 'anthropic-s1' }, headers }, res); return out; };
  const ok = { origin: 'https://angdo.vercel.app', 'user-agent': 'Mozilla/5.0' };
  assert.equal((await call('POST', ok)).views, 1);
  assert.equal((await call('POST', ok)).views, 2);
  assert.equal((await call('POST', { ...ok, 'user-agent': 'Googlebot' })).views, 2);
  assert.equal((await call('POST', { ...ok, origin: 'https://evil.com' })).views, 2);
  assert.equal((await call('GET')).views, 2);
});

test('닉네임: 계정당 1개 고정, 중복 불가(대소문자 무시), 형식 검사, 댓글엔 닉네임만', async () => {
  const g = await signIn('google', 'g-nick', '실명홍길동'), h = await signIn('naver', 'n-nick', '다른사람');
  assert.equal((await postRaw(g.sid, { slug: 'fomc-20261028', text: 'x' })).code, 400);
  for (const bad of ['a', 'a'.repeat(13), '안 녕', '<b>x</b>', '관리자', 'Admin']) assert.equal((await claim(g.sid, bad)).code, 400, bad);
  assert.equal((await claim(g.sid, '앵두팬')).code, 201);
  assert.equal((await claim(g.sid, '다른닉')).code, 409);
  assert.equal((await claim(h.sid, '앵두팬')).code, 409); assert.equal((await claim(h.sid, 'Cherry_1')).code, 201); assert.equal((await claim(g.sid, 'cherry_1')).code, 409);
  assert.equal((await call(me, { headers: { cookie: g.sid } })).body.user.nick, '앵두팬'); assert.ok(!('name' in (await call(me, { headers: { cookie: g.sid } })).body.user));
  const ok = await postRaw(g.sid, { slug: 'fomc-20261028', text: '좋은 글' }); assert.equal(ok.code, 201); assert.equal(ok.body.comment.name, '앵두팬');
  assert.equal((await call(nickH, { method: 'POST', headers: { cookie: '', origin: SITE, 'content-type': 'application/json' }, body: { nick: 'zzzz' } })).code, 401);
});

test('카카오 로그인: 로그인 주소와 세션(이름 저장 없음)', async () => {
  const l = await call(login, { query: { provider: 'kakao', next: '/blog/alphabet-3y/' } }); assert.equal(new URL(l.loc).host, 'kauth.kakao.com');
  const k = await signIn('kakao', 12345, 'x'); assert.ok(k.sid); const m = await call(me, { headers: { cookie: k.sid } }); assert.equal(m.body.user.provider, 'kakao');
});
