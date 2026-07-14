import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard';
import ChessGame from './components/ChessGame';
import Puzzles from './components/Puzzles';
import Learn from './components/Learn';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import './index.css';

function AppContent() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
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

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          ♞ CHESS7KNIGHT
        </Link>
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">ELO: {user.rating}</span>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">{t('login')}</Link>
              <Link to="/register" className="btn">{t('signup')}</Link>
            </>
          )}
        </div>
      </nav>

      <main className="container" style={{ paddingBottom: '2rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/play" element={<ChessGame user={user} />} />
          <Route path="/puzzles" element={<Puzzles />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/profile" element={<Profile user={user} />} />
          
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
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
