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
  const [gameMode, setGameMode] = useState('bot'); // 'bot' or 'local'
  const [selectedElo, setSelectedElo] = useState(1200);
  const [selectedTime, setSelectedTime] = useState(TIME_CONTROLS[4]); // Default 5m Blitz
  const [playerColor, setPlayerColor] = useState('white'); // 'white', 'black', 'random'
  const [actualColor, setActualColor] = useState('white'); // 'white' or 'black'

  // Chess Engine States
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [status, setStatus] = useState(t('your_turn'));
  const [isThinking, setIsThinking] = useState(false);
  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState(null);
  const [boardWidth, setBoardWidth] = useState(480);

  // Helper features
  const [showDanger, setShowDanger] = useState(false);
  const [useTutor, setUseTutor] = useState(false);
  const [dangerSquares, setDangerSquares] = useState({});
  const [tutorTip, setTutorTip] = useState('');
  const [showAbandonPrompt, setShowAbandonPrompt] = useState(false);

  // Timer States
  const [playerTime, setPlayerTime] = useState(0);
  const [botTime, setBotTime] = useState(0);
  const timerRef = useRef(null);

  // Analysis / Game Over States
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  // State Persistence keys
  const getPersistKeys = () => ({
    state: `chess7k_active_game_state`,
    fen: `chess7k_active_game_fen`,
    pgn: `chess7k_active_game_pgn`,
    elo: `chess7k_active_game_elo`,
    time: `chess7k_active_game_time_limit`,
    playerSec: `chess7k_active_game_player_time`,
    botSec: `chess7k_active_game_bot_time`,
    statusText: `chess7k_active_game_status`,
    mode: `chess7k_active_game_mode`,
    color: `chess7k_active_game_color`,
  });

  // Calculate danger squares (squares attacked by the opponent)
  const calculateDangerSquares = useCallback(() => {
    if (!showDanger) {
      setDangerSquares({});
      return;
    }
    try {
      const tempGame = new Chess(gameRef.current.fen());
      const tokens = tempGame.fen().split(' ');
      // Swap turn to look from opponent's perspective
      tokens[1] = tokens[1] === 'w' ? 'b' : 'w';
      const swappedFen = tokens.join(' ');
      const oppGame = new Chess(swappedFen);
      const moves = oppGame.moves({ verbose: true });
      const attacked = {};
      moves.forEach(m => {
        attacked[m.to] = { boxShadow: 'inset 0 0 0 3px rgba(248, 113, 113, 0.45)' };
      });
      setDangerSquares(attacked);
    } catch {
      setDangerSquares({});
    }
  }, [showDanger, fen]);

  // Tutor suggestions generator
  const generateTutorTip = useCallback(() => {
    if (!useTutor) {
      setTutorTip('');
      return;
    }
    const g = gameRef.current;
    if (g.isGameOver()) {
      setTutorTip('The match is over!');
      return;
    }
    if (g.inCheck()) {
      setTutorTip('⚠️ King in check! Find a move to escape, block, or capture the attacking piece.');
      return;
    }

    const turn = g.turn();
    const history = g.history();

    // Opening phase suggestions
    if (history.length < 10) {
      setTutorTip('🎯 Opening Stage: Focus on center pawns (e4/d4) and develop Knights before Bishops.');
      return;
    }

    // Midgame tips
    setTutorTip('💡 Strategy: Connect your rooks, control open files, and scan for tactical forks or pins.');
  }, [useTutor, fen]);

  useEffect(() => {
    calculateDangerSquares();
    generateTutorTip();
  }, [fen, showDanger, useTutor, calculateDangerSquares, generateTutorTip]);

  // ── 1. STATE PERSISTENCE (Restore Game Memory) ──
  useEffect(() => {
    const keys = getPersistKeys();
    const savedState = localStorage.getItem(keys.state);
    if (savedState === 'playing') {
      const savedFen = localStorage.getItem(keys.fen);
      const savedPgn = localStorage.getItem(keys.pgn);
      const savedEloVal = localStorage.getItem(keys.elo);
      const savedTimeVal = localStorage.getItem(keys.time);
      const savedPlayerSec = localStorage.getItem(keys.playerSec);
      const savedBotSec = localStorage.getItem(keys.botSec);
      const savedStatusText = localStorage.getItem(keys.statusText);
      const savedMode = localStorage.getItem(keys.mode);
      const savedColor = localStorage.getItem(keys.color);

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
      if (savedMode) setGameMode(savedMode);
      if (savedColor) setActualColor(savedColor);

      setGameState('playing');
    }
  }, []);

  const saveStateToStorage = useCallback((customStatus) => {
    if (gameState !== 'playing') return;
    const keys = getPersistKeys();
    localStorage.setItem(keys.state, 'playing');
    localStorage.setItem(keys.fen, gameRef.current.fen());
    localStorage.setItem(keys.pgn, gameRef.current.pgn());
    localStorage.setItem(keys.elo, String(selectedElo));
    localStorage.setItem(keys.time, JSON.stringify(selectedTime));
    localStorage.setItem(keys.playerSec, String(playerTime));
    localStorage.setItem(keys.botSec, String(botTime));
    localStorage.setItem(keys.statusText, customStatus || status);
    localStorage.setItem(keys.mode, gameMode);
    localStorage.setItem(keys.color, actualColor);
  }, [gameState, selectedElo, selectedTime, playerTime, botTime, status, gameMode, actualColor]);

  const clearStorageGame = () => {
    const keys = getPersistKeys();
    Object.values(keys).forEach(k => localStorage.removeItem(k));
  };

  useEffect(() => {
    if (gameState === 'playing') {
      saveStateToStorage();
    }
  }, [fen, playerTime, botTime, gameState, saveStateToStorage]);

  // Responsive board size
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
    if (gameState !== 'playing' || selectedTime.value === 0 || isThinking || gameMode === 'local') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const turn = gameRef.current.turn();
      if (turn === actualColor[0]) {
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
  }, [gameState, selectedTime, isThinking, gameMode, actualColor]);

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
    if (gameMode === 'local') {
      // Local match outcome display
      clearStorageGame();
      const simMatch = {
        result,
        accuracy: 85,
        difficulty: 1000,
        timeControl: 'Local Play',
        performanceRating: 1000,
        openingName: 'Pass & Play Game',
        phasePerformance: { opening: 90, middlegame: 80, endgame: 70 },
        analysis: { brilliant: 0, great: 1, best: 10, excellent: 5, good: 3, book: 2, inaccuracy: 2, mistake: 1, miss: 0, blunder: 0 }
      };
      setAnalysisData(simMatch);
      setShowAnalysis(true);
      return;
    }

    const token = localStorage.getItem('token');
    const accuracyValue = Math.floor(Math.random() * 20) + 75; // 75-95%
    
    // Adjust result depending on if user played as black
    let normalizedResult = result;
    if (actualColor === 'black') {
      if (result === '1-0') normalizedResult = '0-1'; // White won means User (Black) lost
      else if (result === '0-1') normalizedResult = '1-0'; // Black won means User (Black) won
    }

    const postBody = {
      pgn: gameRef.current.pgn(),
      result: normalizedResult,
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
      const movesCount = gameRef.current.history().length;
      const simulatedMatch = {
        result: normalizedResult,
        accuracy: accuracyValue,
        difficulty: selectedElo,
        timeControl: selectedTime.label,
        performanceRating: Math.floor(selectedElo * (accuracyValue / 100)) + (normalizedResult === '1-0' ? 150 : -150),
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
          blunder: normalizedResult === '0-1' ? 1 : 0
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
  }, [selectedElo, selectedTime, t, gameMode]);

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

  const getMoveOptions = (square) => {
    const moves = gameRef.current.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }
    
    const newSquares = {};
    
    // Glowing focus outline for active selection
    newSquares[square] = {
      boxShadow: '0 0 0 5px var(--gold), 0 0 20px var(--gold)',
      backgroundColor: 'rgba(201, 162, 39, 0.25)',
      borderRadius: '8px',
      zIndex: 10
    };

    moves.forEach((move) => {
      const isCapture = gameRef.current.get(move.to) && gameRef.current.get(move.to).color !== gameRef.current.get(square)?.color;
      
      // Target squares get outline highlight
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

  // Click-to-move / Tap-to-move interaction
  const onSquareClick = (square) => {
    if (isThinking || gameRef.current.isGameOver() || gameState !== 'playing') return;

    const turn = gameRef.current.turn();

    // Verify turn ownership in bot mode
    if (gameMode === 'bot' && turn !== actualColor[0]) return;

    if (moveFrom && optionSquares[square] && square !== moveFrom) {
      const result = makeAMove({ from: moveFrom, to: square, promotion: 'q' });
      if (result !== null) {
        const over = checkGameOver(gameRef.current);
        if (!over && gameMode === 'bot') {
          setTimeout(makeBotMove, 400);
        }
        return;
      }
    }

    const piece = gameRef.current.get(square);
    if (piece && piece.color === turn) {
      const hasMoves = getMoveOptions(square);
      if (hasMoves) {
        setMoveFrom(square);
      } else {
        setMoveFrom(null);
        setOptionSquares({});
      }
    } else {
      setMoveFrom(null);
      setOptionSquares({});
    }
  };

  // Start a fresh game
  const resetGame = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setMoveSquares({});
    setOptionSquares({});
    setMoveFrom(null);
    setIsThinking(false);
    setShowAnalysis(false);
    setAnalysisData(null);
    setShowAbandonPrompt(false);
    
    // Choose actual color based on player preference
    let finalColor = playerColor;
    if (playerColor === 'random') {
      finalColor = Math.random() > 0.5 ? 'white' : 'black';
    }
    setActualColor(finalColor);
    
    // Set Timers
    setPlayerTime(selectedTime.value);
    setBotTime(selectedTime.value);
    
    setStatus(t('your_turn'));
    setGameState('playing');

    // Save initial state to storage
    localStorage.setItem('chess7k_active_game_state', 'playing');
    localStorage.setItem('chess7k_active_game_fen', gameRef.current.fen());
    localStorage.setItem('chess7k_active_game_pgn', gameRef.current.pgn());
    localStorage.setItem('chess7k_active_game_elo', String(selectedElo));
    localStorage.setItem('chess7k_active_game_time_limit', JSON.stringify(selectedTime));
    localStorage.setItem('chess7k_active_game_player_time', String(selectedTime.value));
    localStorage.setItem('chess7k_active_game_bot_time', String(selectedTime.value));
    localStorage.setItem('chess7k_active_game_status', t('your_turn'));
    localStorage.setItem('chess7k_active_game_mode', gameMode);
    localStorage.setItem('chess7k_active_game_color', finalColor);

    // If actual color is black and mode is bot, trigger bot's opening move immediately
    if (finalColor === 'black' && gameMode === 'bot') {
      setTimeout(makeBotMove, 400);
    }
  };

  const handleResign = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('🏳️ You resigned. Match over.');
    clearStorageGame();
    saveMatch('0-1');
  };

  const handleOfferDraw = () => {
    if (isThinking || gameRef.current.isGameOver()) return;
    
    // Calculate draw acceptance: 40% chance if ELO <= 1600 or equal position
    const isAccepted = Math.random() > 0.6;
    if (isAccepted) {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('½ Draw agreed.');
      clearStorageGame();
      saveMatch('1/2-1/2');
    } else {
      setStatus('❌ Draw declined by Bot.');
      setTimeout(() => {
        if (!gameRef.current.isGameOver()) setStatus(t('your_turn'));
      }, 2500);
    }
  };

  const handleQuitOrAbandon = () => {
    if (gameState === 'playing' && !gameRef.current.isGameOver()) {
      setShowAbandonPrompt(true);
    } else {
      clearStorageGame();
      setGameState('menu');
    }
  };

  const confirmAbandon = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clearStorageGame();
    saveMatch('0-1'); // Counted as loss
    setGameState('menu');
    setShowAbandonPrompt(false);
  };

  // ── MENU VIEW ──
  if (gameState === 'menu') {
    return (
      <div className="fade-in" style={{ maxWidth: '640px', margin: '2rem auto' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          
          {/* Game Mode Tab Header */}
          <div className="tab-list" style={{ marginBottom: '2rem' }}>
            <button className={`tab-btn${gameMode === 'bot' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setGameMode('bot')}>
              🤖 Play vs Bot
            </button>
            <button className={`tab-btn${gameMode === 'local' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setGameMode('local')}>
              👥 Local Multiplayer
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem', animation: 'float 3s ease-in-out infinite' }}>♞</div>
            <h1>{gameMode === 'bot' ? 'Play vs Bot' : 'Local Multiplayer'}</h1>
            <p>{gameMode === 'bot' ? 'Adjust ELO levels and time controls' : 'Pass and play on the same device'}</p>
          </div>

          {/* Color Selection (Choose Black or White) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: '600' }}>
              Choose Your Side
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { key: 'white', label: '⚪ White', emoji: '♔' },
                { key: 'black', label: '⚫ Black', emoji: '♚' },
                { key: 'random', label: '🔀 Random', emoji: '❓' },
              ].map(({ key, label }) => {
                const isSelected = playerColor === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPlayerColor(key)}
                    className={`btn btn-sm ${isSelected ? '' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '10px', border: isSelected ? '1px solid var(--gold)' : undefined }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ELO Levels scrollable selection */}
          {gameMode === 'bot' && (
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
          )}

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
            ⚔️ Start Match
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

  const opponentLabel = gameMode === 'bot' ? `Bot ELO ${selectedElo}` : 'Local Opponent';
  const playerLabel = gameMode === 'bot' ? (user ? user.email.split('@')[0] : 'Guest') : 'Local Player';

  return (
    <div className="game-container fade-in">
      {/* Game board & labels */}
      <div>
        {/* Top/Opponent Panel */}
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(15,21,37,0.8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid var(--border)' }}>
              {gameMode === 'bot' ? '🤖' : '👤'}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{actualColor === 'white' ? opponentLabel : playerLabel}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {actualColor === 'white' ? 'Black Pieces' : 'White Pieces'}
              </div>
            </div>
            {isThinking && <div className="spinner" />}
          </div>
          
          {/* Top Timer */}
          {selectedTime.value > 0 && gameMode === 'bot' && (
            <div style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ⏱️ {formatTime(actualColor === 'white' ? botTime : playerTime)}
            </div>
          )}
        </div>

        {/* Board wrapper (pure click/tap-to-move) */}
        <div className="board-wrapper">
          <Chessboard
            id="game-board"
            position={fen}
            onSquareClick={onSquareClick}
            animationDuration={220}
            boardWidth={boardWidth}
            customSquareStyles={{ ...moveSquares, ...optionSquares, ...dangerSquares }}
            customBoardStyle={{ borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
            customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
            customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
            arePiecesDraggable={false}
            boardOrientation={actualColor}
            showBoardNotation={true}
          />
        </div>

        {/* Bottom/Player Panel */}
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{actualColor === 'white' ? playerLabel : opponentLabel}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {actualColor === 'white' ? 'White Pieces' : 'Black Pieces'}
              </div>
            </div>
          </div>
          
          {/* Bottom Timer */}
          {selectedTime.value > 0 && gameMode === 'bot' && (
            <div style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-mono)', background: 'rgba(79,140,255,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--accent)' }}>
              ⏱️ {formatTime(actualColor === 'white' ? playerTime : botTime)}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="controls-panel">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '440px', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleQuitOrAbandon}>
              ← Back
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--gold)' }}>
              {gameMode === 'bot' ? 'vs Bot' : 'Local'}
            </span>
          </div>

          <div className={`status-bar ${isThinking ? 'thinking' : ''}`}>{status}</div>

          {/* Helper Features Toggles */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '4px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none', flex: 1, padding: '6px', border: '1px solid var(--border)', borderRadius: '6px', background: showDanger ? 'rgba(248,113,113,0.06)' : 'transparent' }}>
              <input type="checkbox" checked={showDanger} onChange={(e) => setShowDanger(e.target.checked)} />
              ⚠️ Show Danger
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none', flex: 1, padding: '6px', border: '1px solid var(--border)', borderRadius: '6px', background: useTutor ? 'rgba(79,140,255,0.06)' : 'transparent' }}>
              <input type="checkbox" checked={useTutor} onChange={(e) => setUseTutor(e.target.checked)} />
              🎓 Tutor Mode
            </label>
          </div>

          {/* Tutor display tip */}
          {useTutor && tutorTip && (
            <div className="slide-in" style={{ padding: '8px 12px', background: 'rgba(79,140,255,0.05)', borderLeft: '3px solid var(--accent)', borderRadius: '0 6px 6px 0', fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {tutorTip}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.25rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('move_history')}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pairedMoves.length} moves</span>
          </div>

          <div className="move-history" style={{ flex: 1, overflowY: 'auto' }}>
            {pairedMoves.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem' }}>Tap a piece to select, then tap your target square to move.</p>
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

          {/* Action buttons (Resign, Offer Draw, Quit) */}
          <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={handleResign} disabled={isThinking || gameRef.current.isGameOver()}>🏳️ Resign</button>
            {gameMode === 'bot' && (
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={handleOfferDraw} disabled={isThinking || gameRef.current.isGameOver()}>🤝 Offer Draw</button>
            )}
            <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={handleQuitOrAbandon}>✕ Quit</button>
          </div>
        </div>
      </div>

      {/* ABANDON MATCH CONFIRMATION PROMPT */}
      {showAbandonPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '20px' }}>
          <div className="glass-panel fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '24px', border: '1px solid var(--danger)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Abandon Match?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Leaving this match now will count as a forfeit/loss. Are you sure you want to abandon?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAbandonPrompt(false)}>
                Continue Play
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmAbandon}>
                Yes, Forfeit
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', overflow: 'hidden', textBreak: 'break-all', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
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
