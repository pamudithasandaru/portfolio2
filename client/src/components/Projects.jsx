import React, { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaArrowLeft, FaGithub, FaExternalLinkAlt, FaPlay } from 'react-icons/fa';
import useScrollAnimation from '../hooks/useScrollAnimation';
import ProjectNavigationSidebar from './ProjectNavigationSidebar';
import '../styles/Projects.css';

const getEmbeddableUrl = (url = '') => {
  if (!url) {
    return '';
  }

  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return id ? `https://www.youtube.com/embed/${id}` : '';
  }

  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : '';
  }

  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    return id ? `https://player.vimeo.com/video/${id}` : '';
  }

  return '';
};

const Projects = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategorySlug, setActiveCategorySlug] = useState('');
  const [activeVideoProject, setActiveVideoProject] = useState(null);

  const sectionRef = useScrollAnimation();

  useEffect(() => {
    const controller = new AbortController();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${apiBaseUrl}/api/project-categories`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Unable to load project categories right now.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) {
      return categories;
    }

    return categories.filter((category) => {
      const nameMatch = category.name?.toLowerCase().includes(normalized);
      const descMatch = category.description?.toLowerCase().includes(normalized);
      const keywordMatch = Array.isArray(category.keywords)
        ? category.keywords.some((keyword) => keyword.toLowerCase().includes(normalized))
        : false;

      return nameMatch || descMatch || keywordMatch;
    });
  }, [categories, searchTerm]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === activeCategorySlug),
    [categories, activeCategorySlug]
  );

  const handleCategoryOpen = (slug) => {
    setActiveCategorySlug(slug);
    const target = document.getElementById('projects');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClose = () => {
    setActiveCategorySlug('');
  };

  const handleVideoOpen = (project) => {
    setActiveVideoProject(project);
  };

  const handleVideoClose = () => {
    setActiveVideoProject(null);
  };

  const handleSidebarSelectCategory = (category) => {
    handleCategoryOpen(category.slug);
  };

  const handleSidebarSelectProject = (category, project) => {
    handleCategoryOpen(category.slug);
  };

  const renderVideoPlayer = () => {
    if (!activeVideoProject?.demoVideoUrl) {
      return null;
    }

    const embedUrl = getEmbeddableUrl(activeVideoProject.demoVideoUrl);

    if (embedUrl) {
      return (
        <iframe
          className="project-video-frame"
          src={embedUrl}
          title={`${activeVideoProject.title} demo`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return <video className="project-video-frame" src={activeVideoProject.demoVideoUrl} controls autoPlay />;
  };

  return (
    <section id="projects" className="projects" ref={sectionRef}>
      <div className="projects-wrapper">
        {!loading && !error && (
          <ProjectNavigationSidebar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={handleSidebarSelectCategory}
            onSelectProject={handleSidebarSelectProject}
          />
        )}

        <div className="projects-container">
        <header className="projects-header">
          <h2 className="projects-title">Project Lab</h2>
          <div className="title-underline" />
        </header>

        {loading && <p className="projects-feedback">Loading projects...</p>}
        {!loading && error && <p className="projects-feedback projects-feedback-error">{error}</p>}

        {!loading && !error && !activeCategory && (
          <>
            <div className="projects-search-wrap">
              <label htmlFor="project-search" className="projects-search-label">
                Search categories
              </label>
              <div className="projects-search-box">
                <FaSearch aria-hidden="true" />
                <input
                  id="project-search"
                  type="text"
                  placeholder="Search by category, keyword, or domain"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="project-category-grid">
              {filteredCategories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  className="project-category-tile"
                  onClick={() => handleCategoryOpen(category.slug)}
                >
                  <h3>{category.name}</h3>
                  <p>{category.description || 'Explore this project collection.'}</p>
                  <span>{Array.isArray(category.projects) ? category.projects.length : 0} Projects</span>
                </button>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <p className="projects-feedback">No categories matched your search.</p>
            )}
          </>
        )}

        {!loading && !error && activeCategory && (
          <div className="project-category-detail">
            <div className="project-category-detail-head">
              <button type="button" className="project-back-btn" onClick={handleCategoryClose}>
                <FaArrowLeft aria-hidden="true" />
                <span>Back to Categories</span>
              </button>
              <h3>{activeCategory.name}</h3>
            </div>

            <div className="project-list-vertical">
              {Array.isArray(activeCategory.projects) && activeCategory.projects.length > 0 ? (
                [...activeCategory.projects]
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  .map((project) => (
                    <article className="project-card" key={`${activeCategory.slug}-${project.title}`}>
                      <div className="project-card-main">
                        <h4>{project.title}</h4>
                        <p>{project.shortDescription || 'No description available yet.'}</p>

                        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                          <div className="project-tech-tags">
                            {project.technologies.map((tech) => (
                              <span key={`${project.title}-${tech}`}>{tech}</span>
                            ))}
                          </div>
                        )}

                        <div className="project-actions">
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <FaGithub aria-hidden="true" />
                              <span>GitHub</span>
                            </a>
                          )}
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <FaExternalLinkAlt aria-hidden="true" />
                              <span>Live Project</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <aside
                        className="project-card-visual"
                        style={{
                          '--project-image': project.coverImageUrl ? `url(${project.coverImageUrl})` : 'none',
                        }}
                      >
                        <button
                          type="button"
                          className="project-video-thumb"
                          onClick={() => handleVideoOpen(project)}
                          disabled={!project.demoVideoUrl}
                          title={project.demoVideoUrl ? 'Watch demo video' : 'No demo video available'}
                        >
                          {project.videoThumbnailUrl ? (
                            <img src={project.videoThumbnailUrl} alt={`${project.title} demo thumbnail`} />
                          ) : (
                            <div className="project-video-thumb-placeholder">Demo Preview</div>
                          )}
                          <span>
                            <FaPlay aria-hidden="true" />
                            Watch Demo
                          </span>
                        </button>
                      </aside>
                    </article>
                  ))
              ) : (
                <p className="projects-feedback">No projects found for this category yet.</p>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {activeVideoProject && (
        <div className="project-video-modal-overlay" onClick={handleVideoClose}>
          <div className="project-video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="project-video-modal-head">
              <h4>{activeVideoProject.title} Demo</h4>
              <button type="button" onClick={handleVideoClose} aria-label="Close video popup">
                x
              </button>
            </div>
            <div className="project-video-modal-body">{renderVideoPlayer()}</div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
