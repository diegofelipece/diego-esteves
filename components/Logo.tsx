import styles from '../styles/components/Logo.module.scss';
import { motion } from "framer-motion"
import { home } from '../content';

type Props = {
  className?: string;
  size: 'large'|'small',
  returnToHome?: () => void,
}

const Logo = ({ size = 'large', className, returnToHome}: Props) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.4 }}      
      className={`${styles.logo} ${styles[`--${size}`]} ${className || ''}`}>
      {returnToHome ? <button className={styles.logo__clickable} aria-label="Return to portfolio" onClick={() => returnToHome()} /> : null}
      <h1 className={styles.logo__title}>{home.logoTitle.split('\n').map((line, index) => <span key={index}>{index ? <br /> : null}{line}</span>)}</h1>
      {size === 'large'? <p className={styles.logo__subtitle}>{home.tagline}</p> : null}
    </motion.div>
  );
};

export default Logo;