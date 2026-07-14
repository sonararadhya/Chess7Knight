import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = ({ onLogin }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '420px', margin: '4rem auto' }}>
      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(201,162,39,0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.75rem', animation: 'float 3s ease-in-out infinite' }}>♞</div>
          <h2>Welcome Back</h2>
          <p style={{ marginTop: '0.25rem', fontSize: '0.88rem' }}>Sign in to track your rating & history</p>
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '10px 14px', background: 'var(--danger-glow)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', fontSize: '0.88rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" name="email" value={email} onChange={onChange} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="form-control" name="password" value={password} onChange={onChange} placeholder="••••••••" required style={{ paddingRight: '3rem' }} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', fontSize: '1.1rem' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '0.5rem', padding: '12px' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in…</> : t('login')}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--gold)', fontWeight: '600', textDecoration: 'none' }}>{t('signup')} →</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
