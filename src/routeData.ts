/**
 * Starlight 라우트 미들웨어 — 한 사이트 안에 교재를 여러 개 두기 위한 구획 처리.
 *
 * Starlight 의 사이드바·사이트 제목·이전/다음 링크는 원래 사이트 전체에 하나뿐이다.
 * 여기서 현재 페이지의 경로(/portfolio/<교재>/)를 보고
 *   - 사이드바를 그 교재 항목만 남기고
 *   - 이전/다음 링크가 다른 교재로 넘어가지 않게 끊고
 *   - 상단 제목과 <title>, og 메타를 그 교재 것으로 바꾼다.
 * 새 교재를 추가할 때는 SECTIONS 에 한 줄만 넣으면 된다.
 */
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import type { StarlightRouteData } from '@astrojs/starlight/route-data';

interface Section {
  prefix: string;
  /** 상단 제목·<title> 접미사. 없으면 Starlight 기본값(astro.config 의 title) 유지 */
  title?: string;
  /** 상단 제목을 눌렀을 때 갈 곳 */
  home?: string;
  /** 공유 미리보기 이미지 (사이트 루트 기준 경로) */
  ogImage?: string;
  ogImageAlt?: string;
}

const SECTIONS: Section[] = [
  { prefix: '/portfolio/linux/' },
  {
    prefix: '/portfolio/econ/',
    title: '연준 경제 읽기',
    home: '/portfolio/econ/',
    ogImage: '/og.png',
    ogImageAlt: '연준 뉴스를 읽기 위한 경제 기초 — 비전공자를 위한 2시간 개념 교재',
  },
];

type SidebarEntry = StarlightRouteData['sidebar'][number];

function within(entries: SidebarEntry[], prefix: string): SidebarEntry[] {
  const out: SidebarEntry[] = [];
  for (const e of entries) {
    if (e.type === 'link') {
      if (e.href.startsWith(prefix)) out.push(e);
    } else {
      const kids = within(e.entries, prefix);
      if (kids.length) out.push({ ...e, entries: kids });
    }
  }
  return out;
}

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const path = context.url.pathname.endsWith('/') ? context.url.pathname : `${context.url.pathname}/`;
  const sec = SECTIONS.find((s) => path.startsWith(s.prefix));
  if (!sec) return;

  // 1) 사이드바: 이 교재 항목만
  route.sidebar = within(route.sidebar, sec.prefix);

  // 2) 이전/다음: 교재 경계를 넘지 않게
  const { prev, next } = route.pagination;
  if (prev && !prev.href.startsWith(sec.prefix)) route.pagination.prev = undefined;
  if (next && !next.href.startsWith(sec.prefix)) route.pagination.next = undefined;

  if (!sec.title) return;

  // 3) 제목과 메타
  const oldTitle = route.siteTitle;
  route.siteTitle = sec.title;
  if (sec.home) route.siteTitleHref = sec.home;

  const site = context.site?.origin ?? '';
  for (const h of route.head) {
    if (h.tag === 'title' && typeof h.content === 'string' && oldTitle) {
      h.content = h.content.replace(` | ${oldTitle}`, ` | ${sec.title}`);
    }
    if (h.tag !== 'meta' || !h.attrs) continue;
    const key = (h.attrs.property ?? h.attrs.name) as string | undefined;
    if (key === 'og:site_name') h.attrs.content = sec.title;
    if (sec.ogImage && (key === 'og:image' || key === 'twitter:image')) h.attrs.content = `${site}${sec.ogImage}`;
    if (sec.ogImageAlt && key === 'og:image:alt') h.attrs.content = sec.ogImageAlt;
  }
});
