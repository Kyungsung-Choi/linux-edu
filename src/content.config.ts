import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// 블로그 글: src/content/posts/ 에 마크다운 파일을 넣으면 /blog/ 에 나타난다.
// 파일 이름이 _ 로 시작하면 무시한다(_template.md 참고).
const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts,
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
