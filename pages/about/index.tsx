import { motion, useAnimation } from "framer-motion"
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import GenericBlock from '../../components/GenericBlock'
import ImageBlock from '../../components/ImageBlock'
import Logo from '../../components/Logo'
import SeoTags from '../../components/SeoTags'
import styles from '../../styles/pages/About.module.scss'
import { calculateAge } from '../../utils/ageHelper'

const age = calculateAge();

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
    }).then(() => {
      navigate('/');
    });
  };

  return (
    <div className={styles.container}>
      <SeoTags pageDescription="Diego Esteves portfolio" pageTitle='About me' pageSlug='about'/>
      <main>
        <div className={styles.about_page}>
          <motion.span
            animate={controls}
            className={styles.about_page__layover}></motion.span>
          <div className={styles.about_page__header}>
            <Logo className={styles.about_page__header__logo} size='small' returnToHome={onReturnToHome} />
            <h1 className={styles.about_page__header__title}>About me</h1>
          </div>
          <div className={styles.about_page__body}>
            <GenericBlock>
              <p>
                Hi, I&apos;m Diego Esteves.
              </p>
              <p>
                I&apos;m {age} years old, born in São Paulo, Brazil, and currently based in Bologna, Italy. I graduated in 2012 with a degree in Advertising Design from <a href="https://www.linkedin.com/school/mackenzie1870" target="_blank" rel="noreferrer">Mackenzie University</a> (São Paulo), and I've been working as a web designer and developer since 2010.
              </p>
              <p>
                My career started in design and advertising, with a strong focus on digital media. Back in 2010, the internet looked quite different — my first steps were in creating personal blogs and developing Flash websites. As the web evolved, I transitioned from Flash to HTML5, jQuery, and WordPress, gradually moving deeper into what we now call frontend development. Over the years, I’ve worked across both design and development, covering digital and print formats.
              </p>
              <p>
                During that period, I had the opportunity to collaborate with small design studios and leading Brazilian e-commerce platforms such as Netshoes, B2W Group, and Dafiti. In 2015, I began working as a freelancer and immersed myself in the world of Single Page Applications — primarily using React and later Angular. I collaborated with companies and agencies including Unilever, Itaú, Anglo and others.
              </p>
              <p>
                In 2018, I moved to Bologna, Italy. The following year, I joined Gruppo Euris, which initially led me to work with Shopfully as an external Frontend Developer (until May 2020), and later as a Fullstack Developer and Team Leader of a four-person development team at Gucci. In September 2022, I left Gruppo Euris and joined Shopfully as a Fullstack Developer (React, Node, PHP), where I currently work.
              </p>
            </GenericBlock>
            <ImageBlock
              src='self.jpg'
              heigth={400}
              width={400} />
            <GenericBlock>
              <p>
                As an independent comic writer and illustrator, I’ve self-published a few short stories. In Portuguese: <i>A Última Vez Que Vi Richard</i> (2014), <i>A Vida Marinha</i> (2017), and <i>Agouro</i> (2017); and in Italian: <i>Le Avventure Acquatiche</i> (2025) and <i>Forrest Gump</i> (2025). I also contributed to the first issue of the magazine <i>Pé de Cabra</i> (2018), and I’m currently working on new projects.
              </p>
              <p>
                You can find more information about my skills and experience on my <a href="https://www.linkedin.com/in/diegofelipece/" target="__blank">LinkedIn</a> or by sending me a “hello” at <a href="mailto:diegofelipece@gmail.com">diegofelipece@gmail.com</a>
              </p>
            </GenericBlock>
          </div>
        </div>
      </main>
    </div>
  )
}

export default About
