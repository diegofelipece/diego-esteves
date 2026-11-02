import Markdown from 'react-markdown';
import type { ContentBlock } from '../content/schema';
import GenericBlock from './GenericBlock';
import ImageBlock from './ImageBlock';
import { interpolateContent, useProfileDate } from './ProfileDate';

export default function ContentBlocks({ blocks, resolveImage }: {
  blocks: ContentBlock[],
  resolveImage?: (path: string) => string,
}) {
  const info = useProfileDate();
  return blocks.map((block, index) => {
    if (block.type === 'image') {
      if (!block.src) return null;
      return <ImageBlock key={index} src={block.src} alt={block.alt} width={block.width} heigth={block.height} resolvedSrc={resolveImage?.(block.src)} />;
    }
    const markdown = (
      <Markdown
        skipHtml
        components={{
          p: ({ children }) => block.type === 'heading' ? <>{children}</> : <p>{children}</p>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>,
          em: ({ children }) => <i>{children}</i>,
          img: () => null,
        }}
      >{interpolateContent(block.type === 'text' ? block.body : block.text, info)}</Markdown>
    );
    if (block.type === 'text') return <GenericBlock key={index}>{markdown}</GenericBlock>;
    const Heading = `h${block.level || 3}` as 'h2' | 'h3' | 'h4';
    return <Heading key={index}>{markdown}</Heading>;
  });
}
