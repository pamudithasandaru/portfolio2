import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import useTheme from '../hooks/useTheme';
import { useSiteContent } from '../api/queries';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const routerNavigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { navbar } = useSiteContent();
  const navigate = (to) => routerNavigate(to, { viewTransition: true });

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();

    if (targetId === 'projects') {
      navigate('/projects');
      setIsOpen(false);
      return;
    }

    if (targetId === 'blogs') {
      navigate('/blogs');
      setIsOpen(false);
      return;
    }

    if (targetId === 'certifications') {
      navigate('/certifications');
      setIsOpen(false);
      return;
    }

    if (location.pathname !== '/') {
      navigate(`/#${targetId}`);
      setIsOpen(false);
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">{navbar.logoText}</Link>
        </div>

        <button
          type="button"
          className="hamburger"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span className={isOpen ? 'active' : ''}></span>
          <span className={isOpen ? 'active' : ''}></span>
          <span className={isOpen ? 'active' : ''}></span>
        </button>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <a href="/" className="nav-links" onClick={(e) => handleNavClick(e, 'home')}>Home</a>
          </li>
          <li className="nav-item">
            <a href="/#about" className="nav-links" onClick={(e) => handleNavClick(e, 'about')}>About</a>
          </li>
          <li className="nav-item">
            <a href="/projects" className="nav-links" onClick={(e) => handleNavClick(e, 'projects')}>Projects</a>
          </li>
          <li className="nav-item">
            <a href="/blogs" className="nav-links" onClick={(e) => handleNavClick(e, 'blogs')}>Blogs</a>
          </li>
          <li className="nav-item">
            <a href="/certifications" className="nav-links" onClick={(e) => handleNavClick(e, 'certifications')}>Certifications & Skills</a>
          </li>
        </ul>

        <div className="navbar-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            {theme === 'dark' ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
          </button>
          <div className="contact-email">
            <a href="/#contact" className="email-link" onClick={(e) => handleNavClick(e, 'contact')}>
              {navbar.email}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
