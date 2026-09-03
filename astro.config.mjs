import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const SITE = 'https://linux-edu.vercel.app';

export default defineConfig({
  site: SITE,
  integrations: [
    starlight({
      title: '리눅스 입문',
      description: '윈도우 사용자를 위한 12주 리눅스 교육 과정',
      defaultLocale: 'root',
      locales: { root: { label: '한국어', lang: 'ko' } },
      customCss: ['./src/styles/tokens.css'],
      favicon: '/favicon.svg',
      // Starlight는 og:title·og:description·og:url·og:site_name 을 페이지마다 자동 생성한다.
      // 여기서는 이미지와 트위터 카드, 아이콘만 보탠다.
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: `${SITE}/og-linux.png` } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: '윈도우 사용자를 위한 리눅스 입문 — 12주 교육 커리큘럼' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${SITE}/og-linux.png` } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
      ],
      sidebar: [
        { label: '과정 안내', link: '/linux/' },
        {
          label: '주차별 교재',
          items: [
            { label: '1주차 · 첫 접속', link: '/linux/week-01/' },
            { label: '2주차 · 파일시스템', link: '/linux/week-02/' },
            { label: '3주차 · 셸과 파이프', link: '/linux/week-03/' },
            { label: '4주차 · 사용자와 권한', link: '/linux/week-04/' },
            { label: '5주차 · 프로세스와 서비스', link: '/linux/week-05/' },
            { label: '6주차 · 패키지·스토리지·로그', link: '/linux/week-06/' },
            { label: '7주차 · 네트워크와 SSH', link: '/linux/week-07/' },
            { label: '8주차 · 웹서버와 DB', link: '/linux/week-08/' },
            { label: '9주차 · 컨테이너와 자동화', link: '/linux/week-09/' },
            { label: '10주차 · 시스템 하드닝', link: '/linux/week-10/' },
            { label: '11주차 · 탐지와 사고대응', link: '/linux/week-11/' },
            { label: '12주차 · 최종 프로젝트', link: '/linux/week-12/' },
          ],
        },
      ],
    }),
  ],
});
