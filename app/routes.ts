import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('../pages/index.tsx', [
    index('routes/home.tsx'),
    route('projects/:slug', 'routes/project.tsx'),
  ]),
  route('about', '../pages/about/index.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
