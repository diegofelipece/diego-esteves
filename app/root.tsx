import { isRouteErrorResponse, Links, Outlet, Scripts, useLoaderData, useRouteError } from 'react-router';
import type { ReactNode } from 'react';
import Footer from '../components/Footer';
import SeoTags from '../components/SeoTags';
import sitePath from '../utils/sitePath';
import { ProfileDateProvider } from '../components/ProfileDate';
import '../styles/globals.scss';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={sitePath('/favicon.ico')} />
        <link rel="alternate" type="application/json" title="Professional profile" href={sitePath('/diego-esteves.json')} />
        <Links />
      </head>
      <body>
        {children}
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { renderedAt } = useLoaderData<typeof loader>();
  return <ProfileDateProvider renderedAt={renderedAt}><Outlet /></ProfileDateProvider>;
}

export function loader() {
  return { renderedAt: new Date().toISOString() };
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main>
      <SeoTags pageTitle={notFound ? 'Page not found' : 'Unable to load page'} pageDescription="Diego Esteves portfolio" noIndex />
      <h1>{notFound ? 'Page not found' : 'Unable to load page'}</h1>
      <a href={sitePath('/')}>Return to portfolio</a>
    </main>
  );
}
