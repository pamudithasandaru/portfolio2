import { useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import {
  FaBlog,
  FaCertificate,
  FaChartLine,
  FaCode,
  FaEnvelope,
  FaFolderOpen,
  FaHandsHelping,
  FaImages,
  FaMoon,
  FaPenFancy,
  FaSignOutAlt,
  FaSun,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import useTheme from '../hooks/useTheme';
import { AuthProvider, useAuth } from './auth';
import { ToastProvider } from './ui';
import DashboardPage from './pages/DashboardPage';
import SiteContentPage from './pages/SiteContentPage';
import ProjectsPage from './pages/ProjectsPage';
import CertificationsPage from './pages/CertificationsPage';
import VolunteeringPage from './pages/VolunteeringPage';
import SkillsPage from './pages/SkillsPage';
import BlogsPage from './pages/BlogsPage';
import InboxPage from './pages/InboxPage';
import MediaPage from './pages/MediaPage';
import './admin.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', Icon: FaChartLine, end: true },
  { to: '/admin/site', label: 'Site content', Icon: FaPenFancy },
  { to: '/admin/projects', label: 'Projects', Icon: FaFolderOpen },
  { to: '/admin/certifications', label: 'Certifications', Icon: FaCertificate },
  { to: '/admin/skills', label: 'Languages & tools', Icon: FaCode },
  { to: '/admin/volunteering', label: 'Volunteering', Icon: FaHandsHelping },
  { to: '/admin/blogs', label: 'Blog posts', Icon: FaBlog },
  { to: '/admin/inbox', label: 'Messages & comments', Icon: FaEnvelope },
  { to: '/admin/media', label: 'Image library', Icon: FaImages },
];

const LoginScreen = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.username, form.password);
    } catch (failure) {
      setError(failure.message);
    }
    setBusy(false);
  };

  return (
    <main className="adm-login">
      <form className="adm-card" onSubmit={submit}>
        <h1>Admin sign in</h1>
        <label htmlFor="adm-user">Username</label>
        <input id="adm-user" autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required autoFocus />
        <label htmlFor="adm-pass">Password</label>
        <input id="adm-pass" type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button type="submit" className="adm-btn is-primary" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
};

const Shell = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <p className="adm-brand">Portfolio admin</p>
        <nav aria-label="Admin sections">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <Icon aria-hidden="true" /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <FaExternalLinkAlt aria-hidden="true" /> <span>View site</span>
          </a>
          <button type="button" onClick={toggleTheme}>
            {theme === 'dark' ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />} <span>{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
          </button>
          <button type="button" onClick={logout}>
            <FaSignOutAlt aria-hidden="true" /> <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="adm-main" key={location.pathname}>
        <Routes>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/site" element={<SiteContentPage />} />
          <Route path="/admin/projects" element={<ProjectsPage />} />
          <Route path="/admin/certifications" element={<CertificationsPage />} />
          <Route path="/admin/skills" element={<SkillsPage />} />
          <Route path="/admin/volunteering" element={<VolunteeringPage />} />
          <Route path="/admin/blogs" element={<BlogsPage />} />
          <Route path="/admin/inbox" element={<InboxPage />} />
          <Route path="/admin/media" element={<MediaPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const Gate = () => {
  const { signedIn } = useAuth();
  return signedIn ? <Shell /> : <LoginScreen />;
};

const AdminApp = () => (
  <ToastProvider>
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </ToastProvider>
);

export default AdminApp;
