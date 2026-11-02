import GenericBlock from '../components/GenericBlock';
import ImageBlock from '../components/ImageBlock';
import { Project, ProjectExerpt } from '../types/Project';

export const excerpt: ProjectExerpt = {
  slug: 'cbf',
  title: 'CBF app',
  category: 'design',
  coverImage: '/cbf/cover.jpg'
};

export const cbf: Project = {
  excerpt,
  content: (
    <>
      <GenericBlock>
        <p>
          I was responsable to redesign the app of the Brazilian Soccer Team sponsered by Vivo. The app has oficial informations about the team, like news, photos, and a game calendar.
        </p>
        <p>
          This job was managed by&nbsp; pactodigital, that invited me to make a whole new art direction for the app. It was launched for iOS and Android, both avaliable for tablets and smartphones.
        </p>
        <p>( ~ circa 2015/07 )</p>
      </GenericBlock>
      <ImageBlock 
        src='/projects/cbf/selecao-app.jpeg'
        width={1000}
        heigth={653}
      />
    </>
  ),
  // links: [
  //   {
  //     url: 'https://itunes.apple.com/br/app/selecao/id343628206?mt=8',
  //     icon: 'apple'      
  //   },    
  //   {
  //     url: 'https://play.google.com/store/apps/details?id=br.com.mowasports.selecao',
  //     icon: 'android'      
  //   }
  // ]
};

export default excerpt;
