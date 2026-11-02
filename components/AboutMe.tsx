import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import styles from '../styles/components/AboutMe.module.scss';
import Button from './Button';
import { motion, useAnimation } from "framer-motion"
import { calculateAge } from '../utils/ageHelper';
import sitePath from '../utils/sitePath';

const AboutMe = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      width: "0%",
      transition: { duration: 0 },
    });
  }, [controls]);

  const navigate = useNavigate();
  const clickOnAbout = () => {
    controls.start({
      width: "100%",
      transition: { duration: 0.6 },
    }).then(() => {
      navigate('/about/');
    })  
  };

  const age = calculateAge();

  return (
    <div className={styles.about_me}>
      <motion.span
        animate={controls}
        className={styles.about_me__layover}></motion.span>
      <div className={styles.about_me__inner}>
        <div className={styles.about_me__inner__image}>
          <img
            src={sitePath('/images/diego.jpg')}
            alt="Diego Esteves"
            width={238}
            height={238}
          />
        </div>
        <div className={styles.about_me__inner__description}>
          <h2>TL;DR</h2>
          <p className={styles.about_me__inner__description__text}>
            Diego Esteves. {age} years old. Born in Brazil, living in Italy. Developer and designer since 2010. 
          </p>
          <Button label={'more details >'} onClick={clickOnAbout}></Button>
        </div>
      </div>
    </div>
  );
}

export default AboutMe;