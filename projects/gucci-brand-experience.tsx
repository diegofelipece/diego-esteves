import GenericBlock from "../components/GenericBlock";
import ImageBlock from "../components/ImageBlock";
import { Project, ProjectExerpt } from "../types/Project";

export const excerpt: ProjectExerpt = {
  slug: 'gucci-brand-experience',
  title: 'Gucci Brand Experience',
  category: 'web development and design',
  coverImage: '/gucci-brand-experience/cover.jpg',
};

export const gucciBrandExperience: Project = {
  excerpt,
  content: (
    <>
      <GenericBlock>
        <p>
          Besides many features and regular maintenance, I had the mission of renovating some views of the project, reviewing UI and them implementing it. It is a web project and a sort of catalog, used during some special events to show exclusive products for selected clients.
        </p>
        <p>
          That work happened while I was the team leader of a 4 developers squad, working at Euris. The stack was PHP/Lumen/MariaDb for the back end and Angular on the front end.
        </p>
        <p>( started at 2020/05 until 2022/09 )</p>
      </GenericBlock>
      <h3>Product list – <i>before</i></h3>
      <ImageBlock 
        src='/projects/gucci-brand-experience/list-before.jpg'
        width={1760}
        heigth={749}
      />
      <h3>Product list – <i>after</i></h3>
      <ImageBlock 
        src='/projects/gucci-brand-experience/list-after.jpg'
        width={1760}
        heigth={1278}
      />
      <h3>Single product page – <i>before</i></h3>
      <ImageBlock 
        src='/projects/gucci-brand-experience/product-before.jpg'
        width={1760}
        heigth={1108}
      />
      <h3>Single product page – <i>after</i></h3>
      <ImageBlock 
        src='/projects/gucci-brand-experience/product-after.jpg'
        width={1760}
        heigth={1631}
      />
    </>
  ),
};

export default excerpt;