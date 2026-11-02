import GenericBlock from "../components/GenericBlock";
import ImageBlock from "../components/ImageBlock";
import { Project, ProjectExerpt } from "../types/Project";

export const excerpt: ProjectExerpt = {
  slug: 'mussum-ipsum',
  title: 'Mussum Ipsum',
  category: 'web development and design',
  coverImage: '/mussum-ipsum/cover.jpg'
};

export const mussumIpsum: Project = {
  excerpt,
  content: (
    <>
      <GenericBlock>
        <p>
          In 2012 I had the idea of creating a custom "lorem ipsum" generator based on a classic Brazilian TV character called Mussum, so I designed a two-page website and put it online in a week. On the second day, the project went viral through Brazilian designers and developers and reached an unexpected 36.294 pageviews, during the first 5 days. As I write this on 2023 October, the term "mussum ipsum" reached more than +15,000 results on Google Search and it's present on more than +3,000 code files on Github.
        </p>
        <p>
          Currently, the project is on the 3rd version (static Next.js) which is a work in progress as new features and content may come by as I try to make it profitable someway.
        </p>
        <p>( from 10/2012 until now )</p>
      </GenericBlock>
      <ImageBlock 
        src='/projects/mussum-ipsum/web.jpg'
        width={1761}
        heigth={1438}
      />
      <ImageBlock 
        src='/projects/mussum-ipsum/smartphone.jpg'
        width={320}
        heigth={685}
      />
    </>
  ),
  links: [
    'https://www.mussumipsum.com/',
    {
      url: 'https://github.com/diegofelipece/mussum-ipsum',
      icon: 'github',
    }
  ]
};

export default excerpt;