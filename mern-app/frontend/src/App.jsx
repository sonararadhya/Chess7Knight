import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard';
import ChessGame from './components/ChessGame';
import Puzzles from './components/Puzzles';
import Learn from './components/Learn';
import Practice from './components/Practice';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import UpdatePassword from './components/UpdatePassword';
import './index.css';

/* Floating chess-piece background */
const ChessBg = () => {
  const pieces = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];
  return (
    <div className="chess-bg" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="piece"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${1.5 + Math.random() * 2}rem`,
            animationDuration: `${20 + Math.random() * 40}s`,
            animationDelay: `${Math.random() * 20}s`,
          }}
        >
          {pieces[i % pieces.length]}
        </span>
      ))}
    </div>
  );
};

function AppContent() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handlePasswordChanged = (updatedUserData) => {
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  };

  const navItems = [
    { to: '/play', icon: '♟', label: t('play') },
    { to: '/puzzles', icon: '🧩', label: t('puzzles') },
    { to: '/learn', icon: '📚', label: t('learn') },
    { to: '/practice', icon: '⚔️', label: t('practice') },
    { to: '/profile', icon: '👤', label: t('profile') },
  ];

  if (isAuthenticated && user?.mustChangePassword) {
    return (
      <div className="app">
        <ChessBg />
        <nav className="navbar">
          <div className="navbar-brand" style={{ pointerEvents: 'none' }}>
            <img src="/logo.png" alt="Chess7Knight" />
            <span>CHESS7KNIGHT</span>
          </div>
          <div className="nav-links">
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">{t('logout')}</button>
          </div>
        </nav>
        <main className="container" style={{ paddingBottom: '3rem' }}>
          <Routes>
            <Route path="*" element={<UpdatePassword user={user} onPasswordChanged={handlePasswordChanged} />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <ChessBg />

      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="Chess7Knight" />
          <span>CHESS7KNIGHT</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links desktop-only">
          {isAuthenticated ? (
            <>
              {navItems.map(({ to, icon, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  {icon} {label}
                </NavLink>
              ))}
              <span className="user-greeting">ELO {user?.rating ?? '—'}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">{t('logout')}</button>
            </>
          ) : (
            <>
              <Link to="/play" className="nav-link">♟ {t('play')}</Link>
              <Link to="/login" className="btn btn-secondary btn-sm">{t('login')}</Link>
              <Link to="/register" className="btn btn-sm">{t('signup')}</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setMobileNav(true)} aria-label="Open menu">☰</button>
      </nav>

      {/* Mobile nav overlay */}
      {mobileNav && (
        <div className="mobile-nav">
          <button className="mobile-nav-close" onClick={() => setMobileNav(false)}>✕</button>
          {isAuthenticated && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <div className="user-greeting" style={{ fontSize: '1rem' }}>ELO {user?.rating ?? '—'}</div>
            </div>
          )}
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setMobileNav(false)}
            >
              {icon} {label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); setMobileNav(false); }} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              {t('logout')}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link to="/login" className="btn btn-secondary" onClick={() => setMobileNav(false)}>{t('login')}</Link>
              <Link to="/register" className="btn" onClick={() => setMobileNav(false)}>{t('signup')}</Link>
            </div>
          )}
        </div>
      )}

      <main className="container" style={{ paddingBottom: '3rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/play" element={<ChessGame user={user} />} />
          <Route path="/puzzles" element={<Puzzles />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
