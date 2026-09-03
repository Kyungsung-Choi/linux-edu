import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://Kyungsung-Choi.github.io',
  base: '/linux-edu',
  integrations: [
    starlight({
      title: '리눅스 입문',
      description: '윈도우 사용자를 위한 12주 리눅스 교육 과정',
      defaultLocale: 'root',
      locales: { root: { label: '한국어', lang: 'ko' } },
      customCss: ['./src/styles/tokens.css'],
      sidebar: [
        { label: '과정 안내', link: '/linux/' },
        {
          label: '주차별 교재',
          items: [{ label: '1주차 · 첫 접속', link: '/linux/week-01/' }],
        },
      ],
    }),
  ],
});
