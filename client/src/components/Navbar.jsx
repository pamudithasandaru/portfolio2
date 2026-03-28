import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
          <Link to="/">Pamuditha Sandaru</Link>
        </div>

        <button
          type="button"
          className="hamburger"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
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
            <a href="/certifications" className="nav-links" onClick={(e) => handleNavClick(e, 'certifications')}>Certifications & Skills</a>
          </li>
        </ul>

        <div className="contact-email">
          <a href="mailto:pamudithasandaru2002@gmail.com" className="email-link">
            pamudithasandaru2002@gmail.com
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
