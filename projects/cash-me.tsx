import GenericBlock from '../components/GenericBlock';
import ImageBlock from '../components/ImageBlock';
import { Project, ProjectExerpt } from '../types/Project';

export const excerpt: ProjectExerpt = {
  slug: 'cash-me',
  title: 'Cash.me',
  category: 'web development',
  coverImage: '/cashme/cover.jpg'
};

export const cashMe: Project = {
  excerpt,
  content: (
    <>
      <GenericBlock>
        <p>A Fintech focused on fast and online loans.</p>
        <p>I implemented the front-end of the tool dashboard, creating static views that later was integrated with Laravel + Vue.js. <br /> I've joined the project as a freelancer, working for <a href="http://www.meza1618.com.br/" target="_blank" rel="noreferrer">MeZA</a>, the agency that was responsible for developing the project.</p>
        <p>( ~ circa 2018/07 )</p>
      </GenericBlock>
      <ImageBlock 
        src='/projects/cashme/web.jpg'
        width={1760}
        heigth={995}
      />
      <ImageBlock 
        src='/projects/cashme/smartphone.jpg'
        width={320}
        heigth={599}
      />
    </>
  ),
  links: [
    'http://cliente.diegoesteves.ink/cash-me/'
  ]
};

export default excerpt;
