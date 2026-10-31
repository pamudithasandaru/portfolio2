import React, { Suspense, lazy, useState } from 'react';
import '../styles/About.css';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { apiBaseUrl } from '../api/client';
import { useLanguageToolSection, useSiteContent, useVolunteeringExperiences } from '../api/queries';
import { CardListSkeleton, TagsSkeleton } from './Skeleton';
const AlbumModal = lazy(() => import('./AlbumModal'));

const EducationItem = ({ item, index }) => {
  const ref = useScrollAnimation();

  return (
    <li className={`edu-item scroll-fade-in scroll-delay-${Math.min(index + 1, 4)}`} ref={ref}>
      <div className="edu-marker"></div>
      <div className="edu-card">
        <div className="edu-year">{item.year}</div>
        <div className="edu-role">{item.role}</div>
        <div className="edu-meta">{item.meta}</div>
      </div>
    </li>
  );
};

const About = () => {
  const { about } = useSiteContent();
  const {
    data: volunteeringData,
    loading: volunteeringLoading,
    error: volunteeringError,
  } = useVolunteeringExperiences();
  const volunteeringExperiences = volunteeringData ?? [];
  const {
    data: languageToolSection,
    loading: languageToolLoading,
    error: languageToolError,
  } = useLanguageToolSection();
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [contactForm, setContactForm] = useState({
    fromEmail: '',
    message: '',
  });
  const [contactStatus, setContactStatus] = useState({
    submitting: false,
    error: '',
    success: '',
  });

  const headerRef = useScrollAnimation();
  const contentRef = useScrollAnimation();
  const statsRef = useScrollAnimation();
  const educationRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();
  const languageToolsRef = useScrollAnimation();
  const volunteeringRef = useScrollAnimation();
  const contactRef = useScrollAnimation();

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

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setContactStatus((previous) => ({
      ...previous,
      error: '',
      success: '',
    }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    if (!contactForm.fromEmail.trim() || !contactForm.message.trim()) {
      setContactStatus({
        submitting: false,
        error: 'Please provide your email and message before sending.',
        success: '',
      });
      return;
    }

    try {
      setContactStatus({
        submitting: true,
        error: '',
        success: '',
      });

      const response = await fetch(`${apiBaseUrl}/api/contact/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromEmail: contactForm.fromEmail.trim(),
          message: contactForm.message.trim(),
        }),
      });

      const responseText = await response.text();
      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') && responseText
        ? JSON.parse(responseText)
        : {};

      if (!response.ok) {
        setContactStatus({
          submitting: false,
          error: payload.message || `Unable to send your message (status ${response.status}).`,
          success: '',
        });
        return;
      }

      setContactStatus({
        submitting: false,
        error: '',
        success: payload.message || 'Message sent successfully.',
      });
      setContactForm({ fromEmail: '', message: '' });
    } catch (error) {
      setContactStatus({
        submitting: false,
        error: error.message || 'Failed to send message. Please try again.',
        success: '',
      });
    }
  };

  return (
    <section id="about" className="about">
      <div className="about-container">
        <div className="about-header scroll-fade-in" ref={headerRef}>
          <h2 className="about-title">{about.title}</h2>
          <div className="title-underline"></div>
        </div>

        <div className="about-content scroll-slide-up" ref={contentRef}>
          <div className="about-text">
            <p className="about-intro">
              {about.greeting} <span className="highlight">{about.name}</span>
              {about.intro}
            </p>

            {about.paragraphs.map((paragraph, index) => (
              <p className="about-description" key={index}>
                {paragraph}
              </p>
            ))}

            {about.stats.length > 0 && (
              <div className="about-stats scroll-scale-in" ref={statsRef}>
                {about.stats.map((stat, index) => (
                  <div className="stat-item" key={index}>
                    <span className="stat-number">{stat.number}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="education-section scroll-slide-up" ref={educationRef}>
              <h3 className="timeline-title">{about.educationTitle}</h3>
              <ul className="edu-timeline">
                {about.education.map((item, index) => (
                  <EducationItem item={item} index={index} key={index} />
                ))}
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

              {languageToolLoading && <TagsSkeleton label="Loading languages and tools" />}

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

              {volunteeringLoading && <CardListSkeleton count={3} label="Loading volunteering experiences" />}

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

            <div className="contact-section scroll-slide-up" ref={contactRef}>
              <h3 className="timeline-title">{about.contactHeading}</h3>
              <p className="contact-section-intro">{about.contactIntro}</p>

              <form className="contact-form-card" onSubmit={handleContactSubmit}>
                <label className="contact-label" htmlFor="fromEmail">
                  From
                </label>
                <input
                  id="fromEmail"
                  name="fromEmail"
                  type="email"
                  autoComplete="email"
                  className="contact-input"
                  placeholder="yourname@email.com"
                  value={contactForm.fromEmail}
                  onChange={handleContactChange}
                  required
                />

                <label className="contact-label" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="contact-textarea"
                  placeholder="Write your comment or project idea here..."
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                />

                {contactStatus.error && (
                  <p className="contact-feedback contact-feedback-error">{contactStatus.error}</p>
                )}

                {contactStatus.success && (
                  <p className="contact-feedback contact-feedback-success">{contactStatus.success}</p>
                )}

                <div className="contact-send-wrap">
                  <button
                    type="submit"
                    className="contact-send-btn"
                    disabled={contactStatus.submitting}
                  >
                    {contactStatus.submitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {selectedExperience && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}
    </section>
  );
};

export default About;
