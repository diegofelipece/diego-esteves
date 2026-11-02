import GenericBlock from "../components/GenericBlock";
import ImageBlock from "../components/ImageBlock";
import { Project, ProjectExerpt } from "../types/Project";

export const excerpt: ProjectExerpt = {
  slug: 'assentamento',
  title: 'Assentamento',
  category: 'design and illustration',
  coverImage: '/assentamento/cover.jpg'
};

export const assentamento: Project = {
  excerpt,
  content: (
    <>
      <GenericBlock>
        <p>
          My friend <a href="https://open.spotify.com/intl-pt/artist/5nYdFc9MmMrQcHyGPv19Mm?si=1uTKH2SWRvKshUVsht_gwQ"  target="__blank">Rogério Tavares</a>, an amazing musician, invited me to do the graphic project for his new album, recording only <a href="https://en.wikipedia.org/wiki/Chico_Buarque" target="__blank">Chico Buarque</a> songs, released on 2023 September.
        </p>
        <p>
          We discussed some possible names and decided to go ahead with Assentamento (settlement), which happens to be the title of one of the songs he recorded in his voice and the one that most brought me a visual description, a scene of a huge sun lightning the semi-desertic part of Brazil (Sertão). So I worked on a watercolor illustration and proposed that first version.
        </p>
      </GenericBlock>
      <ImageBlock 
        src='/projects/assentamento/first-version.jpg'
        width={1920}
        heigth={930}
      />
      <GenericBlock>
        <p>
          In the end, we needed to adjust the project to fit the standards of the record label, and the Vinil version didn't happen (at least yet), but that also allowed me to expand the project for the booklet, where I could use a lot of different references.
        </p>
        <p>
          It was amazing to jump into a graphic and illustration project after some years of massive coding.
        </p>
        <p>( circa 07/2023 )</p>
      </GenericBlock>
      <ImageBlock 
        src='/projects/assentamento/lines.png'
        width={600}
        heigth={29}
      />
      <ImageBlock 
        src='/projects/assentamento/mockup-1.jpg'
        width={1919}
        heigth={735}
      />
      <ImageBlock 
        src='/projects/assentamento/flower.png'
        width={600}
        heigth={30}
      />
      <ImageBlock 
        src='/projects/assentamento/mockup-2.jpg'
        width={1920}
        heigth={994}
      />
      <ImageBlock 
        src='/projects/assentamento/end.png'
        width={300}
        heigth={336}
      />
    </>
  ),
  links: [
    {
      url: 'https://open.spotify.com/intl-pt/album/2Llv2GnyuQ8lGnaw9hXBBy?si=wlmmg77hTDeIIcn1_40LJw'
    }
  ]
};

export default excerpt;