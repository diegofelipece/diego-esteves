import { isRouteErrorResponse, Links, Outlet, Scripts, useRouteError } from 'react-router';
import type { ReactNode } from 'react';
import Footer from '../components/Footer';
import SeoTags from '../components/SeoTags';
import sitePath from '../utils/sitePath';
import '../styles/globals.scss';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={sitePath('/favicon.ico')} />
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
  return <Outlet />;
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
