import CMS from 'decap-cms-app';
import type { CmsConfig, PreviewTemplateComponentProps } from 'decap-cms-core';
import type { ContentBlock } from '../content/schema';
import ContentBlocks from '../components/ContentBlocks';
import { interpolateContent, ProfileDateProvider, useProfileDate } from '../components/ProfileDate';
import previewStyles from '../styles/globals.scss?inline';
import blockStyles from '../styles/components/GenericBlock.module.scss?inline';
import imageStyles from '../styles/components/ImageBlock.module.scss?inline';

const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
const status = document.getElementById('cms-status')!;

async function initialize() {
  if (!import.meta.env.DEV || !isLoopback) throw new Error('The content manager is available only in local development on loopback addresses.');
  const response = await fetch(`${import.meta.env.BASE_URL}config.yml`);
  if (!response.ok) throw new Error('Unable to load CMS configuration.');
  const config = await response.json() as CmsConfig;
  if (!config.local_backend) throw new Error('The local editing backend is required.');
  const siteBase = import.meta.env.BASE_URL.replace(/\/admin\/$/, '');
  CMS.registerPreviewStyle([previewStyles, blockStyles, imageStyles].join('\n').replaceAll('/fonts/', `${siteBase}/fonts/`), { raw: true });
  const Preview = ({ entry, getAsset }: PreviewTemplateComponentProps) => {
    const info = useProfileDate();
    const data = entry.get('data').toJS() as Record<string, unknown>;
    const blocks = (data.blocks || []) as ContentBlock[];
    const resolveImage = (path: string) => {
      const asset = getAsset(path)?.toString() || path;
      return asset.startsWith('/images/') ? `${siteBase}${asset}` : asset;
    };
    const about = data.about as { heading?: string; text?: string; image?: string; imageAlt?: string; buttonLabel?: string } | undefined;
    return (
      <article style={{ background: 'white', padding: '2rem', maxWidth: 980, margin: 'auto' }}>
        <h1>{String(data.title || 'Preview')}</h1>
        {data.tagline ? <p>{String(data.tagline)}</p> : null}
        <ContentBlocks blocks={blocks} resolveImage={resolveImage} />
        {about ? <>
          <h2>{about.heading}</h2>
          {about.image ? <img src={resolveImage(about.image)} alt={about.imageAlt || ''} style={{ maxWidth: '100%' }} /> : null}
          <p>{interpolateContent(about.text || '', info)}</p>
          <p>{about.buttonLabel}</p>
        </> : null}
        {data.basics ? <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre> : null}
      </article>
    );
  };
  const preview = (props: PreviewTemplateComponentProps) => <ProfileDateProvider><Preview {...props} /></ProfileDateProvider>;
  CMS.registerPreviewTemplate('projects', preview);
  CMS.registerPreviewTemplate('about', preview);
  CMS.registerPreviewTemplate('home', preview);
  CMS.registerPreviewTemplate('profile', preview);
  status.remove();
  CMS.init({ config });
}

initialize().catch((error: unknown) => {
  status.textContent = error instanceof Error ? error.message : 'Unable to start the content manager.';
});
