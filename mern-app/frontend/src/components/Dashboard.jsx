import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = ({ user }) => {
  const { t, lang, setLang, LANG_LABELS } = useLanguage();
  const { themeId, setThemeId, allThemes, useCustomCursor, setUseCustomCursor } = useTheme();

  const features = [
    { to: '/play', icon: '♟', title: t('play'), desc: t('play_desc'), gradient: 'linear-gradient(135deg, rgba(79,140,255,0.12), rgba(155,109,255,0.06))', border: 'rgba(79,140,255,0.2)' },
    { to: '/puzzles', icon: '🧩', title: t('puzzles'), desc: t('puzzles_desc'), gradient: 'linear-gradient(135deg, rgba(155,109,255,0.12), rgba(79,140,255,0.06))', border: 'rgba(155,109,255,0.2)' },
    { to: '/learn', icon: '📚', title: t('learn'), desc: t('learn_desc'), gradient: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(79,140,255,0.06))', border: 'rgba(52,211,153,0.2)' },
    { to: '/practice', icon: '⚔️', title: t('practice'), desc: t('practice_desc'), gradient: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(201,162,39,0.06))', border: 'rgba(251,191,36,0.2)' },
    { to: '/profile', icon: '👤', title: t('profile'), desc: t('profile_desc'), gradient: 'linear-gradient(135deg, rgba(201,162,39,0.12), rgba(79,140,255,0.06))', border: 'rgba(201,162,39,0.2)' },
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {features.map(({ to, icon, title, desc, gradient, border }) => (
          <Link key={to} to={to} className="feature-card" style={{ background: gradient, borderColor: border }}>
            <div className="card-icon">{icon}</div>
            <div className="card-title">{title}</div>
            <div className="card-desc">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Settings */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>⚙️ {t('settings')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: '600' }}>
              {t('board_theme')}
            </label>
            <select value={themeId} onChange={e => setThemeId(e.target.value)} className="form-control" style={{ fontSize: '0.9rem', padding: '9px 12px' }}>
              {Object.entries(allThemes).map(([id, th]) => (
                <option key={id} value={id}>{th.name}</option>
              ))}
            </select>
            {/* Theme preview */}
            <div style={{ display: 'flex', gap: '2px', marginTop: '8px' }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: '20px', height: '20px', borderRadius: '3px', background: i % 2 === 0 ? allThemes[themeId].lightSquare : allThemes[themeId].darkSquare }} />
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: '600' }}>
              {t('language')}
            </label>
            <select value={lang} onChange={e => setLang(e.target.value)} className="form-control" style={{ fontSize: '0.9rem', padding: '9px 12px' }}>
              {Object.entries(LANG_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
              <div
                onClick={() => setUseCustomCursor(!useCustomCursor)}
                role="switch" aria-checked={useCustomCursor} tabIndex={0}
                style={{
                  width: '44px', height: '24px', borderRadius: '99px', cursor: 'pointer',
                  background: useCustomCursor ? 'var(--gold)' : 'var(--border)',
                  position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px', left: useCustomCursor ? '22px' : '3px',
                  width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                  transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </div>
              <span style={{ fontSize: '0.9rem' }}>♛ {t('piece_cursor')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
