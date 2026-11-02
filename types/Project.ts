import type { ReactNode } from "react";

export interface ProjectLink {
  url: string;
  icon?: string; 
}

export interface Project {
  excerpt: ProjectExerpt;
  content?: ReactNode;
  links?: (ProjectLink|string)[];
  hidden?: boolean;
}

export interface ProjectExerpt {
  slug: string;
  title: string;
  category: string;
  coverImage: string;
}