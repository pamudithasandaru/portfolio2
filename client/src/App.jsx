import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import './styles/ScrollAnimations.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
const Projects = lazy(() => import('./components/Projects'));
const Certifications = lazy(() => import('./components/Certifications'));
const Blogs = lazy(() => import('./components/Blogs'));
const BlogPost = lazy(() => import('./components/BlogPost'));
import Footer from './components/Footer';
import { trackPageView } from './utils/analytics';
const AdminApp = lazy(() => import('./admin/AdminApp'));

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

const CertificationsPage = () => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <>
      <Certifications />
      <Footer />
    </>
  );
};

const BlogsPage = () => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <>
      <Blogs />
      <Footer />
    </>
  );
};

const BlogPostPage = () => (
  <>
    <BlogPost />
    <Footer />
  </>
);

function AppContent() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const lastTracked = React.useRef('');

  React.useEffect(() => {
    if (!isAdmin && lastTracked.current !== pathname) {
      lastTracked.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname, isAdmin]);

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="route-loading" aria-busy="true" />}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <Suspense fallback={<div className="route-loading" aria-busy="true" />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blogs/:slug" element={<BlogPostPage />} />
      </Routes>
      </Suspense>
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
