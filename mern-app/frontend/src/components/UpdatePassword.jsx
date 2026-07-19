import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UpdatePassword = ({ user, onPasswordChanged }) => {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { newPassword, confirmPassword } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/auth/update-password`,
        { newPassword },
        { headers: { 'x-auth-token': token } }
      );
      
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        onPasswordChanged(res.data.user);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '420px', margin: '4rem auto' }}>
      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(201,162,39,0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.75rem', animation: 'float 3s ease-in-out infinite' }}>🔒</div>
          <h2>Update Your Password</h2>
          <p style={{ marginTop: '0.25rem', fontSize: '0.88rem' }}>
            Please select a new secure password to proceed.
          </p>
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '10px 14px', background: 'var(--danger-glow)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', fontSize: '0.88rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: '#10b981', marginBottom: '1rem', padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', fontSize: '0.88rem', textAlign: 'center' }}>
            {success}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="form-control" name="newPassword" value={newPassword} onChange={onChange} placeholder="Min. 6 characters" required minLength="6" style={{ paddingRight: '3rem' }} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', fontSize: '1.1rem' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type={showPassword ? 'text' : 'password'} className="form-control" name="confirmPassword" value={confirmPassword} onChange={onChange} placeholder="Repeat your new password" required minLength="6" style={{ borderColor: confirmPassword && newPassword !== confirmPassword ? 'var(--danger)' : undefined }} autoComplete="new-password" />
            {confirmPassword && newPassword !== confirmPassword && (
              <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '5px' }}>Passwords don't match</div>
            )}
          </div>

          <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '0.5rem', padding: '12px' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Updating…</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
