// 개인용 브리핑(원문 사진 포함 HTML)을 비밀번호로 암호화해 공개 사이트에 올려 두는 스크립트.
// 사용: PRESS_PW='비밀번호' node scripts/press-private.mjs <개인용.html> <YYYY-MM-DD>
// 결과: public/press/private/<날짜>.enc (salt16 + iv12 + AES-256-GCM 암호문), index.json(날짜 목록만)
// 보기: /portfolio/press/private/ 에서 비밀번호를 넣으면 브라우저에서 복호화한다. 서버에는 비밀번호가 없다.
// shortcut: 비밀번호가 약하면 공개 저장소의 암호문을 오프라인으로 무차별 대입할 수 있다. 12자 이상 긴 문장형 비밀번호를 쓴다.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [file, day] = process.argv.slice(2);
const pw = process.env.PRESS_PW;
if (!file || !/^\d{4}-\d{2}-\d{2}(_[a-z0-9]+)?$/.test(day ?? '') || !pw) { console.error('사용: PRESS_PW=비밀번호 node scripts/press-private.mjs 파일.html YYYY-MM-DD'); process.exit(1); }
if (pw.length < 12) { console.error('비밀번호는 12자 이상으로 해 주세요(공개 저장소에 암호문이 올라갑니다).'); process.exit(1); }
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(ROOT, 'public/press/private'); mkdirSync(dir, { recursive: true });
const salt = randomBytes(16), iv = randomBytes(12);
const key = pbkdf2Sync(pw, salt, 600000, 32, 'sha256');
const c = createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([c.update(readFileSync(file)), c.final(), c.getAuthTag()]);
writeFileSync(join(dir, `${day}.enc`), Buffer.concat([salt, iv, ct]));
const idxF = join(dir, 'index.json'); const idx = existsSync(idxF) ? JSON.parse(readFileSync(idxF, 'utf8')) : [];
if (!idx.includes(day)) idx.push(day); idx.sort().reverse(); writeFileSync(idxF, JSON.stringify(idx));
console.log(`암호화 저장: public/press/private/${day}.enc (${Math.round(ct.length / 1024)}KB)`);
