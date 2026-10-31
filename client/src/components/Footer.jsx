import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaArrowUp } from 'react-icons/fa';
import '../styles/Footer.css';
import SocialIcon, { socialLabel } from './SocialIcon';
import { useSiteContent } from '../api/queries';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { footer, socials } = useSiteContent();
  const phoneLink = footer.phone.replace(/[^\d+]/g, '');

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
            <h3 className="footer-brand">{footer.brand}</h3>
            <p className="footer-brand-subtitle">{footer.subtitle}</p>
            <p className="footer-description">{footer.description}</p>
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
                <Link to="/blogs">Blogs</Link>
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
              {footer.email && (
                <li>
                  <a href={`mailto:${footer.email}`} className="footer-contact-link">
                    <FaEnvelope aria-hidden="true" />
                    <span>{footer.email}</span>
                  </a>
                </li>
              )}
              {footer.phone && (
                <li>
                  <a href={`tel:${phoneLink}`} className="footer-contact-link">
                    <FaPhone aria-hidden="true" />
                    <span>{footer.phone}</span>
                  </a>
                </li>
              )}
            </ul>

            <div className="footer-socials" aria-label="Social links">
              {socials
                .filter((social) => social.inFooter && social.url)
                .map((social) => (
                  <a key={social.platform + social.url} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={socialLabel(social.platform)}>
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
            </div>
          </section>
        </div>

        <div className="footer-bottom-bar">
          <p className="footer-copyright">Copyright {currentYear} {footer.copyrightName}. All rights reserved.</p>
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
