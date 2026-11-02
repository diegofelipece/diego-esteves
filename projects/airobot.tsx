import GenericBlock from "../components/GenericBlock";
import ImageBlock from "../components/ImageBlock";
import { Project, ProjectExerpt } from "../types/Project";

export const excerpt: ProjectExerpt = {
  slug: 'airobot',
  title: 'Airobot',
  category: 'web development',
  coverImage: '/airobot/cover.jpg'
};

export const airobot: Project = {
  excerpt,
  content: (
    <>
      <GenericBlock>
        <p>A travel business software company.</p>
        <p>Colaborated as front-end developer of the project, delivering a static site, based on the recieved layout. The animations are all HTML + jQuery.</p>
        <p>Job done as freelancer for&nbsp;<a href="https://www.mozestudio.com/" target="_blank" rel="noreferrer">Moze</a>&nbsp;studio.</p>
        <p>( ~ 2018/12 )</p>
      </GenericBlock>
      <ImageBlock 
        src='/projects/airobot/airobot-desk.png'
        width={800}
        heigth={463}
      />
      <ImageBlock 
        src='/projects/airobot/airobot-mobile.png'
        width={320}
        heigth={706}
      />
    </>
  ),
  links: [
    'http://cliente.diegoesteves.ink/airobot/'
  ]
};

export default excerpt;
