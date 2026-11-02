import GenericBlock from '../components/GenericBlock';
import ImageBlock from '../components/ImageBlock';
import { Project, ProjectExerpt } from '../types/Project';

export const excerpt: ProjectExerpt = {
  slug: 'nexxus',
  title: 'Nexxus UK',
  category: 'design',
  coverImage: '/nexxus/cover.jpg'
};

export const nexxus: Project = {
  excerpt,
  content: (
    <>
      <GenericBlock>
        <p>
          Design for a Nexxus UK iOS App created for a local marketing action on drugstores. The concept was to create a tool to help the clients on finding the perfect product for their hairs.
        </p>
        <p>
          Project made as freelacer for <a href="http://www.cubo.cc/" target="_blank" rel="noreferrer">CUBO.CC</a> working with <a href="https://www.linkedin.com/in/raisatrinny/" target="_blank" rel="noreferrer">Raisa Almeida</a> for <a href="https://www.nexxus.com/uk/home.html" target="_blank" rel="noreferrer">Nexxus UK</a>.
        </p>
        <p>( ~ circa 2018/07 )</p>
      </GenericBlock>

      <ImageBlock 
        src='/projects/nexxus/section1.jpeg'
        width={1000}
        heigth={613}
        />
      <ImageBlock 
        src='/projects/nexxus/nexxus-app-diagnosis_ipad-Question-1-01-@2x.jpeg'
        width={2049}
        heigth={1537}
        />
      <ImageBlock 
        src='/projects/nexxus/nexxus-app-diagnosis_ipad-Question-7-Select-@2x.jpeg'
        width={2049}
        heigth={1537}
        />
      <ImageBlock 
        src='/projects/nexxus/nexxus-app-diagnosis_ipad-Question-9-Select-02-@2x.jpeg'
        width={2049}
        heigth={1537}
        />
      <ImageBlock 
        src='/projects/nexxus/nexxus-app-diagnosis_ipad-Result-Sharing-@2x.jpeg'
        width={2049}
        heigth={1537}
        />
    </>
  ),
};

export default excerpt;
