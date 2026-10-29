// 하루치 언론기사를 포트폴리오(/portfolio/press/)에 올린다. 날짜별 파일로 쌓이고, 같은 날짜를 다시 올리면 그날 것만 교체된다.
// 사용: npm run press -- content.json [--date YYYY-MM-DD] [--pdf 파일.pdf] [--html 파일.html] [--slug 영문] [--deploy]
//  - 같은 날짜에 출처가 다른 호가 둘 이상이면 --slug 로 구분 (예: --slug ng → 2026-10-26_ng.json)
//  - content.json 은 신문브리핑 스킬과 같은 모양 (title, date, glance, articles[]...)
//  - --date 가 없으면 content.json 의 "2026년 10월 24일 토요일" 에서 날짜를 읽는다
//  - 같은 이름의 .pdf/.html 이 옆에 있으면 자동 사용
//  - --deploy 를 붙이면 변경분을 커밋·푸시한다 (Vercel 이 GitHub 푸시를 받아 사이트에 반영). 없으면 파일만 저장.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const take = (n) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const deploy = (() => { const i = args.indexOf('--deploy'); if (i >= 0) { args.splice(i, 1); return true; } return false; })();
const slugArg = take('--slug'), dateArg = take('--date'), pdfArg = take('--pdf'), htmlArg = take('--html');
const src = args[0];
if (!src || !existsSync(src)) { console.error('사용법: npm run press -- content.json [--date YYYY-MM-DD] [--pdf f.pdf] [--html f.html] [--deploy]'); process.exit(1); }

const issue = JSON.parse(readFileSync(src, 'utf8'));
if (!issue.title || !Array.isArray(issue.articles) || !issue.articles.length) { console.error('content.json 에 title 과 articles(1편 이상)가 있어야 해요.'); process.exit(1); }

let date = dateArg;
if (!date) {
  const m = String(issue.date ?? '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (m) date = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.error('날짜를 알 수 없어요. --date YYYY-MM-DD 로 알려 주세요.'); process.exit(1); }

if (slugArg) { if (!/^[a-z0-9]+$/.test(slugArg)) { console.error('--slug 는 영소문자·숫자만 쓸 수 있어요.'); process.exit(1); } date = `${date}_${slugArg}`; }
mkdirSync(join(ROOT, 'src/data/press'), { recursive: true });
mkdirSync(join(ROOT, 'public/press'), { recursive: true });
const dest = join(ROOT, 'src/data/press', `${date}.json`);
const replaced = existsSync(dest);
// 기사 images[].file (content.json 옆 경로)은 public/press/img/<날짜>/ 로 복사하고 src 로 바꿔 저장한다.
const imgAdded = [];
for (const a of issue.articles) {
  a.images = (a.images ?? []).filter((im) => !im.private); // 개인용(원문 사진 등)은 공개 사이트에 올리지 않는다
  for (const im of a.images) {
    if (!im.file) continue;
    const from = resolve(dirname(resolve(src)), im.file);
    if (!existsSync(from)) { console.error(`이미지를 찾을 수 없어요: ${from}`); process.exit(1); }
    mkdirSync(join(ROOT, 'public/press/img', date), { recursive: true });
    copyFileSync(from, join(ROOT, 'public/press/img', date, basename(from)));
    imgAdded.push(`public/press/img/${date}/${basename(from)}`);
    im.src = `/press/img/${date}/${basename(from)}`;
    delete im.file;
  }
}
writeFileSync(dest, JSON.stringify(issue, null, 2) + '\n');

const stem = join(dirname(resolve(src)), basename(src, extname(src)));
const added = [`src/data/press/${date}.json`, ...imgAdded];
for (const [ext, given] of [['pdf', pdfArg], ['html', htmlArg]]) {
  const f = given ?? `${stem}.${ext}`;
  if (existsSync(f)) { copyFileSync(f, join(ROOT, 'public/press', `${date}.${ext}`)); added.push(`public/press/${date}.${ext}`); }
}
console.log(`${date} ${replaced ? '교체' : '새로 저장'}: 기사 ${issue.articles.length}편, 파일 ${added.length}개`);

if (deploy) {
  const git = (...a) => execFileSync('git', a, { cwd: ROOT, stdio: 'inherit' });
  git('add', ...added);
  git('commit', '-m', `press: ${date} 언론기사 ${replaced ? '교체' : '추가'}`);
  git('push');
  console.log('푸시 완료. Vercel 이 자동으로 사이트에 반영합니다.');
} else {
  console.log('사이트에 올리려면 같은 명령에 --deploy 를 붙이세요. (미리보기: npm run dev → /portfolio/press/)');
}
