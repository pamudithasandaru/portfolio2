import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import './styles/ScrollAnimations.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Footer from './components/Footer';

const HomePage = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.replace('#', '');
    const target = document.getElementById(targetId);

    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [location.hash]);

  return (
    <div className="home-page">
      <div className="home-background-orbs" aria-hidden="true">
        <span className="home-orb home-orb-1"></span>
        <span className="home-orb home-orb-2"></span>
        <span className="home-orb home-orb-3"></span>
        <span className="home-orb home-orb-4"></span>
        <span className="home-orb home-orb-5"></span>
      </div>
      <Hero />
      <About />
      <Footer />
    </div>
  );
};

const ProjectsPage = () => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <>
      <Projects />
      <Footer />
    </>
  );
};

function AppContent() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
