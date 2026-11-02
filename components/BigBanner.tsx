import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from '../styles/components/BigBanner.module.scss';
import sortBigBannerImage from '../utils/sortBigBannerImage';
import Logo from './Logo';
import sitePath from '../utils/sitePath';
import { home } from '../content';

const BigBanner = () => {
  const [bgUrl, setBgUrl] = useState(() => sitePath(home.bannerImages[0]));

  useEffect(() => {
    setBgUrl(sortBigBannerImage());
  }, []);

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <motion.div
    initial="hidden"
    animate="visible"
    variants={variants}
    transition={{duration: 1}}>
      <div className={styles.big_banner} style={{backgroundImage: `url(${bgUrl})`}}>  
        <Logo size='large'></Logo>
      </div>
    </motion.div>
  );
};

export default BigBanner;