import React, { useState } from 'react';
import '../styles/Hero.css';
import { FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';
import profileImage from '../assets/images/ee.png';
import creativeLogo from '../assets/images/creative_logo.png';

const Hero = () => {
  const [isHired, setIsHired] = useState(false);

  const handleHireClick = () => {
    setIsHired(!isHired);
  };

return (
    <section id="home" className="hero" style={{ backgroundImage: `url(${require('../assets/images/background.png')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-container">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-greeting">Hi!</h1>
                    <h2 className="hero-title">I'M SANDARU GUNASENA</h2>
                    <p className="hero-subtitle">
                        <span className="hero-subtitle-text">AI/ML Enthusiast & Developer</span>
                    </p>

                    <div className="hero-current-role">
                        <img src={creativeLogo} alt="Creative Software" className="hero-company-logo" />
                        <span className="hero-role-text">Software Engineering Intern at Creative Software</span>
                    </div>

                    <div className="hero-actions">
                        <button 
                            className={`hire-btn ${isHired ? 'active' : ''}`}
                            onClick={handleHireClick}
                        >
                            <span>Hire me</span>
                            <div className="toggle-switch">
                                <div className="toggle-circle"></div>
                            </div>
                        </button>
                    </div>

                    <div className="social-icons">
                        <a href="https://www.facebook.com/pamuditha.sandaru" target="_blank" rel="noopener noreferrer" className="social-link">
                            <FaFacebook />
                        </a>
                        <a href="www.linkedin.com/in/pamuditha-sandaru-4561ab280" target="_blank" rel="noopener noreferrer" className="social-link">
                            <FaLinkedin />
                        </a>
                        <a href="https://github.com/pamudithasandaru" target="_blank" rel="noopener noreferrer" className="social-link">
                            <FaGithub />
                        </a>
                    </div>
                </div>

                <div className="hero-image">
                    <div className="image-placeholder">
                        <img src={profileImage} alt="Sandaru Gunasena" />
                    </div>
                </div>
            </div>
        </div>
    </section>
);
};

export default Hero;
