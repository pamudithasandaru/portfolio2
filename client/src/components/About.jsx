import React, { useEffect, useState } from 'react';
import '../styles/About.css';
import useScrollAnimation from '../hooks/useScrollAnimation';
import AlbumModal from './AlbumModal';

const About = () => {
  const [volunteeringExperiences, setVolunteeringExperiences] = useState([]);
  const [volunteeringLoading, setVolunteeringLoading] = useState(true);
  const [volunteeringError, setVolunteeringError] = useState('');
  const [languageToolSection, setLanguageToolSection] = useState(null);
  const [languageToolLoading, setLanguageToolLoading] = useState(true);
  const [languageToolError, setLanguageToolError] = useState('');
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);

  const headerRef = useScrollAnimation();
  const contentRef = useScrollAnimation();
  const statsRef = useScrollAnimation();
  const educationRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();
  const languageToolsRef = useScrollAnimation();
  const volunteeringRef = useScrollAnimation();
  const educationItemOneRef = useScrollAnimation();
  const educationItemTwoRef = useScrollAnimation();
  const educationItemThreeRef = useScrollAnimation();
  const educationItemFourRef = useScrollAnimation();

  useEffect(() => {
    const controller = new AbortController();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const fetchVolunteeringExperiences = async () => {
      try {
        setVolunteeringLoading(true);
        setVolunteeringError('');

        const response = await fetch(`${apiBaseUrl}/api/volunteering-experiences`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setVolunteeringExperiences(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setVolunteeringError('Unable to load volunteering experiences right now.');
        }
      } finally {
        setVolunteeringLoading(false);
      }
    };

    const fetchLanguageToolSection = async () => {
      try {
        setLanguageToolLoading(true);
        setLanguageToolError('');

        const response = await fetch(`${apiBaseUrl}/api/language-tool-sections`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setLanguageToolSection(data || null);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLanguageToolError('Unable to load languages and tools right now.');
        }
      } finally {
        setLanguageToolLoading(false);
      }
    };

    fetchVolunteeringExperiences();
    fetchLanguageToolSection();

    return () => {
      controller.abort();
    };
  }, []);

  const handleSkillsClick = (e) => {
    e.preventDefault();
    const target = document.getElementById('skills');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAlbumClick = (experience) => {
    setSelectedExperience(experience);
    setAlbumModalOpen(true);
  };

  const handleCloseAlbumModal = () => {
    setAlbumModalOpen(false);
    setSelectedExperience(null);
  };

  return (
    <section id="about" className="about">
      <div className="about-container">
        <div className="about-header scroll-fade-in" ref={headerRef}>
          <h2 className="about-title">About Me</h2>
          <div className="title-underline"></div>
        </div>

        <div className="about-content scroll-slide-up" ref={contentRef}>
          <div className="about-text">
            <p className="about-intro">
              Hello! I'm <span className="highlight">Sandaru Gunasena</span>, a passionate 
              AI/ML enthusiast and developer dedicated to creating innovative solutions 
              that make a difference.
            </p>
            
            <p className="about-description">
              With a strong foundation in machine learning, deep learning, and software 
              development, I enjoy tackling complex problems and turning ideas into reality. 
              My journey in technology has been driven by curiosity and a desire to 
              continuously learn and grow.
            </p>

            <p className="about-description">
              I specialize in building intelligent applications, developing predictive models, 
              and creating user-friendly interfaces. When I'm not coding, you'll find me 
              exploring the latest trends in AI research or contributing to open-source projects.
            </p>

            <div className="about-stats scroll-scale-in" ref={statsRef}>
              <div className="stat-item">
                <span className="stat-number">2+</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-label">Projects Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5+</span>
                <span className="stat-label">Technologies</span>
              </div>
            </div>

            <div className="education-section scroll-slide-up" ref={educationRef}>
              <h3 className="timeline-title">Education</h3>
              <ul className="edu-timeline">
                <li className="edu-item scroll-fade-in scroll-delay-1" ref={educationItemOneRef}>
                  <div className="edu-marker"></div>
                  <div className="edu-card">
                    <div className="edu-year">2023 May - Present</div>
                    <div className="edu-role">BSc in Computer Engineering</div>
                    <div className="edu-meta">Faculty of Engineering, University of Ruhuna</div>
                  </div>
                </li>
                <li className="edu-item scroll-fade-in scroll-delay-2" ref={educationItemTwoRef}>
                  <div className="edu-marker"></div>
                  <div className="edu-card">
                    <div className="edu-year">2022 April - 2022 July</div>
                    <div className="edu-role">Diploma in English</div>
                    <div className="edu-meta">British Way English Academy</div>
                  </div>
                </li>
                <li className="edu-item scroll-fade-in scroll-delay-3" ref={educationItemThreeRef}>
                  <div className="edu-marker"></div>
                  <div className="edu-card">
                    <div className="edu-year">2018 Dec - 2019 June</div>
                    <div className="edu-role">Diploma in Information Technology</div>
                    <div className="edu-meta">Visiontec International, Anuradhapura</div>
                  </div>
                </li>
                <li className="edu-item scroll-fade-in scroll-delay-4" ref={educationItemFourRef}>
                  <div className="edu-marker"></div>
                  <div className="edu-card">
                    <div className="edu-year">2018 Dec - 2019 June</div>
                    <div className="edu-role">Diploma in Graphic Design</div>
                    <div className="edu-meta">Visiontec International, Anuradhapura</div>
                  </div>
                </li>
              </ul>

              <div className="education-cta-wrap scroll-scale-in" ref={ctaRef}>
                <a
                  href="#skills"
                  className="education-cta-btn"
                  onClick={handleSkillsClick}
                >
                  View Certifications & Skills
                </a>
              </div>
            </div>

            <div className="language-tools-section scroll-slide-up" ref={languageToolsRef}>
              <h3 className="timeline-title">Languages and Tools</h3>

              {languageToolLoading && (
                <p className="language-tools-feedback">Loading languages and tools...</p>
              )}

              {!languageToolLoading && languageToolError && (
                <p className="language-tools-feedback language-tools-feedback-error">{languageToolError}</p>
              )}

              {!languageToolLoading && !languageToolError && !languageToolSection && (
                <p className="language-tools-feedback">No language and tool information found yet.</p>
              )}

              {!languageToolLoading && !languageToolError && languageToolSection && (
                <div className="language-tools-showcase">
                  {Array.isArray(languageToolSection.sections)
                    ? [...languageToolSection.sections]
                        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                        .map((section, sectionIndex) => (
                          <article
                            className="language-tool-panel"
                            key={`${section.title}-${sectionIndex}`}
                          >
                            <div className="language-tool-panel-head">
                              <span className="language-tool-panel-index">
                                {String(sectionIndex + 1).padStart(2, '0')}
                              </span>
                              <h4 className="language-tool-panel-title">{section.title}</h4>
                            </div>

                            {Array.isArray(section.categories) && section.categories.length > 0 && (
                              <div className="language-tool-panel-body">
                                {section.categories.map((category, categoryIndex) => (
                                  <div
                                    className="language-tool-category-row"
                                    key={`${section.title}-${category.name}-${categoryIndex}`}
                                  >
                                    <p className="language-tool-category-name">{category.name}</p>
                                    <div className="language-tool-skill-cloud">
                                      {Array.isArray(category.items) &&
                                        category.items.map((item) => (
                                          <span
                                            className="language-tool-skill-pill"
                                            key={`${section.title}-${category.name}-${item}`}
                                          >
                                            {item}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </article>
                        ))
                    : null}
                </div>
              )}
            </div>

            <div className="volunteering-section scroll-slide-up" ref={volunteeringRef}>
              <h3 className="timeline-title">Volunteering Experiences</h3>

              {volunteeringLoading && (
                <p className="volunteering-feedback">Loading volunteering experiences...</p>
              )}

              {!volunteeringLoading && volunteeringError && (
                <p className="volunteering-feedback volunteering-feedback-error">{volunteeringError}</p>
              )}

              {!volunteeringLoading && !volunteeringError && volunteeringExperiences.length === 0 && (
                <p className="volunteering-feedback">No volunteering experiences found yet.</p>
              )}

              {!volunteeringLoading && !volunteeringError && volunteeringExperiences.length > 0 && (
                <ul className="volunteering-flow">
                  {volunteeringExperiences.map((experience) => (
                    <li className="vol-item" key={experience._id}>
                      <div className="vol-node"></div>
                      <div className="vol-card">
                        {(experience.photos?.length > 0 || experience.images?.length > 0) && (
                          <button
                            className="vol-album-btn"
                            onClick={() => handleAlbumClick(experience)}
                            title="View album photos"
                          >
                            Album
                          </button>
                        )}
                        <div className="vol-header">
                          <div>
                            <div className="vol-org">{experience.organization}</div>
                            {experience.isCurrent && (
                              <span className="vol-current-badge">Current</span>
                            )}
                          </div>
                        </div>
                        <div className="vol-position">{experience.position}</div>
                        <div className="vol-duration">{experience.duration}</div>

                        <p className="vol-description">{experience.description}</p>

                        {Array.isArray(experience.keyTags) && experience.keyTags.length > 0 && (
                          <div className="vol-tags">
                            {experience.keyTags.map((tag) => (
                              <span className="vol-tag" key={`${experience._id}-${tag}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {experience.achievement && (
                          <p className="vol-achievement">
                            <strong>Achievement:</strong> {experience.achievement}
                          </p>
                        )}

                        {experience.status && (
                          <span className="vol-status">{experience.status}</span>
                        )}

                        {experience.achievements && experience.achievements.length > 0 && (
                          <div className="vol-achievements">
                            {experience.achievements.map((ach, index) => (
                              <p key={`${experience._id}-${ach}-${index}`} className="vol-achievement-item">
                                ✓ {ach}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedExperience && (
        <AlbumModal
          isOpen={albumModalOpen}
          onClose={handleCloseAlbumModal}
          images={
            selectedExperience.photos && selectedExperience.photos.length > 0
              ? selectedExperience.photos
              : selectedExperience.images
                  ?.map((img) => {
                    // If the image has 'data' field with base64 string
                    if (img.data) {
                      return img.data.startsWith('data:')
                        ? img.data
                        : `data:${img.contentType || 'image/jpeg'};base64,${img.data}`;
                    }
                    // If it's already a full data URL
                    return img;
                  })
                  .filter(Boolean) || []
          }
          organizationName={selectedExperience.organization}
        />
      )}
    </section>
  );
};

export default About;
