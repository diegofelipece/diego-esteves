import { createElement } from 'react';
import { projects } from '../content';
import ContentBlocks from '../components/ContentBlocks';
import type { Project, ProjectExerpt } from '../types/Project';

const catalog: Record<string, Project> = Object.fromEntries(projects.map((project) => [
  project.slug,
  {
    excerpt: {
      slug: project.slug, title: project.title, category: project.category,
      coverImage: project.coverImage, description: project.description,
    },
    content: createElement(ContentBlocks, { blocks: project.blocks }),
    links: project.links,
  },
]));

const excerpts: ProjectExerpt[] = Object.values(catalog).map((project) => project.excerpt);
export const loader = (slug: string): Project | undefined => catalog[slug];
export default excerpts;
