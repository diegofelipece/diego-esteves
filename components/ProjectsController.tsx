import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router";
import { ProjectExerpt } from "../types/Project";
import ProjectDetails from "./ProjectDetails";
import Logo from "./Logo";
import styles from '../styles/components/ProjectsController.module.scss';
import excerpts from "../projects/_index";

type Props = {
  initialProject?: ProjectExerpt | null,
};

const allProjects = excerpts.map((excerpt, index) => ({ index, excerpt }));
const projectList = (project?: ProjectExerpt | null) =>
  project ? allProjects.filter(({ excerpt }) => excerpt.slug === project.slug) : allProjects;

const ProjectsController = ({ initialProject }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [alwaysExpanded, setAlwaysExpanded] = useState(!!initialProject);
  const [visibleProjects, setVisibleProjects] = useState(() => projectList(initialProject));
  const expansionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (location.state?.scrollProject && navigationType !== 'POP') return;
    setAlwaysExpanded(!!initialProject);
    setVisibleProjects(projectList(initialProject));
    window.scrollTo(0, 0);
  }, [initialProject, location.key, location.state, navigationType]);

  useEffect(() => () => {
    if (expansionTimer.current) clearTimeout(expansionTimer.current);
  }, []);

  const onExpansionRequested = (elmRef: RefObject<HTMLDivElement | null>, excerpt: ProjectExerpt) => {
    if (expansionTimer.current) clearTimeout(expansionTimer.current);
    expansionTimer.current = setTimeout(() => {
      elmRef.current?.scrollIntoView({ behavior: "smooth", inline: "nearest" });
      expansionTimer.current = setTimeout(() => {
        navigate(`/projects/${excerpt.slug}/`);
      }, 1000);
    }, 600);
  };

  useEffect(() => {
    if (!alwaysExpanded) return;

    const handleScroll = () => {
      const end = document.body.offsetHeight - window.innerHeight;
      if (window.scrollY < end - Math.round(window.innerHeight / 2)) return;

      const lastVisibleItem = visibleProjects[visibleProjects.length - 1];
      if (!lastVisibleItem) return;
      const nextProjectIndex = (lastVisibleItem.index + 1) % excerpts.length;
      if (visibleProjects.some(({ index }) => index === nextProjectIndex)) return;
      setVisibleProjects([...visibleProjects, allProjects[nextProjectIndex]]);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleProjects, alwaysExpanded]);

  return (
    <>
      {alwaysExpanded ? (
        <Logo
          className={styles.projects_controller__logo}
          size="small"
          returnToHome={() => navigate('/')}
        />
      ) : null}
      {visibleProjects.map(({ excerpt }) => (
        <ProjectDetails
          key={excerpt.slug}
          alwaysExpanded={alwaysExpanded}
          expandProject={(elmRef) => onExpansionRequested(elmRef, excerpt)}
          excerpt={excerpt}
        />
      ))}
    </>
  );
};

export default ProjectsController;
