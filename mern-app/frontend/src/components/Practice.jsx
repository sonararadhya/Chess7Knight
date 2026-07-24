import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getCustomPieces } from '../utils/pieceSets';

const DRILLS = {
  openings: [
    { name: 'Italian Game', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', moves: ['Bc5'], desc: 'Develop the bishop to c5 in the Italian Game.', hint: 'Move your dark-squared bishop to c5 to control the central d4 square.' },
    { name: 'Sicilian Defense', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', moves: ['c5'], desc: 'Play c5 to start the Sicilian Defense.', hint: 'Push your c-pawn to c5 to challenge White\'s central dominance asynchronously.' },
    { name: "Queen's Gambit", fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1', moves: ['d5'], desc: 'Respond with d5 to contest the center.', hint: 'Push your d-pawn to d5 to establish immediate central presence.' },
    { name: 'Ruy Lopez (Spanish)', fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', moves: ['a6'], desc: 'Play a6 to challenge White\'s b5 bishop.', hint: 'Question White\'s bishop with a6 (Morphy Defense).' },
    { name: 'French Defense', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', moves: ['e6'], desc: 'Play e6 to establish a solid French structure.', hint: 'Prepare d5 by advancing e6 first.' },
    { name: 'Caro-Kann Defense', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', moves: ['c6'], desc: 'Play c6 to prepare d5.', hint: 'Set up c6 to support d5 without blocking your light-squared bishop.' },
  ],
  endgames: [
    { name: 'King + Rook Mate', fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1', moves: ['Ra8'], desc: 'Use the rook to deliver checkmate on the back rank.', hint: 'Drive the enemy king to the edge and slide your rook to a8.' },
    { name: 'Passed Pawn', fen: '8/8/8/4k3/8/8/4P3/4K3 w - - 0 1', moves: ['e4'], desc: 'Push the pawn forward to promote.', hint: 'Advance your passed pawn towards promotion with king support.' },
    { name: 'Opposition', fen: '8/8/4k3/8/4K3/8/4P3/8 w - - 0 1', moves: ['e3'], desc: 'Push the pawn. The king will support it later.', hint: 'Advance e3 to retain key opposition squares.' },
    { name: 'King + Queen Mate', fen: '4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1', moves: ['Qe7'], desc: 'Cut off the king with your Queen.', hint: 'Trap the enemy king against the back rank with Qe7.' },
    { name: 'Lucena Position', fen: '1R6/3k4/8/3P4/8/8/3K4/8 w - - 0 1', moves: ['Rb7'], desc: 'Check the king away to build a bridge.', hint: 'Deliver check on b7 to drive the black king to the c-file.' },
    { name: 'Pawn Push Promotion', fen: '8/2P5/8/3k4/8/8/4K3/8 w - - 0 1', moves: ['c8=Q'], desc: 'Promote your pawn to a Queen!', hint: 'Advance the c7 pawn to c8 and promote to a Queen.' },
  ],
  tactics: [
    { name: 'Fork the King & Rook', fen: 'r3k3/8/8/8/3N4/8/8/4K3 w - - 0 1', moves: ['Nc6'], desc: 'The knight forks the king and rook on c6.', hint: 'Jump your knight to c6 to fork king e8 and rook a7/a8.' },
    { name: 'Back Rank Mate', fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', moves: ['Re8'], desc: 'Deliver checkmate on the back rank.', hint: 'Slide your rook to the 8th rank for an unblockable mate.' },
    { name: 'Pin the Knight', fen: 'r1bqkb1r/pppppppp/2n2n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 2 3', moves: ['Bb5'], desc: 'Pin the knight to the king with Bb5.', hint: 'Develop Bb5 to freeze the c6 knight in place.' },
    { name: 'Skewer Tactics', fen: '4k3/8/8/4q3/8/8/8/R3K3 w - - 0 1', moves: ['Ra8'], desc: 'Deliver a powerful Rook Skewer!', hint: 'Check the king on a8 and win the queen behind it.' },
    { name: 'Discovered Attack', fen: 'r1bqk2r/pppp1ppp/2n5/4P3/1b2n3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 6', moves: ['Bd2'], desc: 'Neutralize the pin on c3.', hint: 'Interpose your bishop on d2 to block the check line.' },
    { name: 'Knight Fork on c7', fen: 'r3k2r/ppp2ppp/2n5/4p3/3N4/8/PPP2PPP/R3K2R w KQkq - 0 1', moves: ['Nbc6'], desc: 'Fork the central squares!', hint: 'Move your knight into c6 to create multiple piece threats.' },
  ],
};

const CATEGORIES = [
  { key: 'openings', icon: '📖', color: 'var(--accent)' },
  { key: 'endgames', icon: '🏁', color: 'var(--success)' },
  { key: 'tactics', icon: '⚔️', color: 'var(--danger)' },
];

const Practice = () => {
  const { theme, pieceSetId } = useTheme();
  const { t } = useLanguage();
  const [category, setCategory] = useState(null);
  const [drillIdx, setDrillIdx] = useState(0);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [showHint, setShowHint] = useState(false);
  const [moveFrom, setMoveFrom] = useState(null);
  const [optionSquares, setOptionSquares] = useState({});
  const [completed, setCompleted] = useState(false);
  const [boardWidth, setBoardWidth] = useState(480);

  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState('start');

  const customPieces = useMemo(() => getCustomPieces(pieceSetId), [pieceSetId]);

  useEffect(() => {
    const updateSize = () => setBoardWidth(Math.min(480, window.innerWidth - 48));
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const startDrill = (cat, idx) => {
    const drill = DRILLS[cat][idx];
    gameRef.current = new Chess(drill.fen);
    setFen(gameRef.current.fen());
    setCategory(cat);
    setDrillIdx(idx);
    setStatus(drill.desc);
    setStatusType('info');
    setShowHint(false);
    setCompleted(false);
    setMoveFrom(null);
    setOptionSquares({});
  };

  const drill = category ? DRILLS[category][drillIdx] : null;

  const tryMove = useCallback((from, to) => {
    if (completed || !drill) return false;
    try {
      const result = gameRef.current.move({ from, to, promotion: 'q' });
      if (!result) return false;
      setFen(gameRef.current.fen());
      setOptionSquares({});
      setMoveFrom(null);

      if (drill.moves.includes(result.san)) {
        setStatus(`✓ ${t('correct')} — ${drill.name}`);
        setStatusType('success');
        setCompleted(true);
      } else {
        setStatus(`✗ ${t('incorrect')}`);
        setStatusType('error');
        setTimeout(() => {
          gameRef.current = new Chess(drill.fen);
          setFen(gameRef.current.fen());
          setStatus(drill.desc);
          setStatusType('info');
        }, 1500);
      }
      return true;
    } catch { return false; }
  }, [completed, drill, t]);

  const getMoveOptions = useCallback((square) => {
    const moves = gameRef.current.moves({ square, verbose: true });
    if (!moves.length) { setOptionSquares({}); return false; }
    const sq = {};
    moves.forEach(m => {
      sq[m.to] = {
        background: gameRef.current.get(m.to)
          ? 'radial-gradient(circle, rgba(248,113,113,.6) 65%, transparent 65%)'
          : 'radial-gradient(circle, rgba(79,140,255,.5) 26%, transparent 26%)',
        borderRadius: '50%',
      };
    });
    sq[square] = { backgroundColor: 'rgba(201,162,39,0.5)' };
    setOptionSquares(sq);
    return true;
  }, []);

  const onSquareClick = useCallback(({ square } = {}) => {
    if (!square || completed || !drill) return;
    const turn = gameRef.current.turn();
    if (moveFrom) {
      const ok = tryMove(moveFrom, square);
      if (!ok) {
        const p = gameRef.current.get(square);
        if (p && p.color === turn) {
          if (getMoveOptions(square)) setMoveFrom(square);
          else { setMoveFrom(null); setOptionSquares({}); }
        } else { setMoveFrom(null); setOptionSquares({}); }
      }
      return;
    }
    const p = gameRef.current.get(square);
    if (p && p.color === turn) {
      if (getMoveOptions(square)) setMoveFrom(square);
    }
  }, [completed, drill, moveFrom, tryMove, getMoveOptions]);

  const catDrills = category ? DRILLS[category] : [];

  // FIX REQUEST 1 & 2: Pass customPieces & theme darkSquareStyle / lightSquareStyle directly into Chessboard options
  const chessboardOptions = useMemo(() => ({
    id: 'practice-board',
    position: fen,
    onPieceDrop: ({ sourceSquare, targetSquare } = {}) => sourceSquare && targetSquare ? tryMove(sourceSquare, targetSquare) : false,
    onSquareClick: onSquareClick,
    animationDurationInMs: 200,
    boardStyle: { borderRadius: '10px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' },
    squareStyles: optionSquares,
    darkSquareStyle: theme.darkSquareStyle || { backgroundColor: theme.darkSquare },
    lightSquareStyle: theme.lightSquareStyle || { backgroundColor: theme.lightSquare },
    canDragPiece: () => !completed,
    boardOrientation: drill?.fen.includes(' b ') ? 'black' : 'white',
    showNotation: true,
  }), [fen, tryMove, onSquareClick, optionSquares, theme, completed, drill]);

  if (!category) {
    return (
      <div className="fade-in" style={{ maxWidth: '860px', margin: '2rem auto' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: 'clamp(2rem, 4vw, 3rem) 2rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem', animation: 'float 3s ease-in-out infinite' }}>⚔️</div>
          <h1>{t('practice_title')}</h1>
          <p style={{ marginTop: '0.5rem' }}>{t('practice_subtitle')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {CATEGORIES.map(({ key, icon, color }) => (
            <div key={key} className="arena-card" onClick={() => startDrill(key, 0)}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
              <h3 style={{ color, marginBottom: '0.5rem' }}>{t(key)}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{DRILLS[key].length} drills</p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {DRILLS[key].map((d, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-muted)' }}>{d.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statusStyle = { info: { borderColor: 'var(--accent)', color: 'var(--accent)' }, success: { borderColor: 'var(--success)', color: 'var(--success)' }, error: { borderColor: 'var(--danger)', color: 'var(--danger)' } }[statusType];

  return (
    <div className="fade-in" style={{ maxWidth: '620px', margin: '2rem auto' }}>
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setCategory(null)}>← Back</button>
          <h3 style={{ margin: 0 }}>{drill.name}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{drillIdx + 1}/{catDrills.length}</span>
        </div>

        <div className="progress-bar-track" style={{ marginBottom: '1rem' }}>
          <div className="progress-bar-fill" style={{ width: `${((drillIdx + (completed ? 1 : 0)) / catDrills.length) * 100}%` }} />
        </div>

        <div className="status-bar" style={{ marginBottom: '1rem', ...statusStyle }}>{status}</div>

        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <Chessboard
            customPieces={customPieces}
            options={chessboardOptions}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowHint(!showHint)}>💡 {showHint ? t('hide_hint') : t('show_hint')}</button>
          <button className="btn btn-secondary btn-sm" onClick={() => startDrill(category, drillIdx)}>↺ {t('restart')}</button>
          {completed && drillIdx + 1 < catDrills.length && (
            <button className="btn btn-sm" onClick={() => startDrill(category, drillIdx + 1)}>Next Drill →</button>
          )}
        </div>

        {showHint && (
          <div className="slide-in" style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.2)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--accent)', textAlign: 'left', lineHeight: 1.5 }}>
            <strong>💡 Hint:</strong> {drill.hint}
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
          {catDrills.map((d, i) => (
            <button key={i} onClick={() => startDrill(category, i)} className={`btn btn-sm ${i === drillIdx ? '' : 'btn-secondary'}`} style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
              {d.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Practice;
