import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { aboutSchema, homeSchema, profileSchema, projectSchema, publishedProjects } from './schema.ts';

export function readContent(root = new URL('../', import.meta.url)) {
  function parse<T>(path: string, schema: z.ZodType<T>): T {
    try {
      return schema.parse(JSON.parse(readFileSync(new URL(path, root), 'utf8')));
    } catch (error) {
      throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  }
  const slugs = new Set<string>();
  const projects = readdirSync(new URL('content/projects/', root))
    .filter((name) => name.endsWith('.json')).map((name) => {
      const project = parse(`content/projects/${name}`, projectSchema);
      if (slugs.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}`);
      slugs.add(project.slug);
      if (name !== `${project.slug}.json`) throw new Error(`${name}: slug must match filename; existing URLs must stay stable`);
      return project;
    });
  const about = parse('content/pages/about.json', aboutSchema);
  const home = parse('content/settings/home.json', homeSchema);
  const profile = parse('content/profile/diego-esteves.json', profileSchema);

  const images = [
    ...home.bannerImages, home.about.image,
    ...projects.map((project) => project.coverImage),
    ...[about, ...projects].flatMap((page) => page.blocks.flatMap((block) => block.type === 'image' ? [block.src] : [])),
  ];
  for (const image of images) {
    const path = new URL(`public${image}`, root);
    try {
      if (!statSync(path).isFile()) throw new Error('Not a file');
    } catch {
      throw new Error(`Missing content image: ${image} (${fileURLToPath(path)})`);
    }
  }
  return { projects: publishedProjects(projects), about, home, profile };
}
