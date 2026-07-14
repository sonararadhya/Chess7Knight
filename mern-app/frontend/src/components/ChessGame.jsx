import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChessGame = ({ user }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('1200');

  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(t('your_turn'));
  const [isThinking, setIsThinking] = useState(false);
  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState(null);
  const [boardWidth, setBoardWidth] = useState(480);

  // Responsive board sizing
  useEffect(() => {
    const updateSize = () => {
      const w = Math.min(580, window.innerWidth - 40);
      setBoardWidth(w);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/matches/history`, { headers: { 'x-auth-token': token } });
      setHistory(res.data);
    } catch (err) { console.error('Error fetching history', err); }
  };

  const saveMatch = async (result) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(`${API_URL}/matches/save`, {
        pgn: gameRef.current.pgn(), result,
        accuracy: Math.floor(Math.random() * 20) + 80,
        difficulty: parseInt(difficulty)
      }, { headers: { 'x-auth-token': token } });
      fetchHistory();
    } catch (err) { console.error('Error saving match', err); }
  };

  const checkGameOver = useCallback((g) => {
    if (g.isCheckmate()) {
      const winner = g.turn() === 'w' ? 'Black' : 'White';
      setStatus(`♚ ${t('checkmate')}! ${winner} wins!`);
      saveMatch(g.turn() === 'w' ? '0-1' : '1-0');
      return true;
    }
    if (g.isDraw()) {
      setStatus(`½ ${t('draw')}!`);
      saveMatch('1/2-1/2');
      return true;
    }
    if (g.inCheck()) {
      setStatus(`⚠️ ${t('check')}!`);
      return false;
    }
    return false;
  }, [difficulty, t]);

  const makeAMove = useCallback((move) => {
    try {
      const result = gameRef.current.move(move);
      if (!result) return null;
      setFen(gameRef.current.fen());
      setMoveSquares({
        [result.from]: { backgroundColor: 'rgba(201, 162, 39, 0.4)' },
        [result.to]: { backgroundColor: 'rgba(201, 162, 39, 0.4)' },
      });
      setOptionSquares({});
      setMoveFrom(null);
      return result;
    } catch { return null; }
  }, []);

  const fallbackRandomMove = useCallback(() => {
    const moves = gameRef.current.moves({ verbose: true });
    if (moves.length > 0) {
      const rnd = moves[Math.floor(Math.random() * moves.length)];
      makeAMove({ from: rnd.from, to: rnd.to, promotion: 'q' });
    }
  }, [makeAMove]);

  const makeBotMove = useCallback(async () => {
    if (gameRef.current.isGameOver()) return;
    setIsThinking(true);
    setStatus(`🤖 ${t('thinking')}`);
    try {
      const depth = difficulty === '2000' ? 12 : difficulty === '1200' ? 5 : 1;
      const encodedFen = encodeURIComponent(gameRef.current.fen());
      const res = await axios.get(`https://stockfish.online/api/s/v2.php?fen=${encodedFen}&depth=${depth}`);
      const bestmoveStr = res.data?.bestmove ?? '';
      if (bestmoveStr.includes('bestmove')) {
        const movePart = bestmoveStr.split(' ')[1];
        if (movePart && movePart !== '(none)') {
          const from = movePart.substring(0, 2);
          const to = movePart.substring(2, 4);
          const promotion = movePart.length === 5 ? movePart[4] : undefined;
          makeAMove({ from, to, promotion });
        } else { fallbackRandomMove(); }
      } else { fallbackRandomMove(); }
    } catch (err) {
      console.error('Stockfish API error:', err);
      fallbackRandomMove();
    } finally {
      setIsThinking(false);
      const over = checkGameOver(gameRef.current);
      if (!over) setStatus(t('your_turn'));
    }
  }, [difficulty, makeAMove, checkGameOver, fallbackRandomMove, t]);

  const getMoveOptions = (square) => {
    const moves = gameRef.current.moves({ square, verbose: true });
    if (moves.length === 0) { setOptionSquares({}); return false; }
    const newSquares = {};
    moves.forEach((move) => {
      const isCapture = gameRef.current.get(move.to) && gameRef.current.get(move.to).color !== gameRef.current.get(square)?.color;
      newSquares[move.to] = {
        background: isCapture
          ? 'radial-gradient(circle, rgba(248,113,113,.6) 65%, transparent 65%)'
          : 'radial-gradient(circle, rgba(79,140,255,.5) 26%, transparent 26%)',
        borderRadius: '50%',
      };
    });
    newSquares[square] = { backgroundColor: 'rgba(201, 162, 39, 0.5)' };
    setOptionSquares(newSquares);
    return true;
  };

  // Click-to-move: select piece, show legal moves, click destination
  const onSquareClick = (square) => {
    if (isThinking) return;
    if (gameRef.current.turn() !== 'w') return;
    if (gameRef.current.isGameOver()) return;

    if (moveFrom) {
      const result = makeAMove({ from: moveFrom, to: square, promotion: 'q' });
      if (result === null) {
        const piece = gameRef.current.get(square);
        if (piece && piece.color === 'w') {
          const hasMoves = getMoveOptions(square);
          if (hasMoves) setMoveFrom(square);
          else { setMoveFrom(null); setOptionSquares({}); }
        } else { setMoveFrom(null); setOptionSquares({}); }
        return;
      }
      const over = checkGameOver(gameRef.current);
      if (!over) setTimeout(makeBotMove, 350);
      return;
    }

    const piece = gameRef.current.get(square);
    if (piece && piece.color === 'w') {
      const hasMoves = getMoveOptions(square);
      if (hasMoves) setMoveFrom(square);
    } else { setOptionSquares({}); }
  };

  // Drag-and-drop
  const onDrop = (sourceSquare, targetSquare) => {
    if (isThinking) return false;
    if (gameRef.current.turn() !== 'w') return false;
    if (gameRef.current.isGameOver()) return false;
    const result = makeAMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    if (result === null) return false;
    const over = checkGameOver(gameRef.current);
    if (!over) setTimeout(makeBotMove, 350);
    return true;
  };

  const resetGame = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setStatus(t('your_turn'));
    setMoveSquares({});
    setOptionSquares({});
    setMoveFrom(null);
    setIsThinking(false);
  };

  const startGame = (d) => { setDifficulty(d); resetGame(); setGameState('playing'); };

  const handleUndo = () => {
    if (isThinking) return;
    gameRef.current.undo();
    gameRef.current.undo();
    setFen(gameRef.current.fen());
    setMoveSquares({});
    setOptionSquares({});
    setStatus(t('your_turn'));
  };

  // ── MENU ──
  if (gameState === 'menu') {
    const levels = [
      { elo: '400', label: t('beginner'), emoji: '🟢', color: 'var(--success)' },
      { elo: '1200', label: t('intermediate'), emoji: '🟡', color: 'var(--warning)' },
      { elo: '2000', label: t('advanced'), emoji: '🔴', color: 'var(--danger)' },
    ];
    return (
      <div className="fade-in" style={{ maxWidth: '560px', margin: '3rem auto' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: 'clamp(2rem, 4vw, 3.5rem) 2rem' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '1rem', lineHeight: 1, animation: 'float 3s ease-in-out infinite' }}>♞</div>
          <h1 style={{ marginBottom: '0.5rem' }}>{t('vs_stockfish')}</h1>
          <p style={{ marginBottom: '2.5rem', fontSize: '1rem' }}>
            {user ? `${t('welcome')}, ${user.email.split('@')[0]}! ${t('choose_challenge')}` : t('choose_challenge')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '320px', margin: '0 auto' }}>
            {levels.map(({ elo, label, emoji, color }) => (
              <button
                key={elo} className="btn btn-secondary" onClick={() => startGame(elo)}
                style={{ padding: '14px 20px', fontSize: '1.05rem', justifyContent: 'space-between', borderColor: `${color}40` }}
              >
                <span>{emoji} {label}</span>
                <span style={{ opacity: 0.5, fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>ELO {elo}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  const moveHistory = gameRef.current.history();
  const pairedMoves = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairedMoves.push({ white: moveHistory[i], black: moveHistory[i + 1] || '' });
  }

  const statusClass = isThinking ? 'status-bar thinking'
    : gameRef.current.inCheck() ? 'status-bar check'
    : gameRef.current.isGameOver() ? 'status-bar success'
    : 'status-bar';

  return (
    <div className="game-container fade-in">
      <div>
        {/* Bot info */}
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(15,21,37,0.8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, border: '1px solid var(--border)' }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Stockfish Engine</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>ELO {difficulty}</div>
          </div>
          {isThinking && <div className="spinner" />}
        </div>

        {/* Board */}
        <div className="board-wrapper">
          <Chessboard
            id="game-board"
            position={fen}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            animationDuration={200}
            boardWidth={boardWidth}
            customSquareStyles={{ ...moveSquares, ...optionSquares }}
            customBoardStyle={{ borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
            customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
            customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
            arePiecesDraggable={!isThinking && !gameRef.current.isGameOver()}
            showBoardNotation={true}
          />
        </div>

        {/* Player info */}
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user ? user.email.split('@')[0] : 'Guest'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{user ? `ELO ${user.rating}` : 'Unrated'}</div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="controls-panel">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 100px)' }}>
          <div className={statusClass} style={{ marginBottom: '1rem' }}>{status}</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('move_history')}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pairedMoves.length}</span>
          </div>

          <div className="move-history" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
            {pairedMoves.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>{t('drag_or_click')}</p>
            ) : (
              <table><tbody>
                {pairedMoves.map((pair, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '6px', color: 'var(--text-muted)', width: '28px', fontSize: '0.8rem' }}>{idx + 1}.</td>
                    <td style={{ padding: '6px', fontWeight: '500', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{pair.white}</td>
                    <td style={{ padding: '6px', fontWeight: '500', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pair.black}</td>
                  </tr>
                ))}
              </tbody></table>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '9px' }} onClick={handleUndo} disabled={isThinking || moveHistory.length < 2}>↩ {t('undo')}</button>
            <button className="btn btn-gold" style={{ flex: 1, padding: '9px' }} onClick={() => setGameState('menu')}>⊕ {t('new_game')}</button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>{t('recent_matches')}</div>
            {history.slice(0, 4).map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>vs ELO {m.difficulty}</span>
                <span className={`badge ${m.result === '1-0' ? 'badge-win' : m.result === '0-1' ? 'badge-loss' : 'badge-draw'}`}>
                  {m.result === '1-0' ? '✓ Win' : m.result === '0-1' ? '✗ Loss' : '= Draw'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessGame;
