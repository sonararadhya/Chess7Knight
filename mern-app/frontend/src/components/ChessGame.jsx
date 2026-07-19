import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

const generateMoveReview = (movesList) => {
  const review = [];
  const tempGame = new Chess();
  const valMap = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  
  movesList.forEach((move, index) => {
    const from = move.from;
    const to = move.to;
    const san = move.san;
    const color = move.color;
    
    // Previous FEN
    const prevFen = tempGame.fen();
    
    // Make move on temp game
    tempGame.move(move);
    const fenAfter = tempGame.fen();
    
    let classification = 'good';
    let commentary = '';
    let bestMove = '';
    let scoreAfter = '';
    
    const moveNumber = Math.floor(index / 2) + 1;
    
    // 1. Check Book Moves
    if (moveNumber <= 4) {
      const bookMoves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd4', 'd5', 'c4', 'Nf6', 'c5', 'e6', 'c6', 'd6', 'g3', 'Nf3'];
      if (bookMoves.includes(san)) {
        classification = 'book';
        commentary = `Book Move: Standard opening theory. Developing pieces and staking a claim in the center.`;
      }
    }
    
    // 2. Check Checkmate / Checks
    if (tempGame.isCheckmate()) {
      classification = 'brilliant';
      commentary = `Brilliant! A decisive blow. You delivered checkmate and won the game immediately!`;
    } else if (tempGame.inCheck()) {
      classification = 'best';
      commentary = `Best Move: Checks the opponent's king, forcing defensive action and taking the initiative.`;
    } 
    // 3. Captures
    else if (move.captured) {
      const capVal = valMap[move.captured] || 0;
      const pieceVal = valMap[move.piece] || 0;
      if (capVal > pieceVal) {
        classification = 'great';
        commentary = `Great Move: Capture of a higher-value ${move.captured.toUpperCase()} with your ${move.piece.toUpperCase()} wins material!`;
      } else if (capVal === pieceVal) {
        classification = 'best';
        commentary = `Best Move: Even exchange of pieces to maintain the balance of the position.`;
      } else {
        classification = 'excellent';
        commentary = `Excellent: Tactical exchange that improves your control over key files or squares.`;
      }
    } 
    // 4. Position-based rule analysis
    else {
      // Check if moving to a square where it can be captured next move by opponent for free
      const oppGame = new Chess(fenAfter);
      const oppMoves = oppGame.moves({ verbose: true });
      const freeCapture = oppMoves.find(m => m.captured && m.to === to);
      
      if (freeCapture) {
        // Can we recapture?
        oppGame.move(freeCapture);
        const recaptured = oppGame.moves({ verbose: true }).find(m => m.to === to);
        if (!recaptured) {
          classification = 'blunder';
          commentary = `Blunder: Moving your ${move.piece.toUpperCase()} to ${to} leaves it completely unprotected and open to free capture.`;
          // Find a safer move
          const prevGame = new Chess(prevFen);
          const legal = prevGame.moves({ verbose: true });
          const safe = legal.find(m => m.from !== from && !prevGame.get(m.to));
          bestMove = safe ? safe.san : 'Piece safety';
        } else {
          // If we can recapture but it's a bad trade
          const pieceVal = valMap[move.piece] || 1;
          const capturerVal = valMap[freeCapture.piece] || 1;
          if (pieceVal > capturerVal) {
            classification = 'mistake';
            commentary = `Mistake: Moving your ${move.piece.toUpperCase()} to ${to} leads to a bad trade losing material.`;
            const prevGame = new Chess(prevFen);
            const legal = prevGame.moves({ verbose: true });
            const safe = legal.find(m => m.from !== from);
            bestMove = safe ? safe.san : 'Developing move';
          }
        }
      }
    }
    
    // Fallbacks and default classifications
    if (classification === 'good') {
      const centerSquares = ['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'f4', 'f5'];
      if (centerSquares.includes(to)) {
        classification = 'best';
        commentary = `Best Move: Controls the center of the board, restricting the opponent's pieces.`;
      } else if (move.piece === 'n' || move.piece === 'b') {
        classification = 'excellent';
        commentary = `Excellent: Actively developing minor pieces to build pressure and prepare for castling.`;
      } else if (san === 'O-O' || san === 'O-O-O') {
        classification = 'best';
        commentary = `Best Move: Secures your king's safety and activates the rook on the open files.`;
      } else {
        const standardComments = [
          "Good Move: Keeps position balanced and maintains pressure.",
          "Good Move: Solid developing move improving piece coordination.",
          "Good Move: Patient positional play waiting for opportunities."
        ];
        commentary = standardComments[index % standardComments.length];
      }
    }
    
    // Score After
    const isWhite = color === 'w';
    let scoreVal = 0.0;
    if (index > 0) {
      const prevScoreStr = review[index - 1].scoreAfter;
      if (prevScoreStr.startsWith('#')) {
        scoreAfter = prevScoreStr;
      } else {
        const prevScore = parseFloat(prevScoreStr) || 0.0;
        const sign = isWhite ? 1 : -1;
        if (classification === 'blunder') {
          scoreVal = prevScore - sign * 3.5;
        } else if (classification === 'mistake') {
          scoreVal = prevScore - sign * 1.5;
        } else if (classification === 'inaccuracy') {
          scoreVal = prevScore - sign * 0.6;
        } else if (classification === 'brilliant') {
          scoreVal = prevScore + sign * 1.8;
        } else if (classification === 'great' || classification === 'best') {
          scoreVal = prevScore + sign * 0.3;
        } else {
          scoreVal = prevScore + sign * 0.05;
        }
        scoreAfter = (scoreVal > 0 ? '+' : '') + scoreVal.toFixed(1);
      }
    } else {
      scoreAfter = isWhite ? '+0.3' : '-0.1';
    }
    
    review.push({
      san,
      from,
      to,
      color,
      classification,
      commentary,
      bestMove: bestMove || '',
      scoreAfter,
      fenAfter
    });
  });
  
  return review;
};

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

const getMoveCategoryInfo = (classification) => {
  return moveCategories.find(c => c.key === classification) || { label: 'Good', emoji: '👍', color: '#6b7280' };
};

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
  const [pastFens, setPastFens] = useState([gameRef.current.fen()]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
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
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isGameOverState, setIsGameOverState] = useState(false);

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
          const fens = [game.fen()];
          if (savedPgn) {
            game.loadPgn(savedPgn);
            const history = game.history({ verbose: true });
            const temp = new Chess();
            history.forEach(m => {
              temp.move(m);
              fens.push(temp.fen());
            });
          } else {
            game.load(savedFen);
            fens.push(savedFen);
          }
          gameRef.current = game;
          setFen(game.fen());
          setPastFens(fens);
          setCurrentMoveIndex(fens.length - 1);
        } catch (e) {
          console.error('Error reloading game state', e);
          gameRef.current = new Chess();
          const startFen = gameRef.current.fen();
          setFen(startFen);
          setPastFens([startFen]);
          setCurrentMoveIndex(0);
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
    if (gameState !== 'playing' || isGameOverState) return;
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
  }, [gameState, selectedElo, selectedTime, playerTime, botTime, status, gameMode, actualColor, isGameOverState]);

  const clearStorageGame = () => {
    const keys = getPersistKeys();
    Object.values(keys).forEach(k => localStorage.removeItem(k));
  };

  useEffect(() => {
    if (gameState === 'playing' && !isGameOverState) {
      saveStateToStorage();
    }
  }, [fen, playerTime, botTime, gameState, isGameOverState, saveStateToStorage]);

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
    setIsGameOverState(true);
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
      setIsGameOverState(true);
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
      console.log('Attempting move:', move);
      const result = gameRef.current.move(move);
      if (!result) {
        console.warn('Move rejected by chess.js:', move);
        return null;
      }
      console.log('Move successful. New FEN:', gameRef.current.fen());
      const newFen = gameRef.current.fen();
      setFen(newFen);
      setPastFens(prev => {
        const next = [...prev, newFen];
        setCurrentMoveIndex(next.length - 1);
        return next;
      });
      setMoveSquares({
        [result.from]: { backgroundColor: 'rgba(201, 162, 39, 0.4)' },
        [result.to]: { backgroundColor: 'rgba(201, 162, 39, 0.4)' },
      });
      setOptionSquares({});
      setMoveFrom(null);
      return result;
    } catch (error) {
      console.error('Error during makeAMove:', error, move);
      return null;
    }
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

  const getMoveOptions = useCallback((square) => {
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
      };
    });

    setOptionSquares(newSquares);
    return true;
  }, []);

  // Click-to-move / Tap-to-move interaction
  // react-chessboard v5 calls onSquareClick with an OBJECT: { piece, square }
  const onSquareClick = useCallback(({ square } = {}) => {
    if (isReviewMode || currentMoveIndex !== pastFens.length - 1) return;
    if (!square || isThinking || gameRef.current.isGameOver() || gameState !== 'playing') return;

    const turn = gameRef.current.turn();

    // Verify turn ownership in bot mode
    if (gameMode === 'bot' && turn !== actualColor[0]) return;

    if (moveFrom) {
      const result = makeAMove({ from: moveFrom, to: square, promotion: 'q' });
      if (result !== null) {
        checkGameOver(gameRef.current);
        if (gameMode === 'bot') {
          // Bot turn will auto-trigger via fen-change effect
        }
        return;
      }
      // If move failed, check if clicked square contains another of our own pieces to switch selection
      const clickedPiece = gameRef.current.get(square);
      if (clickedPiece && clickedPiece.color === turn) {
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
    } else {
      const clickedPiece = gameRef.current.get(square);
      if (clickedPiece && clickedPiece.color === turn) {
        const hasMoves = getMoveOptions(square);
        if (hasMoves) {
          setMoveFrom(square);
        }
      }
    }
  }, [isReviewMode, currentMoveIndex, pastFens.length, isThinking, gameState, gameMode, actualColor, moveFrom, makeAMove, checkGameOver, getMoveOptions]);

  // Drag-and-drop interaction handler
  // react-chessboard v5 calls onPieceDrop with an OBJECT: { piece, sourceSquare, targetSquare }
  const onPieceDrop = useCallback(({ sourceSquare, targetSquare } = {}) => {
    if (isReviewMode || currentMoveIndex !== pastFens.length - 1) return false;
    if (!sourceSquare || !targetSquare) return false;
    if (isThinking || gameRef.current.isGameOver() || gameState !== 'playing') return false;

    const turn = gameRef.current.turn();

    // Verify turn ownership in bot mode
    if (gameMode === 'bot' && turn !== actualColor[0]) return false;

    // Check if it's pawn promotion
    const droppedPiece = gameRef.current.get(sourceSquare);
    const isPromotion = droppedPiece && droppedPiece.type === 'p' &&
      ((droppedPiece.color === 'w' && targetSquare[1] === '8') || (droppedPiece.color === 'b' && targetSquare[1] === '1'));

    const result = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: isPromotion ? 'q' : undefined,
    });

    if (result === null) return false;

    checkGameOver(gameRef.current);
    return true;
  }, [isReviewMode, currentMoveIndex, pastFens.length, isThinking, gameState, gameMode, actualColor, makeAMove, checkGameOver]);

  const getReviewSquareStyles = useCallback(() => {
    if (!isReviewMode || reviewIndex === 0) return {};
    const move = reviewHistory[reviewIndex - 1];
    if (!move) return {};
    const catInfo = getMoveCategoryInfo(move.classification);
    
    const styles = {};
    if (move.from && move.to) {
      styles[move.from] = { backgroundColor: `${catInfo.color}33` }; // 20% opacity
      styles[move.to] = { 
        backgroundColor: `${catInfo.color}44`,
        boxShadow: `inset 0 0 0 3px ${catInfo.color}`
      };
    }
    return styles;
  }, [isReviewMode, reviewIndex, reviewHistory]);

  const jumpToMove = useCallback((index) => {
    if (index < 0 || index >= pastFens.length) return;
    setCurrentMoveIndex(index);
  }, [pastFens.length]);

  const chessboardOptions = useMemo(() => {
    return {
      id: 'game-board',
      position: isReviewMode 
        ? (reviewIndex === 0 ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : (reviewHistory[reviewIndex - 1]?.fenAfter || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')) 
        : pastFens[currentMoveIndex],
      onPieceDrop: onPieceDrop,
      onSquareClick: onSquareClick,
      animationDurationInMs: 220,
      boardStyle: { borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' },
      squareStyles: isReviewMode 
        ? getReviewSquareStyles() 
        : { ...moveSquares, ...optionSquares, ...dangerSquares },
      darkSquareStyle: { backgroundColor: theme.darkSquare },
      lightSquareStyle: { backgroundColor: theme.lightSquare },
      canDragPiece: ({ square }) => {
        if (isReviewMode || currentMoveIndex !== pastFens.length - 1) return false;
        if (isThinking || gameRef.current.isGameOver()) return false;
        if (gameMode === 'local') return true;
        const p = gameRef.current.get(square);
        return p && p.color === actualColor[0];
      },
      boardOrientation: actualColor,
      showNotation: true,
    };
  }, [
    isReviewMode,
    reviewIndex,
    reviewHistory,
    pastFens,
    currentMoveIndex,
    onPieceDrop,
    onSquareClick,
    getReviewSquareStyles,
    moveSquares,
    optionSquares,
    dangerSquares,
    theme,
    isThinking,
    actualColor,
    gameMode
  ]);

  // Start a fresh game
  const resetGame = () => {
    gameRef.current = new Chess();
    setIsGameOverState(false);
    const startFen = gameRef.current.fen();
    setFen(startFen);
    setPastFens([startFen]);
    setCurrentMoveIndex(0);
    setMoveSquares({});
    setOptionSquares({});
    setMoveFrom(null);
    setIsThinking(false);
    setShowAnalysis(false);
    setAnalysisData(null);
    setShowAbandonPrompt(false);
    setIsReviewMode(false);
    setReviewHistory([]);
    setReviewIndex(0);
    
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
  };

  const handleResign = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameOverState(true);
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
      setIsGameOverState(true);
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
      setIsGameOverState(false);
    }
  };

  const confirmAbandon = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameOverState(true);
    clearStorageGame();
    saveMatch('0-1'); // Counted as loss
    setGameState('menu');
    setShowAbandonPrompt(false);
  };

  // Bot Turn Trigger Effect — fires on every fen change AND on game/color state changes
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'bot' && !isThinking && !gameRef.current.isGameOver()) {
      const turn = gameRef.current.turn();
      const botColorChar = actualColor === 'white' ? 'b' : 'w';
      if (turn === botColorChar) {
        const timer = setTimeout(makeBotMove, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [fen, gameState, gameMode, isThinking, actualColor, makeBotMove]);

  // Separate effect: trigger bot move at game START when player chose Black
  // (fen doesn't change on game start so the above effect won't fire)
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'bot' && actualColor === 'black' && !isThinking) {
      const turn = gameRef.current.turn(); // Should be 'w' at game start
      if (turn === 'w') {
        const timer = setTimeout(makeBotMove, 600);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, actualColor, gameMode]);

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

  const opponentLabel = gameMode === 'bot' ? `Bot ELO ${selectedElo}` : 'Local Opponent';
  const playerLabel = gameMode === 'bot' ? (user ? user.email.split('@')[0] : 'Guest') : 'Local Player';

  const startInteractiveReview = () => {
    const history = gameRef.current.history({ verbose: true });
    const analyzed = generateMoveReview(history);
    setReviewHistory(analyzed);
    setReviewIndex(analyzed.length);
    setIsReviewMode(true);
    setShowAnalysis(false);
  };

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
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{opponentLabel}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {actualColor === 'white' ? 'Black Pieces' : 'White Pieces'}
              </div>
            </div>
            {isThinking && <div className="spinner" />}
          </div>
          
          {/* Top Timer */}
          {selectedTime.value > 0 && gameMode === 'bot' && (
            <div style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ⏱️ {formatTime(botTime)}
            </div>
          )}
        </div>

        {/* Board wrapper (supports both click and drag-and-drop) */}
        <div className="board-wrapper">
          <Chessboard
            key={actualColor}
            options={chessboardOptions}
          />
        </div>

        {/* Move navigation controls */}
        {!isReviewMode && (
          <div className="navigation-controls" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '0.8rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ minWidth: '40px', fontWeight: 'bold' }}
              onClick={() => jumpToMove(0)}
              disabled={currentMoveIndex === 0}
              title="Start"
            >
              «
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 14px', fontWeight: 'bold' }}
              onClick={() => jumpToMove(currentMoveIndex - 1)}
              disabled={currentMoveIndex === 0}
            >
              ‹ Prev
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Move {currentMoveIndex} / {pastFens.length - 1}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 14px', fontWeight: 'bold' }}
              onClick={() => jumpToMove(currentMoveIndex + 1)}
              disabled={currentMoveIndex === pastFens.length - 1}
            >
              Next ›
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ minWidth: '40px', fontWeight: 'bold' }}
              onClick={() => jumpToMove(pastFens.length - 1)}
              disabled={currentMoveIndex === pastFens.length - 1}
              title="End"
            >
              »
            </button>
          </div>
        )}

        {isReviewMode && (
          <div className="navigation-controls" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '0.8rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ minWidth: '40px', fontWeight: 'bold' }}
              onClick={() => setReviewIndex(0)}
              disabled={reviewIndex === 0}
              title="Start"
            >
              «
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 14px', fontWeight: 'bold' }}
              onClick={() => setReviewIndex(prev => Math.max(0, prev - 1))}
              disabled={reviewIndex === 0}
            >
              ‹ Prev
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Move {reviewIndex} / {reviewHistory.length}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 14px', fontWeight: 'bold' }}
              onClick={() => setReviewIndex(prev => Math.min(reviewHistory.length, prev + 1))}
              disabled={reviewIndex === reviewHistory.length}
            >
              Next ›
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ minWidth: '40px', fontWeight: 'bold' }}
              onClick={() => setReviewIndex(reviewHistory.length)}
              disabled={reviewIndex === reviewHistory.length}
              title="End"
            >
              »
            </button>
          </div>
        )}

        {/* Bottom/Player Panel */}
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{playerLabel}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {actualColor === 'white' ? 'White Pieces' : 'Black Pieces'}
              </div>
            </div>
          </div>
          
          {/* Bottom Timer */}
          {selectedTime.value > 0 && gameMode === 'bot' && (
            <div style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-mono)', background: 'rgba(79,140,255,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--accent)' }}>
              ⏱️ {formatTime(playerTime)}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="controls-panel">
        {isReviewMode ? (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '440px', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsReviewMode(false)}>
                ← Close Review
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--gold)' }}>
                Game Review 🔍
              </span>
            </div>

            {/* Performance ELO & Accuracy */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <div style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
                  {analysisData?.accuracy || 85}%
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Accuracy</div>
              </div>
              <div style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {analysisData?.performanceRating || 1200}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Rating</div>
              </div>
            </div>

            {/* Current Selected Move Details */}
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '130px' }}>
              {reviewIndex === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', padding: '10px' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏁</div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Starting Position</strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Click Next or tap any move to step through history.</p>
                </div>
              ) : (
                (() => {
                  const m = reviewHistory[reviewIndex - 1];
                  if (!m) return null;
                  const cat = getMoveCategoryInfo(m.classification);
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Move {reviewIndex}: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{m.san}</strong> ({m.color === 'w' ? 'White' : 'Black'})
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: cat.color, background: `${cat.color}15`, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${cat.color}33`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {cat.emoji} {cat.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {m.commentary}
                      </p>
                      {m.bestMove && (
                        <div style={{ fontSize: '0.74rem', padding: '6px 8px', background: 'rgba(52,211,153,0.05)', borderLeft: '3px solid #34d399', borderRadius: '0 4px 4px 0', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Best was: <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>{m.bestMove}</strong></span>
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>

            {/* Scrollable Move History Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Moves Review</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{reviewHistory.length} moves</span>
            </div>

            <div className="move-history" style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', padding: '2px' }}>
                {reviewHistory.map((m, idx) => {
                  const cat = getMoveCategoryInfo(m.classification);
                  const isCurrent = reviewIndex === idx + 1;
                  return (
                    <div
                      key={idx}
                      onClick={() => setReviewIndex(idx + 1)}
                      style={{
                        padding: '6px 8px',
                        background: isCurrent ? 'rgba(201, 162, 39, 0.15)' : 'rgba(255,255,255,0.01)',
                        border: isCurrent ? '1px solid var(--gold)' : '1px solid var(--border)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: '500', fontFamily: 'var(--font-mono)' }}>
                        {Math.floor(idx / 2) + 1}.{idx % 2 === 0 ? '' : '..'} {m.san}
                      </span>
                      <span style={{ fontSize: '0.85rem' }} title={cat.label}>
                        {cat.emoji}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exit Button */}
            <div style={{ marginTop: 'auto' }}>
              <button className="btn btn-gold btn-sm" style={{ width: '100%' }} onClick={() => { setIsReviewMode(false); setGameState('menu'); setIsGameOverState(false); }}>
                Done & Return to Menu
              </button>
            </div>
          </div>
        ) : (
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
                  {pairedMoves.map((pair, idx) => {
                    const whiteMoveIdx = 2 * idx + 1;
                    const blackMoveIdx = 2 * idx + 2;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '6px', color: 'var(--text-muted)', width: '28px', fontSize: '0.8rem' }}>{idx + 1}.</td>
                        <td 
                          style={{ 
                            padding: '6px', 
                            fontWeight: '500', 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            backgroundColor: currentMoveIndex === whiteMoveIdx ? 'rgba(201, 162, 39, 0.2)' : 'transparent',
                            borderRadius: '4px'
                          }}
                          onClick={() => jumpToMove(whiteMoveIdx)}
                        >
                          {pair.white}
                        </td>
                        <td 
                          style={{ 
                            padding: '6px', 
                            fontWeight: '500', 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '0.85rem', 
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            backgroundColor: currentMoveIndex === blackMoveIdx ? 'rgba(201, 162, 39, 0.2)' : 'transparent',
                            borderRadius: '4px'
                          }}
                          onClick={pair.black ? () => jumpToMove(blackMoveIdx) : undefined}
                        >
                          {pair.black}
                        </td>
                      </tr>
                    );
                  })}
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
        )}
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

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button 
                className="btn btn-gold" 
                style={{ flex: 1, padding: '12px' }} 
                onClick={startInteractiveReview}
              >
                🔍 Interactive Review
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '12px' }} 
                onClick={() => { setShowAnalysis(false); setGameState('menu'); setIsGameOverState(false); }}
              >
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;
