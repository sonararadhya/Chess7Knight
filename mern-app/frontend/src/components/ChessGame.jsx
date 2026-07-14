import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ELO_LEVELS = Array.from({ length: 28 }, (_, i) => (i + 1) * 100);

const TIME_CONTROLS = [
  { label: 'Bullet 1m', value: 60, group: 'Bullet' },
  { label: 'Bullet 2m', value: 120, group: 'Bullet' },
  { label: 'Bullet 3m', value: 180, group: 'Bullet' },
  { label: 'Blitz 4m', value: 240, group: 'Blitz' },
  { label: 'Blitz 5m', value: 300, group: 'Blitz' },
  { label: 'Blitz 6m', value: 360, group: 'Blitz' },
  { label: 'Rapid 10m', value: 600, group: 'Rapid' },
  { label: 'Rapid 15m', value: 900, group: 'Rapid' },
  { label: 'Rapid 20m', value: 1200, group: 'Rapid' },
  { label: 'Long 30m', value: 1800, group: 'Long' },
  { label: 'Long 60m', value: 3600, group: 'Long' },
  { label: 'No Limit', value: 0, group: 'Long' },
];

const ChessGame = ({ user }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Settings & Menu States
  const [gameState, setGameState] = useState('menu');
  const [selectedElo, setSelectedElo] = useState(1200);
  const [selectedTime, setSelectedTime] = useState(TIME_CONTROLS[4]); // Default 5 min Blitz

  // Chess Engine States
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [status, setStatus] = useState(t('your_turn'));
  const [isThinking, setIsThinking] = useState(false);
  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState(null);
  const [boardWidth, setBoardWidth] = useState(480);

  // Timer States
  const [playerTime, setPlayerTime] = useState(0);
  const [botTime, setBotTime] = useState(0);
  const timerRef = useRef(null);

  // Analysis / Game Over States
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  // ── 1. STATE PERSISTENCE (Restore Game Memory) ──
  useEffect(() => {
    const savedState = localStorage.getItem('chess7k_active_game_state');
    if (savedState === 'playing') {
      const savedFen = localStorage.getItem('chess7k_active_game_fen');
      const savedPgn = localStorage.getItem('chess7k_active_game_pgn');
      const savedEloVal = localStorage.getItem('chess7k_active_game_elo');
      const savedTimeVal = localStorage.getItem('chess7k_active_game_time_limit');
      const savedPlayerSec = localStorage.getItem('chess7k_active_game_player_time');
      const savedBotSec = localStorage.getItem('chess7k_active_game_bot_time');
      const savedStatusText = localStorage.getItem('chess7k_active_game_status');

      if (savedFen) {
        try {
          const game = new Chess();
          if (savedPgn) {
            game.loadPgn(savedPgn);
          } else {
            game.load(savedFen);
          }
          gameRef.current = game;
          setFen(game.fen());
        } catch (e) {
          console.error('Error reloading game state', e);
          gameRef.current = new Chess();
          setFen(gameRef.current.fen());
        }
      }

      if (savedEloVal) setSelectedElo(parseInt(savedEloVal));
      if (savedTimeVal) {
        try {
          setSelectedTime(JSON.parse(savedTimeVal));
        } catch {}
      }
      if (savedPlayerSec) setPlayerTime(parseInt(savedPlayerSec));
      if (savedBotSec) setBotTime(parseInt(savedBotSec));
      if (savedStatusText) setStatus(savedStatusText);

      setGameState('playing');
    }
  }, []);

  // Save changes to localStorage on state updates
  const saveStateToStorage = useCallback((customStatus) => {
    if (gameState !== 'playing') return;
    localStorage.setItem('chess7k_active_game_state', 'playing');
    localStorage.setItem('chess7k_active_game_fen', gameRef.current.fen());
    localStorage.setItem('chess7k_active_game_pgn', gameRef.current.pgn());
    localStorage.setItem('chess7k_active_game_elo', String(selectedElo));
    localStorage.setItem('chess7k_active_game_time_limit', JSON.stringify(selectedTime));
    localStorage.setItem('chess7k_active_game_player_time', String(playerTime));
    localStorage.setItem('chess7k_active_game_bot_time', String(botTime));
    localStorage.setItem('chess7k_active_game_status', customStatus || status);
  }, [gameState, selectedElo, selectedTime, playerTime, botTime, status]);

  const clearStorageGame = () => {
    localStorage.removeItem('chess7k_active_game_state');
    localStorage.removeItem('chess7k_active_game_fen');
    localStorage.removeItem('chess7k_active_game_pgn');
    localStorage.removeItem('chess7k_active_game_elo');
    localStorage.removeItem('chess7k_active_game_time_limit');
    localStorage.removeItem('chess7k_active_game_player_time');
    localStorage.removeItem('chess7k_active_game_bot_time');
    localStorage.removeItem('chess7k_active_game_status');
  };

  // Sync state to local storage when changes happen
  useEffect(() => {
    if (gameState === 'playing') {
      saveStateToStorage();
    }
  }, [fen, playerTime, botTime, gameState, saveStateToStorage]);

  // Responsive board size listener
  useEffect(() => {
    const updateSize = () => {
      setBoardWidth(Math.min(540, window.innerWidth - 40));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Timer Tick Interval
  useEffect(() => {
    if (gameState !== 'playing' || selectedTime.value === 0 || isThinking) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const turn = gameRef.current.turn();
      if (turn === 'w') {
        setPlayerTime((prev) => {
          if (prev <= 1) {
            handleTimeout('0-1');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBotTime((prev) => {
          if (prev <= 1) {
            handleTimeout('1-0');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, selectedTime, isThinking]);

  const handleTimeout = (result) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const winner = result === '1-0' ? 'White' : 'Black';
    const statusText = `⏱️ Timeout! ${winner} wins!`;
    setStatus(statusText);
    clearStorageGame();
    saveMatch(result);
  };

  const formatTime = (seconds) => {
    if (seconds === 0 && selectedTime.value === 0) return '∞';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const saveMatch = async (result) => {
    const token = localStorage.getItem('token');
    const accuracyValue = Math.floor(Math.random() * 20) + 75; // 75-95%
    
    const postBody = {
      pgn: gameRef.current.pgn(),
      result,
      accuracy: accuracyValue,
      difficulty: selectedElo,
      timeControl: selectedTime.label
    };

    clearStorageGame();

    if (token) {
      try {
        const res = await axios.post(`${API_URL}/matches/save`, postBody, {
          headers: { 'x-auth-token': token }
        });
        setAnalysisData(res.data.match);
        setShowAnalysis(true);
      } catch (err) {
        console.error('Error saving match', err);
      }
    } else {
      // Simulate analysis response for guest players
      const movesCount = gameRef.current.history().length;
      const simulatedMatch = {
        result,
        accuracy: accuracyValue,
        difficulty: selectedElo,
        timeControl: selectedTime.label,
        performanceRating: Math.floor(selectedElo * (accuracyValue / 100)) + (result === '1-0' ? 150 : -150),
        openingName: 'Italian Game',
        phasePerformance: { opening: 90, middlegame: 80, endgame: movesCount > 20 ? 85 : 0 },
        analysis: {
          brilliant: Math.random() > 0.8 ? 1 : 0,
          great: Math.floor(Math.random() * 2),
          best: Math.floor(movesCount * 0.4),
          excellent: Math.floor(movesCount * 0.2),
          good: Math.floor(movesCount * 0.1),
          book: 4,
          inaccuracy: Math.floor(movesCount * 0.1),
          mistake: Math.floor(movesCount * 0.05),
          miss: Math.random() > 0.8 ? 1 : 0,
          blunder: result === '0-1' ? 1 : 0
        }
      };
      setAnalysisData(simulatedMatch);
      setShowAnalysis(true);
    }
  };

  const checkGameOver = useCallback((g) => {
    if (g.isGameOver()) {
      if (timerRef.current) clearInterval(timerRef.current);
      clearStorageGame();
      if (g.isCheckmate()) {
        const winner = g.turn() === 'w' ? 'Black' : 'White';
        setStatus(`♚ ${t('checkmate')}! ${winner} wins!`);
        saveMatch(g.turn() === 'w' ? '0-1' : '1-0');
      } else if (g.isDraw()) {
        setStatus(`½ ${t('draw')}!`);
        saveMatch('1/2-1/2');
      }
      return true;
    }
    if (g.inCheck()) {
      setStatus(`⚠️ ${t('check')}!`);
    } else {
      setStatus(t('your_turn'));
    }
    return false;
  }, [selectedElo, selectedTime, t]);

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

  const makeBotMove = useCallback(async () => {
    if (gameRef.current.isGameOver()) return;
    setIsThinking(true);
    const thinkingStatus = `🤖 ${t('thinking')}`;
    setStatus(thinkingStatus);
    saveStateToStorage(thinkingStatus);

    try {
      const depth = Math.max(1, Math.min(18, Math.round(selectedElo / 150)));
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
        } else {
          fallbackRandomMove();
        }
      } else {
        fallbackRandomMove();
      }
    } catch (err) {
      console.error('Bot engine error:', err);
      fallbackRandomMove();
    } finally {
      setIsThinking(false);
      checkGameOver(gameRef.current);
    }
  }, [selectedElo, makeAMove, checkGameOver, t, saveStateToStorage]);

  const fallbackRandomMove = () => {
    const moves = gameRef.current.moves({ verbose: true });
    if (moves.length > 0) {
      const rnd = moves[Math.floor(Math.random() * moves.length)];
      makeAMove({ from: rnd.from, to: rnd.to, promotion: 'q' });
    }
  };

  // ── 2. FOCUS GLOW & TAP-TO-MOVE VALIDATION ──
  const getMoveOptions = (square) => {
    const moves = gameRef.current.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }
    
    const newSquares = {};
    
    // Selected piece gets high intensity yellow glow focus outline
    newSquares[square] = {
      boxShadow: '0 0 0 5px var(--gold), 0 0 20px var(--gold)',
      backgroundColor: 'rgba(201, 162, 39, 0.25)',
      borderRadius: '8px',
      zIndex: 10
    };

    moves.forEach((move) => {
      const isCapture = gameRef.current.get(move.to) && gameRef.current.get(move.to).color !== gameRef.current.get(square)?.color;
      
      // Target squares get an attractive blue glow focus outline (or red for capture)
      newSquares[move.to] = {
        boxShadow: isCapture 
          ? '0 0 0 5px var(--danger), 0 0 20px var(--danger)'
          : '0 0 0 5px var(--accent), 0 0 20px var(--accent)',
        backgroundColor: isCapture
          ? 'rgba(248, 113, 113, 0.2)'
          : 'rgba(79, 140, 255, 0.15)',
        borderRadius: isCapture ? '8px' : '50%',
        cursor: 'pointer',
        zIndex: 10
      };
    });

    setOptionSquares(newSquares);
    return true;
  };

  const onSquareClick = (square) => {
    if (isThinking || gameRef.current.isGameOver() || gameState !== 'playing') return;
    if (gameRef.current.turn() !== 'w') return;

    // Check if target is a valid highlighted option square
    if (moveFrom && optionSquares[square] && square !== moveFrom) {
      const result = makeAMove({ from: moveFrom, to: square, promotion: 'q' });
      if (result !== null) {
        const over = checkGameOver(gameRef.current);
        if (!over) {
          setTimeout(makeBotMove, 400);
        }
        return;
      }
    }

    // Otherwise, handle selection / re-selection of White's pieces
    const piece = gameRef.current.get(square);
    if (piece && piece.color === 'w') {
      const hasMoves = getMoveOptions(square);
      if (hasMoves) {
        setMoveFrom(square);
      } else {
        setMoveFrom(null);
        setOptionSquares({});
      }
    } else {
      // Clear selection if clicking empty square or opponent's piece
      setMoveFrom(null);
      setOptionSquares({});
    }
  };

  const resetGame = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setMoveSquares({});
    setOptionSquares({});
    setMoveFrom(null);
    setIsThinking(false);
    setShowAnalysis(false);
    setAnalysisData(null);
    
    // Set Timers
    setPlayerTime(selectedTime.value);
    setBotTime(selectedTime.value);
    
    setStatus(t('your_turn'));
    setGameState('playing');

    // Save playing state to storage
    localStorage.setItem('chess7k_active_game_state', 'playing');
    localStorage.setItem('chess7k_active_game_fen', gameRef.current.fen());
    localStorage.setItem('chess7k_active_game_pgn', gameRef.current.pgn());
    localStorage.setItem('chess7k_active_game_elo', String(selectedElo));
    localStorage.setItem('chess7k_active_game_time_limit', JSON.stringify(selectedTime));
    localStorage.setItem('chess7k_active_game_player_time', String(selectedTime.value));
    localStorage.setItem('chess7k_active_game_bot_time', String(selectedTime.value));
    localStorage.setItem('chess7k_active_game_status', t('your_turn'));
  };

  const handleResign = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('🏳️ You resigned. Bot wins.');
    clearStorageGame();
    saveMatch('0-1');
  };

  // ── MENU VIEW ──
  if (gameState === 'menu') {
    return (
      <div className="fade-in" style={{ maxWidth: '640px', margin: '2rem auto' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem', animation: 'float 3s ease-in-out infinite' }}>♞</div>
            <h1>{t('vs_stockfish')}</h1>
            <p>Challenge the smart chess bot with adjustable difficulties</p>
          </div>

          {/* ELO Levels scrollable selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: '600' }}>
              Select Opponent ELO ({selectedElo})
            </label>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 2px', scrollbarWidth: 'thin' }}>
              {ELO_LEVELS.map((elo) => {
                const isSelected = selectedElo === elo;
                return (
                  <button
                    key={elo}
                    onClick={() => setSelectedElo(elo)}
                    className={`btn btn-sm ${isSelected ? '' : 'btn-secondary'}`}
                    style={{ flexShrink: 0, padding: '8px 14px', border: isSelected ? '1px solid var(--gold)' : undefined }}
                  >
                    {elo}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Controls selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: '600' }}>
              Time Control
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {TIME_CONTROLS.map((tc) => {
                const isSelected = selectedTime.label === tc.label;
                return (
                  <button
                    key={tc.label}
                    onClick={() => setSelectedTime(tc)}
                    className={`btn btn-sm ${isSelected ? '' : 'btn-secondary'}`}
                    style={{ padding: '8px', border: isSelected ? '1px solid var(--gold)' : undefined }}
                  >
                    {tc.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="btn btn-gold btn-lg" style={{ width: '100%' }} onClick={resetGame}>
            ⚔️ Play Match
          </button>
        </div>
      </div>
    );
  }

  // ── GAME PLAYING VIEW ──
  const moveHistory = gameRef.current.history();
  const pairedMoves = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairedMoves.push({ white: moveHistory[i], black: moveHistory[i + 1] || '' });
  }

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
    <div className="game-container fade-in">
      <div>
        {/* Bot Panel */}
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(15,21,37,0.8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid var(--border)' }}>🤖</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Bot ELO {selectedElo}</div>
            </div>
            {isThinking && <div className="spinner" />}
          </div>
          
          {/* Bot Timer */}
          {selectedTime.value > 0 && (
            <div style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ⏱️ {formatTime(botTime)}
            </div>
          )}
        </div>

        {/* Board wrapper (pure click/tap-to-move only, draggable=false) */}
        <div className="board-wrapper">
          <Chessboard
            id="game-board"
            position={fen}
            onSquareClick={onSquareClick}
            animationDuration={220}
            boardWidth={boardWidth}
            customSquareStyles={{ ...moveSquares, ...optionSquares }}
            customBoardStyle={{ borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
            customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
            customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
            arePiecesDraggable={false}
            showBoardNotation={true}
          />
        </div>

        {/* Player Panel */}
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user ? user.email.split('@')[0] : 'Guest'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>ELO {user ? user.rating : 0}</div>
            </div>
          </div>
          
          {/* Player Timer */}
          {selectedTime.value > 0 && (
            <div style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-mono)', background: 'rgba(79,140,255,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--accent)' }}>
              ⏱️ {formatTime(playerTime)}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="controls-panel">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
          <div className={`status-bar ${isThinking ? 'thinking' : ''}`} style={{ marginBottom: '1rem' }}>{status}</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('move_history')}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pairedMoves.length} moves</span>
          </div>

          <div className="move-history" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
            {pairedMoves.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>Tap a piece to select, then tap your target square to move.</p>
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
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleResign} disabled={isThinking || gameRef.current.isGameOver()}>🏳️ Resign</button>
            <button className="btn btn-gold" style={{ flex: 1 }} onClick={() => { clearStorageGame(); setGameState('menu'); }}>⊕ Quit</button>
          </div>
        </div>
      </div>

      {/* GAME ANALYSIS MODAL OVERLAY */}
      {showAnalysis && analysisData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
          <div className="glass-panel fade-in" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(201, 162, 39, 0.3)', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
              <h2 style={{ marginBottom: '4px' }}>Game Analysis</h2>
              <span className={`badge ${analysisData.result === '1-0' ? 'badge-win' : analysisData.result === '0-1' ? 'badge-loss' : 'badge-draw'}`} style={{ fontSize: '0.9rem', padding: '4px 14px' }}>
                {analysisData.result === '1-0' ? '✓ Victory' : analysisData.result === '0-1' ? '✗ Defeat' : '= Draw'}
              </span>
            </div>

            {/* Performance metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--gold)' }}>{analysisData.accuracy}%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--accent)' }}>{analysisData.performanceRating}</div>
                <div className="stat-label">Performance ELO</div>
              </div>
            </div>

            {/* Opening info */}
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Opening Played:</span>
              <strong style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>{analysisData.openingName || 'Unknown Opening'}</strong>
            </div>

            {/* Move Classifications grid */}
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Move Classifications</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '1.5rem' }}>
              {moveCategories.map(({ key, label, emoji, color }) => {
                const val = analysisData.analysis?.[key] || 0;
                return (
                  <div key={key} style={{ padding: '8px 4px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem' }} title={label}>{emoji}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color, fontFamily: 'var(--font-mono)' }}>{val}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                  </div>
                );
              })}
            </div>

            {/* Phase accuracy progress bars */}
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Phase Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
              {['opening', 'middlegame', 'endgame'].map((phase) => {
                const val = analysisData.phasePerformance?.[phase] || 0;
                if (phase === 'endgame' && val === 0) return null;
                return (
                  <div key={phase} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{phase}:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
                      <div className="progress-bar-track" style={{ flex: 1, height: '6px' }}>
                        <div className="progress-bar-fill" style={{ width: `${val}%` }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{val}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close button */}
            <button className="btn btn-gold" style={{ width: '100%', padding: '12px' }} onClick={() => { setShowAnalysis(false); setGameState('menu'); }}>
              Done & Return to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;
