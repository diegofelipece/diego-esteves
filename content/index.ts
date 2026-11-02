import type { AboutContent, HomeContent, ProjectContent } from './schema';
import aboutData from './pages/about.json';
import homeData from './settings/home.json';

const files = import.meta.glob<ProjectContent>('./projects/*.json', { eager: true, import: 'default' });
export const projects = Object.values(files).filter((project) => project.published)
  .sort((a, b) => a.order - b.order || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
export const about: AboutContent = aboutData as AboutContent;
export const home: HomeContent = homeData;
