import React, { useState } from 'react';
import '../styles/Hero.css';
import profileImage from '../assets/images/ee.webp';
import creativeLogo from '../assets/images/creative_logo.png';
import HeroBackground from './HeroBackground';
import SocialIcon, { socialLabel } from './SocialIcon';
import { useSiteContent } from '../api/queries';

const Hero = () => {
  const [isHired, setIsHired] = useState(false);
  const { hero, socials } = useSiteContent();

  const handleHireClick = () => {
    setIsHired(!isHired);
  };

return (
    <section id="home" className="hero">
        <HeroBackground />
        <div className="hero-container">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-greeting">{hero.greeting}</h1>
                    <h2 className="hero-title">{hero.name}</h2>
                    <p className="hero-subtitle">
                        <span className="hero-subtitle-text">{hero.subtitle}</span>
                    </p>

                    <div className="hero-current-role">
                        <img src={hero.companyLogo || creativeLogo} alt={hero.roleText} className="hero-company-logo" width="175" height="49" decoding="async" />
                        <span className="hero-role-text">{hero.roleText}</span>
                    </div>

                    <div className="hero-actions">
                        <button 
                            className={`hire-btn ${isHired ? 'active' : ''}`}
                            onClick={handleHireClick}
                        >
                            <span>{hero.hireLabel}</span>
                            <div className="toggle-switch">
                                <div className="toggle-circle"></div>
                            </div>
                        </button>
                    </div>

                    <div className="social-icons">
                        {socials
                            .filter((social) => social.inHero && social.url)
                            .map((social) => (
                                <a key={social.platform + social.url} href={social.url} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={socialLabel(social.platform)}>
                                    <SocialIcon platform={social.platform} />
                                </a>
                            ))}
                    </div>
                </div>

                <div className="hero-image">
                    <div className="image-placeholder">
                        <img src={hero.profileImage || profileImage} alt={hero.profileAlt} width="900" height="1200" fetchPriority="high" decoding="async" />
                    </div>
                </div>
            </div>
        </div>
    </section>
);
};

export default Hero;
