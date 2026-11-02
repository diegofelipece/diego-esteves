import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { loader } from '../projects/_index';
import styles from '../styles/components/ProjectDetails.module.scss';
import { Project, ProjectExerpt } from '../types/Project';
import LinksList from './LinksList';
import sitePath from '../utils/sitePath';

type Props = {
  excerpt: ProjectExerpt,
  alwaysExpanded?: boolean,
  expandProject: (elmRef: RefObject<HTMLDivElement | null>) => void,
}

const ProjectDetails = ({ excerpt, expandProject, alwaysExpanded }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(!!alwaysExpanded);
  const project: Project | undefined = expanded ? loader(excerpt.slug) : undefined;
  
  const elmRef = useRef<HTMLDivElement>(null);
  
  const onExpandClick = () => {
    setExpanded(true);
    expandProject(elmRef);
  }
  
  useEffect(() => {
    setExpanded(!!alwaysExpanded);
  }, [alwaysExpanded]);
  
  useEffect(() => {
    if (!alwaysExpanded) return;
    const handleScroll = () => {
      const rect = elmRef?.current?.getBoundingClientRect();
      const isOnRectRange = !!rect && rect.top <= 0 && rect.bottom > 0;
      if (isOnRectRange) {
        const url = `/projects/${excerpt.slug}/`;
        if (url !== location.pathname) {
          navigate(url, { replace: true, preventScrollReset: true, state: { scrollProject: true } });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [alwaysExpanded, excerpt.slug, location.pathname, navigate]);

  return (
    <div className={styles.project_details} ref={elmRef} data-project-slug={excerpt.slug}>
      <div
        className={styles.project_head}
        style={{backgroundImage: `url(${sitePath(`/images/projects/${excerpt.coverImage}`)})`}}>
        {!expanded ? <button className={styles.project_head__expander} onClick={onExpandClick} aria-label={`View ${excerpt.title}`}>
          <div className={styles.project_head__expander__icon}>
            <span className={styles.project_head__expander__icon__a}></span>
            <span className={styles.project_head__expander__icon__b }></span>
          </div>
        </button> : null}
        <div className={styles.project_head__box}>
          <h3 className={styles.project_head__box__title}>{excerpt.title}</h3>
          <p className={styles.project_head__box__category}>{excerpt.category}</p>
        </div>
      </div>
      {expanded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{duration: 0.6}}
          className={styles.project_body}>
          {project?.content || null}
          {project?.links ? <LinksList links={project.links || []}/> : null}
        </motion.div>        
      ) : null}
    </div>
  );
}

export default ProjectDetails;