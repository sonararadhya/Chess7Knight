import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = ({ user }) => {
  const { t, lang, setLang } = useLanguage();
  const { themeId, setThemeId, useCustomCursor, setUseCustomCursor } = useTheme();

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{t('dashboard_title')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.2rem' }}>
          {user ? t('welcome') + `, ${user.email.split('@')[0]}!` : 'Master the board. Play, learn, and solve.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <Link to="/play" className="btn" style={{ padding: '2rem 1rem', fontSize: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span>♟️</span> {t('play')}
          </Link>
          <Link to="/puzzles" className="btn btn-secondary" style={{ padding: '2rem 1rem', fontSize: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span>🧩</span> {t('puzzles')}
          </Link>
          <Link to="/learn" className="btn btn-secondary" style={{ padding: '2rem 1rem', fontSize: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span>📚</span> {t('learn')}
          </Link>
          <Link to="/profile" className="btn btn-secondary" style={{ padding: '2rem 1rem', fontSize: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span>👤</span> {t('profile')}
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Settings Section */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', minWidth: '200px' }}>
            <h4 style={{ marginBottom: '1rem' }}>{t('settings')}</h4>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Board Theme</label>
              <select 
                value={themeId} 
                onChange={(e) => setThemeId(e.target.value)}
                style={{ width: '100%', padding: '5px', background: '#30363d', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                <option value="classic">Classic Green</option>
                <option value="wood">Rustic Wood</option>
                <option value="midnight">Midnight (HD Background)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <input 
                type="checkbox" 
                id="cursorToggle"
                checked={useCustomCursor}
                onChange={(e) => setUseCustomCursor(e.target.checked)}
              />
              <label htmlFor="cursorToggle" style={{ fontSize: '0.9rem' }}>Use Piece Cursor</label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Language</label>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                style={{ width: '100%', padding: '5px', background: '#30363d', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
