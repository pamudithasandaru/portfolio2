import React from 'react';
import { FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaArrowUp } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollToSection = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" id="contact">
      <div className="footer-top-accent" aria-hidden="true" />

      <div className="footer-container">
        <div className="footer-main-grid">
          <section className="footer-card footer-brand-card" aria-label="Brand information">
            <h3 className="footer-brand">Sandaru Gunasena</h3>
            <p className="footer-brand-subtitle">AI/ML Enthusiast & Developer</p>
            <p className="footer-description">
              Building practical and human-centered digital experiences with a focus on machine
              learning, software engineering, and continuous growth.
            </p>
          </section>

          <nav className="footer-card footer-links-card" aria-label="Quick navigation">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#home" onClick={(e) => handleScrollToSection(e, 'home')}>
                  Home
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleScrollToSection(e, 'about')}>
                  About
                </a>
              </li>
              <li>
                <a href="/projects" onClick={(e) => handleScrollToSection(e, 'projects')}>
                  Projects
                </a>
              </li>
              <li>
                <a href="/certifications" onClick={(e) => handleScrollToSection(e, 'skills')}>
                  Certifications & Skills
                </a>
              </li>
            </ul>
          </nav>

          <section className="footer-card footer-contact-card" aria-label="Contact information">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-contact-list">
              <li>
                <a href="mailto:pamudithasandaru2002@gmail.com" className="footer-contact-link">
                  <FaEnvelope aria-hidden="true" />
                  <span>pamudithasandaru2002@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+94710395435" className="footer-contact-link">
                  <FaPhone aria-hidden="true" />
                  <span>+94 71 0395 435</span>
                </a>
              </li>
            </ul>

            <div className="footer-socials" aria-label="Social links">
              <a href="www.linkedin.com/in/pamuditha-sandaru-4561ab280" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="https://github.com/pamudithasandaru" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub />
              </a>
            </div>
          </section>
        </div>

        <div className="footer-bottom-bar">
          <p className="footer-copyright">Copyright {currentYear} Sandaru Gunasena. All rights reserved.</p>
          <button type="button" className="footer-top-btn" onClick={handleBackToTop}>
            <FaArrowUp aria-hidden="true" />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
