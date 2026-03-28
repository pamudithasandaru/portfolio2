import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/ProjectNavigationSidebar.css';

const ProjectNavigationSidebar = ({ categories, activeCategory, onSelectCategory, onSelectProject }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    if (activeCategory) {
      setExpandedCategory(activeCategory.slug);
    }
  }, [activeCategory]);

  const toggleCategory = (slug) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <aside className="project-navigation-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Project Network</h3>
        <div className="sidebar-accent-line" />
      </div>

      <nav className="project-network-container">
        <svg className="network-canvas" viewBox="0 0 280 600" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#474343" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#636060" stopOpacity="0.8" />
            </linearGradient>
            <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>
        </svg>

        <ul className="projects-list">
          {categories.map((category, categoryIndex) => {
            const isExpanded = expandedCategory === category.slug;
            const projectCount = Array.isArray(category.projects) ? category.projects.length : 0;

            return (
              <li key={category.slug} className="project-category-nav-item">
                <button
                  type="button"
                  className={`category-nav-btn ${activeCategory?.slug === category.slug ? 'active' : ''}`}
                  onClick={() => {
                    toggleCategory(category.slug);
                    onSelectCategory(category);
                  }}
                >
                  <span className="category-nav-dot" />
                  <span className="category-nav-text">
                    <span className="category-nav-name">{category.name}</span>
                    <span className="category-nav-count">{projectCount}</span>
                  </span>
                  <span className={`category-nav-arrow ${isExpanded ? 'expanded' : ''}`}>›</span>
                </button>

                {isExpanded && projectCount > 0 && (
                  <ul className="projects-sub-list">
                    {category.projects
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((project, projectIndex) => (
                        <li key={`${category.slug}-${project.title}`} className="project-nav-item">
                          <button
                            type="button"
                            className="project-nav-btn"
                            onClick={() => onSelectProject(category, project)}
                          >
                            <span className="project-nav-node" />
                            <span className="project-nav-name">{project.title}</span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="network-legend">
          <div className="legend-item">
            <span className="legend-dot category-dot" />
            <span className="legend-text">Categories</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot project-dot" />
            <span className="legend-text">Projects</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

ProjectNavigationSidebar.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      slug: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      projects: PropTypes.array,
    })
  ).isRequired,
  activeCategory: PropTypes.shape({
    slug: PropTypes.string,
  }),
  onSelectCategory: PropTypes.func.isRequired,
  onSelectProject: PropTypes.func.isRequired,
};

ProjectNavigationSidebar.defaultProps = {
  activeCategory: null,
};

export default ProjectNavigationSidebar;
