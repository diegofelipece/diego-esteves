import { Link } from 'react-router';
import SeoTags from '../../components/SeoTags';

export default function NotFound() {
  return (
    <main>
      <SeoTags pageTitle="Page not found" pageDescription="Diego Esteves portfolio" noIndex />
      <h1>Page not found</h1>
      <Link to="/">Return to portfolio</Link>
    </main>
  );
}
