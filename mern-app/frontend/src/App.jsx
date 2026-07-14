import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ChessGame from './components/ChessGame';
import Login from './components/Login';
import Register from './components/Register';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token on load
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
    <Router>
      <div className="app">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            ♞ CHESS7KNIGHT
          </Link>
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <span className="user-greeting">Welcome, {user.email.split('@')[0]} (ELO: {user.rating})</span>
                <Link to="/">Play</Link>
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
              </>
            ) : (
              <>
                <Link to="/" className="btn btn-secondary" style={{ marginRight: '10px' }}>Play as Guest</Link>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn">Sign Up</Link>
              </>
            )}
          </div>
        </nav>

        <main className="container">
          <Routes>
            <Route 
              path="/" 
              element={<ChessGame user={user} />} 
            />
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
    </Router>
  );
}

export default App;
