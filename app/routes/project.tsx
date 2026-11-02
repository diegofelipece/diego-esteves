import type { LoaderFunctionArgs } from 'react-router';
import { loader as loadProject } from '../../projects/_index';

export function loader({ params }: LoaderFunctionArgs) {
  if (!params.slug || !loadProject(params.slug)) {
    throw new Response('Not found', { status: 404 });
  }
  return null;
}

export default function ProjectRoute() {
  return null;
}
