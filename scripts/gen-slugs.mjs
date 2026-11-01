// 댓글 API가 받아들일 글 주소(slug) 목록을 글 폴더에서 만든다(임의 주소로 저장소가 채워지는 것을 막는다)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const dir = new URL('../src/content/posts/', import.meta.url);
const slugs = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).filter((f) => !/^draft:\s*true/m.test(readFileSync(new URL(f, dir), 'utf8').split('---')[1] || '')).map((f) => f.replace(/\.md$/, '')).sort();
writeFileSync(new URL('../api/_slugs.json', import.meta.url), JSON.stringify(slugs) + '\n'); console.log('slugs', slugs.length);
