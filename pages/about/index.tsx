import { motion, useAnimation } from "framer-motion";
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import ContentBlocks from '../../components/ContentBlocks';
import Logo from '../../components/Logo';
import SeoTags from '../../components/SeoTags';
import { about } from '../../content';
import styles from '../../styles/pages/About.module.scss';

const About = () => {
  const controls = useAnimation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    controls.start({
      width: "0%",
      transition: { duration: 0.6, delay: 0.3 },
    });
  }, [controls]);

  const onReturnToHome = () => {
    controls.start({
      width: "100%",
      backgroundColor: '#896194',
      transition: { duration: 0.6 },
    }).then(() => navigate('/'));
  };

  return (
    <div className={styles.container}>
      <SeoTags pageDescription={about.description} pageTitle={about.title} pageSlug="about" />
      <main>
        <div className={styles.about_page}>
          <motion.span animate={controls} className={styles.about_page__layover} />
          <div className={styles.about_page__header}>
            <Logo className={styles.about_page__header__logo} size="small" returnToHome={onReturnToHome} />
            <h1 className={styles.about_page__header__title}>{about.title}</h1>
          </div>
          <div className={styles.about_page__body}>
            <ContentBlocks blocks={about.blocks} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
