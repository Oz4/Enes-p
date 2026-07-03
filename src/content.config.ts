import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    studio: z.string(),
    period: z.string(),
    summary: z.string(),
    tech: z.object({
      engine: z.string(),
      language: z.string(),
      networking: z.string(),
      keyLibs: z.string(),
      platform: z.string(),
      teamSize: z.string(),
      role: z.string(),
    }),
  }),
});

export const collections = { projects };
