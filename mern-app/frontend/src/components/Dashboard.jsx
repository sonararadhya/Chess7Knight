import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = ({ user }) => {
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

  // Only keep Play, Puzzles, Learn, and Practice cards (remove Profile)
  const features = [
    { to: '/play', icon: '♟', title: t('play'), desc: t('play_desc'), gradient: 'linear-gradient(135deg, rgba(79,140,255,0.12), rgba(155,109,255,0.06))', border: 'rgba(79,140,255,0.2)' },
    { to: '/puzzles', icon: '🧩', title: t('puzzles'), desc: t('puzzles_desc'), gradient: 'linear-gradient(135deg, rgba(155,109,255,0.12), rgba(79,140,255,0.06))', border: 'rgba(155,109,255,0.2)' },
    { to: '/learn', icon: '📚', title: t('learn'), desc: t('learn_desc'), gradient: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(79,140,255,0.06))', border: 'rgba(52,211,153,0.2)' },
    { to: '/practice', icon: '⚔️', title: t('practice'), desc: t('practice_desc'), gradient: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(201,162,39,0.06))', border: 'rgba(251,191,36,0.2)' },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: '960px', margin: '2rem auto' }}>

      {/* Hero */}
      <div className="glass-panel" style={{ textAlign: 'center', padding: 'clamp(2.5rem, 5vw, 4.5rem) 2rem clamp(2rem, 4vw, 3.5rem)', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16rem', opacity: 0.03, userSelect: 'none', pointerEvents: 'none', lineHeight: 1, color: 'var(--gold)' }}>♛</div>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(201,162,39,0.08), transparent 70%)', pointerEvents: 'none' }} />

        <h1 style={{ marginBottom: '0.75rem' }}>{t('dashboard_title')}</h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
          {user ? `${t('welcome')}, ${user.email.split('@')[0]}!` : t('dashboard_subtitle')}
        </p>

        {user && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '1.5rem', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)', borderRadius: '99px', padding: '6px 20px' }}>
            <span style={{ color: 'var(--gold)', fontWeight: '700', fontSize: '0.95rem' }}>♚ ELO {user.rating}</span>
          </div>
        )}

        {!user && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link to="/play" className="btn btn-gold btn-lg">♟ {t('quick_play')}</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">{t('signup')}</Link>
          </div>
        )}
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {features.map(({ to, icon, title, desc, gradient, border }) => (
          <Link key={to} to={to} className="feature-card" style={{ background: gradient, borderColor: border }}>
            <div className="card-icon">{icon}</div>
            <div className="card-title">{title}</div>
            <div className="card-desc">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Game history of player below the cards */}
      {user && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>📋 {t('recent_matches')}</h3>
            <Link to="/profile" style={{ fontSize: '0.85rem', color: 'var(--gold)', textDecoration: 'none', fontWeight: '600' }}>View Profile →</Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} /> Loading…
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>♟</div>
              <p>{t('no_matches')}</p>
              <Link to="/play" className="btn btn-sm" style={{ marginTop: '1rem' }}>{t('start_playing')}</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {history.slice(0, 5).map((match, i) => (
                <div key={match._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ fontWeight: '500', fontSize: '0.88rem' }}>
                      🤖 Bot ELO {match.difficulty || 1200}
                    </span>
                    {match.openingName && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-block' }} className="desktop-only">
                        • {match.openingName}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className={`badge ${match.result === '1-0' ? 'badge-win' : match.result === '0-1' ? 'badge-loss' : 'badge-draw'}`}>
                      {match.result === '1-0' ? '✓ Win' : match.result === '0-1' ? '✗ Loss' : '= Draw'}
                    </span>
                    <span style={{ color: (match.accuracy || 0) >= 90 ? 'var(--success)' : (match.accuracy || 0) >= 75 ? 'var(--warning)' : 'var(--danger)', fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                      {match.accuracy || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
