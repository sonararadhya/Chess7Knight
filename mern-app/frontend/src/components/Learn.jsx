import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PIECES = [
  { symbol: '♟', name: 'Pawn', color: '#8b92a8', movement: 'Moves forward 1 square (or 2 from its starting rank). Captures diagonally.', specialMoves: ['En Passant — capture a pawn that just moved two squares, as if it moved only one.', 'Promotion — when a pawn reaches the last rank it can become a Queen, Rook, Bishop, or Knight.'], tip: 'Pawns are your foot soldiers. Control the center with pawns on e4 and d4.' },
  { symbol: '♞', name: 'Knight', color: '#4f8cff', movement: 'Moves in an "L" shape: 2 squares in one direction, then 1 square at a right angle.', specialMoves: ['Only piece that can jump over other pieces!'], tip: 'Knights are strongest in closed positions. A knight on f5 or c5 can be devastating.' },
  { symbol: '♝', name: 'Bishop', color: '#34d399', movement: 'Moves diagonally any number of squares. Always stays on the same color.', specialMoves: ['Each player has one light-squared and one dark-squared bishop.'], tip: 'Bishops are most powerful in open positions with long diagonals.' },
  { symbol: '♜', name: 'Rook', color: '#fbbf24', movement: 'Moves horizontally or vertically any number of squares.', specialMoves: ['Castling — the king and rook can swap positions under specific conditions.'], tip: 'Rooks belong on open files and the 7th rank. Connect your rooks early!' },
  { symbol: '♛', name: 'Queen', color: '#9b6dff', movement: 'Most powerful piece. Moves horizontally, vertically, or diagonally any number of squares.', specialMoves: ['Combines the powers of the Rook and Bishop.'], tip: "Don't bring the queen out too early — she can be attacked and forced to retreat." },
  { symbol: '♚', name: 'King', color: '#f87171', movement: 'Moves exactly 1 square in any direction.', specialMoves: ['Castling — move the king 2 squares toward a rook; the rook jumps to the other side.', 'The king cannot move into check.'], tip: 'Keep your king safe! Castle early, and activate the king in the endgame.' },
];

const SPECIAL_MOVES = [
  { title: '🏰 Castling', desc: 'The king moves two squares toward a rook, and the rook jumps to the other side. Neither piece has moved, no pieces between, king not in/through check.' },
  { title: '⚡ En Passant', desc: "If an opponent's pawn moves two squares from start and lands beside your pawn, capture it diagonally to the skipped square. Must be done immediately!" },
  { title: '👑 Pawn Promotion', desc: 'When your pawn reaches the opposite end, promote to Queen, Rook, Bishop, or Knight. Almost always promote to a Queen!' },
  { title: '⚔️ Check & Checkmate', desc: 'Check means the king is attacked. Checkmate means no legal escape — game over.' },
];

const STRATEGY = [
  { title: '🎯 Control the Center', desc: 'The four central squares (e4, d4, e5, d5) are the most important. Pieces in the center have maximum influence over the board.', icon: '♟' },
  { title: '🏗️ Develop Your Pieces', desc: 'Get your knights and bishops out early. Each undeveloped piece is a soldier not fighting. Aim to develop all pieces before launching attacks.', icon: '♞' },
  { title: '🏰 Castle Early', desc: 'Castling protects your king and connects your rooks. Try to castle within the first 10 moves.', icon: '♚' },
  { title: '♜ Control Open Files', desc: 'Place your rooks on open files (columns with no pawns). Rooks on the 7th rank are devastating.', icon: '♜' },
  { title: '🔗 Pawn Structure', desc: 'Avoid doubled, isolated, and backward pawns. A good pawn structure provides a solid foundation for your pieces.', icon: '♟' },
  { title: '⚡ Tactics First', desc: 'Always check for tactics before making a move: forks, pins, skewers, discovered attacks, and back rank mates.', icon: '♛' },
];

const Learn = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [showSpecial, setShowSpecial] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);

  const piece = PIECES[activeTab];

  return (
    <div className="fade-in" style={{ maxWidth: '860px', margin: '2rem auto' }}>
      <div className="glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem', animation: 'float 3s ease-in-out infinite' }}>📚</div>
          <h2>{t('learn_title')}</h2>
          <p style={{ marginTop: '0.5rem' }}>{t('learn_subtitle')}</p>
        </div>

        {/* Piece tabs */}
        <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
          {PIECES.map((p, i) => (
            <button key={i} className={`tab-btn${activeTab === i ? ' active' : ''}`} onClick={() => { setActiveTab(i); setShowSpecial(false); setShowStrategy(false); }}>
              <span style={{ marginRight: '4px' }}>{p.symbol}</span> {p.name}
            </button>
          ))}
        </div>

        {/* Piece detail */}
        <div className="slide-in" key={activeTab} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.25)', borderRadius: '14px', border: `1px solid ${piece.color}25`, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ width: '72px', height: '72px', flexShrink: 0, background: `${piece.color}12`, border: `2px solid ${piece.color}30`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', lineHeight: 1 }}>{piece.symbol}</div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ color: piece.color, marginBottom: '4px' }}>The {piece.name}</h3>
              <p style={{ fontSize: '0.9rem' }}>{piece.movement}</p>
            </div>
          </div>

          {piece.specialMoves.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', marginBottom: '8px' }}>{t('special_rules')}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {piece.specialMoves.map((sm, i) => (
                  <li key={i} style={{ padding: '8px 12px', background: `${piece.color}08`, borderLeft: `3px solid ${piece.color}`, borderRadius: '0 8px 8px 0', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{sm}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ padding: '10px 14px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)', borderRadius: '10px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--gold)', fontWeight: '600' }}>💡 {t('tip')}: </span>
            <span style={{ color: 'var(--text-secondary)' }}>{piece.tip}</span>
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className={`btn ${showSpecial ? 'btn-secondary' : 'btn-gold'}`} style={{ flex: 1, minWidth: '200px' }} onClick={() => { setShowSpecial(!showSpecial); setShowStrategy(false); }}>
            {showSpecial ? '↑ Hide' : '⚡ Show'} Special Moves
          </button>
          <button className={`btn ${showStrategy ? 'btn-secondary' : ''}`} style={{ flex: 1, minWidth: '200px' }} onClick={() => { setShowStrategy(!showStrategy); setShowSpecial(false); }}>
            {showStrategy ? '↑ Hide' : '🎯 Show'} Strategy Guide
          </button>
        </div>

        {showSpecial && (
          <div className="slide-in" style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {SPECIAL_MOVES.map((sm, i) => (
              <div key={i} style={{ padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--gold)', marginBottom: '6px', fontSize: '1rem' }}>{sm.title}</h3>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>{sm.desc}</p>
              </div>
            ))}
          </div>
        )}

        {showStrategy && (
          <div className="slide-in" style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {STRATEGY.map((s, i) => (
              <div key={i} style={{ padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                  <h3 style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>{s.title}</h3>
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
