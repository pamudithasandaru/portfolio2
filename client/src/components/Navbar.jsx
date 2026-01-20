import React, { useState } from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/">Pamuditha Sandaru</a>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span className={isOpen ? 'active' : ''}></span>
          <span className={isOpen ? 'active' : ''}></span>
          <span className={isOpen ? 'active' : ''}></span>
        </div>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <a href="#home" className="nav-links">Home</a>
          </li>
          <li className="nav-item">
            <a href="#about" className="nav-links">About</a>
          </li>
          <li className="nav-item">
            <a href="#projects" className="nav-links">Projects</a>
          </li>
          <li className="nav-item">
            <a href="#skills" className="nav-links">Certifications & Skills</a>
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
