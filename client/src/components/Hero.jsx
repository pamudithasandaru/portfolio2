import React, { useState } from 'react';
import '../styles/Hero.css';
import { FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';
import profileImage from '../assets/images/profile.jpg';

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
                    <p className="hero-subtitle">AI/ML Enthusiast & Developer</p>

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
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                            <FaFacebook />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                            <FaLinkedin />
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
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
