import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Register = ({ onLogin }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password, confirmPassword } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { email, password });
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(79,140,255,0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.75rem', animation: 'float 3s ease-in-out infinite' }}>♛</div>
          <h2>Create Account</h2>
          <p style={{ marginTop: '0.25rem', fontSize: '0.88rem' }}>Join Chess7Knight and track your rating</p>
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
              <input type={showPassword ? 'text' : 'password'} className="form-control" name="password" value={password} onChange={onChange} placeholder="Min. 6 characters" required minLength="6" style={{ paddingRight: '3rem' }} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', fontSize: '1.1rem' }} aria-label={showPassword ? 'Hide' : 'Show'}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type={showPassword ? 'text' : 'password'} className="form-control" name="confirmPassword" value={confirmPassword} onChange={onChange} placeholder="Repeat your password" required minLength="6" style={{ borderColor: confirmPassword && password !== confirmPassword ? 'var(--danger)' : undefined }} autoComplete="new-password" />
            {confirmPassword && password !== confirmPassword && (
              <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '5px' }}>Passwords don't match</div>
            )}
          </div>
          <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '0.5rem', padding: '12px' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account…</> : t('signup')}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', fontWeight: '600', textDecoration: 'none' }}>{t('login')} →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
