import { z } from 'zod';
import { fromMarkdown } from 'mdast-util-from-markdown';

const text = z.string().trim().min(1);
export const mediaPath = text.regex(/^\/images\/[^?#\\]+$/).refine(
  (value) => value.split('/').every((part, index) => index === 0 || (part !== '' && part !== '.' && part !== '..' && !part.includes('%'))),
  'Use a normalized /images/... path without traversal or URL escapes',
);
const link = text.refine((value) => {
  try {
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol);
  } catch {
    return false;
  }
}, 'Use an absolute http, https, or mailto URL');

const markdown = text.superRefine((value, context) => {
  function visit(node: ReturnType<typeof fromMarkdown> | ReturnType<typeof fromMarkdown>['children'][number]) {
    if (node.type === 'html' || node.type === 'image' || node.type === 'imageReference') {
      context.addIssue({ code: 'custom', message: 'Raw HTML and inline images are not supported; use an image block' });
    }
    if ((node.type === 'link' || node.type === 'definition') && !link.safeParse(node.url).success) {
      context.addIssue({ code: 'custom', message: `Unsupported link URL: ${node.url}` });
    }
    if ('children' in node) node.children.forEach(visit);
  }
  visit(fromMarkdown(value.replaceAll('{{age}}', '36').replaceAll('{{birthday}}', '')));
});

export const blockSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('text'), body: markdown }),
  z.strictObject({ type: z.literal('heading'), text: markdown, level: z.union([z.literal(2), z.literal(3), z.literal(4)]) }),
  z.strictObject({
    type: z.literal('image'), src: mediaPath, alt: z.string().default(''),
    width: z.number().int().positive(), height: z.number().int().positive(),
  }),
]);
const blocks = z.array(blockSchema).min(1);

export const projectSchema = z.strictObject({
  slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: text, category: text, coverImage: mediaPath,
  order: z.number().int().nonnegative(), published: z.boolean(),
  description: text, blocks,
  links: z.array(z.strictObject({
    url: link,
    icon: z.enum(['android', 'apple', 'behance', 'facebook', 'github', 'link', 'linkedin', 'tumbl']).optional(),
  })).default([]),
});

export const aboutSchema = z.strictObject({ title: text, description: text, blocks });
export const homeSchema = z.strictObject({
  title: text, description: text, logoTitle: text, tagline: text,
  bannerImages: z.array(mediaPath).min(1),
  about: z.strictObject({
    heading: text, text, image: mediaPath, imageAlt: z.string().default(''), buttonLabel: text,
  }),
});

const calendarDate = text.regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Use a real calendar date in YYYY-MM-DD format');
export const profileSchema = z.strictObject({
  basics: z.strictObject({
    name: text, label: text, summary: text, birthDate: calendarDate, url: link,
    profiles: z.array(z.strictObject({ network: text, url: link })),
  }),
  work: z.array(z.strictObject({
    name: text, position: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(), summary: z.string().optional(),
  })),
  education: z.array(z.strictObject({
    institution: text, area: z.string().optional(), studyType: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(),
  })),
  skills: z.array(z.strictObject({ name: text, keywords: z.array(text) })),
  projects: z.array(z.strictObject({ name: text, startDate: z.string().optional(), url: link.or(z.literal('')).optional(), description: z.string().optional() })),
});

export type ContentBlock = z.infer<typeof blockSchema>;
export type ProjectContent = z.infer<typeof projectSchema>;
export type AboutContent = z.infer<typeof aboutSchema>;
export type HomeContent = z.infer<typeof homeSchema>;
export type ProfileContent = z.infer<typeof profileSchema>;

export function publishedProjects(projects: ProjectContent[]) {
  return projects.filter((project) => project.published)
    .sort((a, b) => a.order - b.order || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}
