import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router';
import AboutMe from '../components/AboutMe';
import BigBanner from '../components/BigBanner';
import ProjectsController from '../components/ProjectsController';
import SeoTags from '../components/SeoTags';
import styles from '../styles/pages/Home.module.scss';
import { loader } from '../projects/_index';
import { home } from '../content';

const Home = () => {
  const { slug } = useParams();
  const project = slug ? loader(slug) : null;
  const [loaded, setLoaded] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 0,
      transition: { duration: 0.6, delay: 0.3 },
    }).then(() => setLoaded(true));
  }, [controls]);

  return (
    <div className={styles.container}>
      <SeoTags
        pageDescription={project?.excerpt.description || home.description}
        pageTitle={project?.excerpt.title || home.title}
        pageSlug={project ? `projects/${project.excerpt.slug}` : ''}
      />
      <main>
        <div className={styles.home_page}>
          {!loaded ? <motion.span
            animate={controls}
            className={styles.home_page__layover}></motion.span> : null}
          {!project ? (
            <>
              <BigBanner />
              <AboutMe />
            </>
          ) : null}
          <ProjectsController initialProject={project?.excerpt} />
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Home
