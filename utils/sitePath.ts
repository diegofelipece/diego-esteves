const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const sitePath = (path: string) => {
  const normalizedPath = `/${path.split('/').filter(Boolean).join('/')}${path.endsWith('/') && path !== '/' ? '/' : ''}`;
  return `${basePath}${normalizedPath}`;
};

export default sitePath;
