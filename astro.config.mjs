import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const SITE = 'https://linux-edu.vercel.app';

export default defineConfig({
  site: SITE,
  redirects: {
    '/linux/week-01/': '/portfolio/linux/chapter-01/',
    '/linux/week-02/': '/portfolio/linux/chapter-02/',
    '/linux/week-03/': '/portfolio/linux/chapter-03/',
    '/linux/week-04/': '/portfolio/linux/chapter-04/',
    '/linux/week-05/': '/portfolio/linux/chapter-05/',
    '/linux/week-06/': '/portfolio/linux/chapter-06/',
    '/linux/week-07/': '/portfolio/linux/chapter-07/',
    '/linux/week-08/': '/portfolio/linux/chapter-08/',
    '/linux/week-09/': '/portfolio/linux/chapter-09/',
    '/linux/week-10/': '/portfolio/linux/chapter-10/',
    '/linux/week-11/': '/portfolio/linux/chapter-11/',
    '/linux/week-12/': '/portfolio/linux/chapter-12/',
    '/linux/': '/portfolio/linux/',
    '/linux/chapter-01/': '/portfolio/linux/chapter-01/',
    '/linux/chapter-02/': '/portfolio/linux/chapter-02/',
    '/linux/chapter-03/': '/portfolio/linux/chapter-03/',
    '/linux/chapter-04/': '/portfolio/linux/chapter-04/',
    '/linux/chapter-05/': '/portfolio/linux/chapter-05/',
    '/linux/chapter-06/': '/portfolio/linux/chapter-06/',
    '/linux/chapter-07/': '/portfolio/linux/chapter-07/',
    '/linux/chapter-08/': '/portfolio/linux/chapter-08/',
    '/linux/chapter-09/': '/portfolio/linux/chapter-09/',
    '/linux/chapter-10/': '/portfolio/linux/chapter-10/',
    '/linux/chapter-11/': '/portfolio/linux/chapter-11/',
    '/linux/chapter-12/': '/portfolio/linux/chapter-12/',
  },
  integrations: [
    starlight({
      title: '리눅스 입문',
      description: '윈도우 사용자를 위한 12주 리눅스 교육 과정',
      defaultLocale: 'root',
      locales: { root: { label: '한국어', lang: 'ko' } },
      customCss: ['./src/styles/tokens.css'],
      favicon: '/favicon.svg',
      // 오른쪽 "목차" 칼럼을 없애고, 대신 왼쪽 사이드바의 현재 챕터 밑에
      // 그 챕터의 목차를 바로 펼쳐 보여준다 (components.Sidebar 오버라이드).
      tableOfContents: false,
      components: {
        Sidebar: './src/components/Sidebar.astro',
      },
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
        { label: '과정 안내', link: '/portfolio/linux/' },
        {
          label: '챕터별 교재',
          items: [
            { label: 'Chapter 1 · 첫 접속', link: '/portfolio/linux/chapter-01/' },
            { label: 'Chapter 2 · 파일시스템', link: '/portfolio/linux/chapter-02/' },
            { label: 'Chapter 3 · 셸과 파이프', link: '/portfolio/linux/chapter-03/' },
            { label: 'Chapter 4 · 사용자와 권한', link: '/portfolio/linux/chapter-04/' },
            { label: 'Chapter 5 · 프로세스와 서비스', link: '/portfolio/linux/chapter-05/' },
            { label: 'Chapter 6 · 패키지·스토리지·로그', link: '/portfolio/linux/chapter-06/' },
            { label: 'Chapter 7 · 네트워크와 SSH', link: '/portfolio/linux/chapter-07/' },
            { label: 'Chapter 8 · 웹서버와 DB', link: '/portfolio/linux/chapter-08/' },
            { label: 'Chapter 9 · 컨테이너와 자동화', link: '/portfolio/linux/chapter-09/' },
            { label: 'Chapter 10 · 시스템 하드닝', link: '/portfolio/linux/chapter-10/' },
            { label: 'Chapter 11 · 탐지와 사고대응', link: '/portfolio/linux/chapter-11/' },
            { label: 'Chapter 12 · 최종 프로젝트', link: '/portfolio/linux/chapter-12/' },
          ],
        },
      ],
    }),
  ],
});
