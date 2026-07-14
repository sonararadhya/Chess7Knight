import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = ({ user }) => {
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) fetchHistory(); }, [user]);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/matches/history`, { headers: { 'x-auth-token': token } });
      setHistory(res.data);
    } catch (err) { console.error('Error fetching history', err); }
    finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="fade-in" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="glass-panel">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
          <h2 style={{ marginBottom: '0.75rem' }}>{t('guest_profile')}</h2>
          <p>{t('guest_profile_msg')}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to="/login" className="btn btn-secondary">{t('login')}</Link>
            <Link to="/register" className="btn btn-gold">{t('signup')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const wins = history.filter(m => m.result === '1-0').length;
  const losses = history.filter(m => m.result === '0-1').length;
  const draws = history.filter(m => m.result === '1/2-1/2').length;
  const winRate = history.length > 0 ? Math.round((wins / history.length) * 100) : 0;
  const avgAccuracy = history.length > 0 ? Math.round(history.reduce((s, m) => s + (m.accuracy || 0), 0) / history.length) : 0;

  const difficultyLabel = (d) => {
    if (d >= 2000) return 'Advanced (2000)';
    if (d >= 1200) return 'Intermediate (1200)';
    return 'Beginner (400)';
  };

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A';

  return (
    <div className="fade-in" style={{ maxWidth: '860px', margin: '2rem auto' }}>

      {/* Profile header */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(201,162,39,0.06), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{
          width: '90px', height: '90px', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--gold), var(--accent))',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', boxShadow: '0 8px 24px var(--gold-glow)',
        }}>♚</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '4px' }}>{user.email.split('@')[0]}</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{user.email}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)', borderRadius: '99px', padding: '4px 14px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: '700' }}>♚ ELO {user.rating}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { val: history.length, label: t('played'), color: '#fff' },
          { val: wins, label: t('wins'), color: 'var(--success)' },
          { val: losses, label: t('losses'), color: 'var(--danger)' },
          { val: draws, label: 'Draws', color: 'var(--text-secondary)' },
          { val: `${winRate}%`, label: t('win_rate'), color: 'var(--accent)' },
          { val: `${avgAccuracy}%`, label: t('accuracy'), color: 'var(--gold)' },
        ].map(({ val, label, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-value" style={{ color }}>{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Win rate bar */}
      {history.length > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '0 2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>{t('win_rate')}</span><span>{winRate}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${winRate}%` }} />
          </div>
        </div>
      )}

      {/* Match history */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📋 {t('match_history')}
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} /> Loading…
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>♟</div>
            <p>{t('no_matches')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  {[t('date'), t('opponent'), t('result'), t('accuracy')].map(h => (
                    <th key={h} style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((match, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 12px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>
                      🤖 Stockfish <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{difficultyLabel(match.difficulty)}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${match.result === '1-0' ? 'badge-win' : match.result === '0-1' ? 'badge-loss' : 'badge-draw'}`}>
                        {match.result === '1-0' ? '✓ Win' : match.result === '0-1' ? '✗ Loss' : '= Draw'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>
                      <span style={{ color: match.accuracy >= 90 ? 'var(--success)' : match.accuracy >= 75 ? 'var(--warning)' : 'var(--danger)', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
                        {match.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
