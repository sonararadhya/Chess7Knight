import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = ({ user }) => {
  const { t, lang, setLang, LANG_LABELS } = useLanguage();
  const { themeId, setThemeId, pieceSetId, setPieceSetId, allThemes, allPieceSets, useCustomCursor, setUseCustomCursor } = useTheme();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    let localMatches = [];
    try {
      localMatches = JSON.parse(localStorage.getItem('chess7k_match_history') || '[]');
    } catch (e) {}

    const token = localStorage.getItem('token');
    if (token && user) {
      try {
        const res = await axios.get(`${API_URL}/matches/history`, { headers: { 'x-auth-token': token } });
        const apiMatches = res.data || [];
        
        const map = new Map();
        [...apiMatches, ...localMatches].forEach(m => {
          const key = m._id || m.id || m.date;
          if (!map.has(key)) map.set(key, m);
        });

        const merged = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(merged);
      } catch (err) {
        console.error('Error fetching API history, using local history fallback', err);
        setHistory(localMatches);
      } finally {
        setLoading(false);
      }
    } else {
      setHistory(localMatches);
      setLoading(false);
    }
  };

  const handleLaunchReview = (match) => {
    navigate('/play', { state: { reviewMatch: match } });
  };

  const wins = history.filter(m => m.result === '1-0').length;
  const losses = history.filter(m => m.result === '0-1').length;
  const draws = history.filter(m => m.result === '1/2-1/2').length;
  const winRate = history.length > 0 ? Math.round((wins / history.length) * 100) : 0;
  const avgAccuracy = history.length > 0 ? Math.round(history.reduce((s, m) => s + (m.accuracy || 0), 0) / history.length) : 0;

  const totalEloChange = history.reduce((sum, m) => sum + (m.eloChange || 0), 0);
  const currentRating = user?.rating ?? (parseInt(localStorage.getItem('chess7k_guest_elo')) || 1200);

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Guest Player';

  const moveCategories = [
    { key: 'brilliant', label: 'Brilliant', emoji: '💎', color: '#9b6dff' },
    { key: 'great', label: 'Great Move', emoji: '⭐', color: '#4f8cff' },
    { key: 'best', label: 'Best Move', emoji: '🟢', color: '#34d399' },
    { key: 'excellent', label: 'Excellent', emoji: '✅', color: '#10b981' },
    { key: 'good', label: 'Good', emoji: '👍', color: '#6b7280' },
    { key: 'book', label: 'Book Move', emoji: '📖', color: '#c9a227' },
    { key: 'inaccuracy', label: 'Inaccuracy', emoji: '❓', color: '#fbbf24' },
    { key: 'mistake', label: 'Mistake', emoji: '⚠️', color: '#f59e0b' },
    { key: 'miss', label: 'Missed Win', emoji: '❌', color: '#f97316' },
    { key: 'blunder', label: 'Blunder', emoji: '🔴', color: '#f87171' }
  ];

  return (
    <div className="fade-in" style={{ maxWidth: '880px', margin: '2rem auto' }}>

      {/* Profile / User Banner */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(201,162,39,0.06), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{
          width: '90px', height: '90px', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--gold), var(--accent))',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', boxShadow: '0 8px 24px var(--gold-glow)',
        }}>♚</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '4px' }}>{user ? user.email.split('@')[0] : 'Guest Player'}</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{user ? user.email : 'Local Guest Account'}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)', borderRadius: '99px', padding: '4px 14px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: '700' }}>♚ ELO {currentRating}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: totalEloChange >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${totalEloChange >= 0 ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: '99px', padding: '4px 12px', fontSize: '0.8rem', color: totalEloChange >= 0 ? '#34d399' : '#f87171', fontWeight: '700' }}>
              {totalEloChange >= 0 ? `+${totalEloChange}` : totalEloChange} Total ELO
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Customization & Themes Settings */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>⚙️ {t('settings')} & Designs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: '600' }}>
              🎨 {t('board_theme')}
            </label>
            <select value={themeId} onChange={e => setThemeId(e.target.value)} className="form-control" style={{ fontSize: '0.9rem', padding: '9px 12px' }}>
              {Object.entries(allThemes).map(([id, th]) => (
                <option key={id} value={id}>{th.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ width: '20px', height: '20px', borderRadius: '4px', background: i % 2 === 0 ? allThemes[themeId].lightSquare : allThemes[themeId].darkSquare }} />
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: '600' }}>
              ♛ Piece Set Design
            </label>
            <select value={pieceSetId} onChange={e => setPieceSetId(e.target.value)} className="form-control" style={{ fontSize: '0.9rem', padding: '9px 12px' }}>
              {Object.entries(allPieceSets).map(([id, ps]) => (
                <option key={id} value={id}>{ps.name}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              {allPieceSets[pieceSetId]?.desc || ''}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: '600' }}>
              🌐 {t('language')}
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

      {/* Match History Section */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📋 {t('match_history')}
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} /> Loading…
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>♟</div>
            <p>{t('no_matches')}</p>
            <Link to="/play" className="btn btn-gold btn-sm" style={{ marginTop: '1rem' }}>
              ⚔️ Play Match Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((match, i) => {
              const matchId = match._id || match.id || i;
              const isExpanded = expandedMatch === matchId;
              const eloDiff = match.eloChange !== undefined ? match.eloChange : (match.result === '1-0' ? 16 : match.result === '0-1' ? -16 : 0);

              return (
                <div key={matchId} className="glass-panel" style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '8px' }} onClick={() => setExpandedMatch(isExpanded ? null : matchId)}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(match.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                        🤖 Bot ELO {match.difficulty || 1200}
                      </span>
                      <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                        ⏱️ {match.timeControl || 'no limit'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {/* ELO CHANGE BADGE */}
                      <span style={{
                        fontSize: '0.8rem', fontWeight: '700', fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: '4px',
                        background: eloDiff > 0 ? 'rgba(52,211,153,0.12)' : eloDiff < 0 ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.05)',
                        color: eloDiff > 0 ? '#34d399' : eloDiff < 0 ? '#f87171' : 'var(--text-muted)',
                        border: `1px solid ${eloDiff > 0 ? 'rgba(52,211,153,0.3)' : eloDiff < 0 ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`
                      }}>
                        {eloDiff > 0 ? `+${eloDiff}` : eloDiff} ELO
                      </span>

                      <span className={`badge ${match.result === '1-0' ? 'badge-win' : match.result === '0-1' ? 'badge-loss' : 'badge-draw'}`}>
                        {match.result === '1-0' ? '✓ Win' : match.result === '0-1' ? '✗ Loss' : '= Draw'}
                      </span>
                      <span style={{ color: (match.accuracy || 0) >= 90 ? 'var(--success)' : (match.accuracy || 0) >= 75 ? 'var(--warning)' : 'var(--danger)', fontWeight: '700', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                        {match.accuracy || 0}%
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLaunchReview(match); }}
                        className="btn btn-gold btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        🔍 Review Match
                      </button>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded Match Analysis Details */}
                  {isExpanded && (
                    <div className="slide-in" style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '6px' }}>🏆 Game Performance</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '0.85rem' }}>Rating: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{match.performanceRating || 1200} ELO</strong></div>
                            <div style={{ fontSize: '0.85rem' }}>Opening: <strong style={{ color: 'var(--accent)' }}>{match.openingName || 'Standard Opening'}</strong></div>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '6px' }}>⏱️ Phase Accuracy</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {['opening', 'middlegame', 'endgame'].map(phase => {
                              const val = match.phasePerformance?.[phase] || 0;
                              if (phase === 'endgame' && val === 0) return null;
                              return (
                                <div key={phase} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                  <span style={{ textTransform: 'capitalize' }}>{phase}:</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '120px' }}>
                                    <div className="progress-bar-track" style={{ flex: 1, height: '4px' }}>
                                      <div className="progress-bar-fill" style={{ width: `${val}%` }} />
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{val}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Move Classifications Grid */}
                      <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Move Quality Breakdown</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '1rem' }}>
                        {moveCategories.map(({ key, label, emoji, color }) => {
                          const count = match.analysis?.[key] || 0;
                          return (
                            <div key={key} style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '1rem' }} title={label}>{emoji}</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: '700', color, fontFamily: 'var(--font-mono)' }}>{count}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handleLaunchReview(match)}
                        className="btn btn-gold btn-sm"
                        style={{ width: '100%', padding: '10px' }}
                      >
                        🔍 Open Interactive Step-by-Step Review
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
