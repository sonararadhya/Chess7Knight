import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getCustomPieces } from '../utils/pieceSets';
import { soundFx } from '../utils/audio';
import { generateIndustryGameReview } from '../utils/reviewEngine';
import { calculateEloChange } from '../utils/elo';

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

export const saveMatchToLocalStorage = (matchData) => {
  try {
    const existing = JSON.parse(localStorage.getItem('chess7k_match_history') || '[]');
    const matchId = matchData._id || matchData.id || ('local_' + Date.now());
    const itemToSave = { ...matchData, _id: matchId, id: matchId };
    const updated = [itemToSave, ...existing.filter(m => (m._id || m.id) !== matchId)].slice(0, 50);
    localStorage.setItem('chess7k_match_history', JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving match to localStorage', e);
  }
};

const ChessGame = ({ user }) => {
  const { theme, themeId, setThemeId, pieceSetId, setPieceSetId, allThemes, allPieceSets, soundEnabled, setSoundEnabled } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Settings & Menu States
  const [gameState, setGameState] = useState('menu');
  const [gameMode, setGameMode] = useState('bot');
  const [selectedElo, setSelectedElo] = useState(1200);
  const [selectedTime, setSelectedTime] = useState(TIME_CONTROLS[4]);
  const [playerColor, setPlayerColor] = useState('white');
  const [actualColor, setActualColor] = useState('white');

  // Engine States
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
  const [promotionPending, setPromotionPending] = useState(null);

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
  const [reviewFilter, setReviewFilter] = useState('all');
  const [showPreventativeOnBoard, setShowPreventativeOnBoard] = useState(false);

  // Custom Pieces renderer
  const customPieces = useMemo(() => getCustomPieces(pieceSetId), [pieceSetId]);

  // Handle closing review mode (returns to profile if came from profile review match)
  const handleCloseReview = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsReviewMode(false);
    setIsGameOverState(false);
    setShowAnalysis(false);
    if (location.state?.reviewMatch) {
      navigate('/profile', { replace: true });
    } else {
      setGameState('menu');
    }
  }, [location.state, navigate]);

  // Handle external review launch cleanly WITHOUT popping up defeat overlay or running timer
  useEffect(() => {
    if (location.state?.reviewMatch) {
      if (timerRef.current) clearInterval(timerRef.current);
      const match = location.state.reviewMatch;
      setAnalysisData(match);
      setShowAnalysis(false); // CRITICAL: Reset analysis modal so defeat screen doesn't pop up!
      setIsGameOverState(false);
      
      if (match.reviewList && match.reviewList.length > 0) {
        setReviewHistory(match.reviewList);
        setReviewIndex(match.reviewList.length);
      } else if (match.pgn) {
        try {
          const g = new Chess();
          g.loadPgn(match.pgn);
          const history = g.history({ verbose: true });
          const rev = generateIndustryGameReview(history);
          setReviewHistory(rev.reviewList);
          setReviewIndex(rev.reviewList.length);
        } catch (e) {}
      }
      setIsReviewMode(true);
      setGameState('playing');
    }
  }, [location.state]);

  // Material & Captured pieces calculator
  const materialInfo = useMemo(() => {
    const initial = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const current = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
    
    try {
      const board = gameRef.current.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p) current[p.color][p.type]++;
        }
      }
    } catch (e) {}

    const symbols = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };
    const vals = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const capturedByWhite = [];
    const capturedByBlack = [];

    ['p', 'n', 'b', 'r', 'q'].forEach((t) => {
      const bCap = Math.max(0, initial[t] - current.b[t]);
      for (let i = 0; i < bCap; i++) capturedByWhite.push({ type: t, symbol: symbols[t], val: vals[t] });

      const wCap = Math.max(0, initial[t] - current.w[t]);
      for (let i = 0; i < wCap; i++) capturedByBlack.push({ type: t, symbol: symbols[t], val: vals[t] });
    });

    const wScore = capturedByWhite.reduce((s, p) => s + p.val, 0);
    const bScore = capturedByBlack.reduce((s, p) => s + p.val, 0);

    return {
      capturedByWhite,
      capturedByBlack,
      diff: wScore - bScore
    };
  }, [fen]);

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

  const calculateDangerSquares = useCallback(() => {
    if (!showDanger) {
      setDangerSquares({});
      return;
    }
    try {
      const tempGame = new Chess(gameRef.current.fen());
      const tokens = tempGame.fen().split(' ');
      tokens[1] = tokens[1] === 'w' ? 'b' : 'w';
      const oppGame = new Chess(tokens.join(' '));
      const moves = oppGame.moves({ verbose: true });
      const attacked = {};
      moves.forEach(m => {
        attacked[m.to] = { boxShadow: 'inset 0 0 0 3px rgba(248, 113, 113, 0.55)' };
      });
      setDangerSquares(attacked);
    } catch {
      setDangerSquares({});
    }
  }, [showDanger, fen]);

  const generateTutorTip = useCallback(() => {
    if (!useTutor) {
      setTutorTip('');
      return;
    }
    const g = gameRef.current;
    if (g.isGameOver()) {
      setTutorTip('The match has concluded!');
      return;
    }
    if (g.inCheck()) {
      setTutorTip('⚠️ King in check! Escaping, blocking, or capturing the attacker is mandatory.');
      return;
    }
    const history = g.history();
    if (history.length < 10) {
      setTutorTip('🎯 Opening Strategy: Stake claims in central squares (e4/d4) and develop minor pieces.');
      return;
    }
    setTutorTip('💡 Midgame Tactics: Control open files with rooks, scan for pins, double attacks, or undefended pieces.');
  }, [useTutor, fen]);

  useEffect(() => {
    calculateDangerSquares();
    generateTutorTip();
  }, [fen, showDanger, useTutor, calculateDangerSquares, generateTutorTip]);

  // Load Saved Game from Storage
  useEffect(() => {
    if (location.state?.reviewMatch) return;
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
          gameRef.current = new Chess();
          const startFen = gameRef.current.fen();
          setFen(startFen);
          setPastFens([startFen]);
          setCurrentMoveIndex(0);
        }
      }

      if (savedEloVal) setSelectedElo(parseInt(savedEloVal));
      if (savedTimeVal) {
        try { setSelectedTime(JSON.parse(savedTimeVal)); } catch {}
      }
      if (savedPlayerSec) setPlayerTime(parseInt(savedPlayerSec));
      if (savedBotSec) setBotTime(parseInt(savedBotSec));
      if (savedStatusText) setStatus(savedStatusText);
      if (savedMode) setGameMode(savedMode);
      if (savedColor) setActualColor(savedColor);

      setGameState('playing');
    }
  }, [location.state]);

  const saveStateToStorage = useCallback((customStatus) => {
    if (gameState !== 'playing' || isGameOverState || isReviewMode || location.state?.reviewMatch) return;
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
  }, [gameState, selectedElo, selectedTime, playerTime, botTime, status, gameMode, actualColor, isGameOverState, isReviewMode, location.state]);

  const clearStorageGame = () => {
    const keys = getPersistKeys();
    Object.values(keys).forEach(k => localStorage.removeItem(k));
  };

  useEffect(() => {
    if (gameState === 'playing' && !isGameOverState && !isReviewMode && !location.state?.reviewMatch) {
      saveStateToStorage();
    }
  }, [fen, playerTime, botTime, gameState, isGameOverState, isReviewMode, location.state, saveStateToStorage]);

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
    if (gameState !== 'playing' || selectedTime.value === 0 || isThinking || gameMode === 'local' || isGameOverState || isReviewMode || location.state?.reviewMatch) {
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
  }, [gameState, selectedTime, isThinking, gameMode, actualColor, isGameOverState, isReviewMode, location.state]);

  const handleTimeout = (result) => {
    if (isReviewMode || location.state?.reviewMatch) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameOverState(true);
    const winner = result === '1-0' ? 'White' : 'Black';
    setStatus(`⏱️ Timeout! ${winner} wins!`);
    soundFx.playWin();
    saveMatch(result);
  };

  const formatTime = (seconds) => {
    if (seconds === 0 && selectedTime.value === 0) return '∞';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── SAVE MATCH & CALCULATE ELO (Fixes Issue 1, Request 5) ──
  const saveMatch = async (result) => {
    if (isReviewMode || location.state?.reviewMatch) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameOverState(true);

    const history = gameRef.current.history({ verbose: true });
    const fullReview = generateIndustryGameReview(history);

    let normalizedResult = result;
    if (actualColor === 'black') {
      if (result === '1-0') normalizedResult = '0-1';
      else if (result === '0-1') normalizedResult = '1-0';
    }

    // ELO Calculation for Win / Loss / Draw
    const currentElo = user?.rating ?? (parseInt(localStorage.getItem('chess7k_guest_elo')) || 1200);
    const eloCalc = calculateEloChange(currentElo, selectedElo, normalizedResult);

    // Update guest ELO in local storage if not logged in
    if (!user) {
      localStorage.setItem('chess7k_guest_elo', String(eloCalc.newRating));
    }

    const matchObj = {
      _id: 'match_' + Date.now(),
      id: 'match_' + Date.now(),
      date: new Date().toISOString(),
      pgn: gameRef.current.pgn(),
      result: normalizedResult,
      accuracy: fullReview.accuracy,
      difficulty: selectedElo,
      timeControl: selectedTime.label,
      eloChange: eloCalc.delta,
      ratingAfter: eloCalc.newRating,
      analysis: fullReview.classificationsCount,
      performanceRating: fullReview.performanceRating,
      openingName: fullReview.openingName,
      phasePerformance: fullReview.phasePerformance,
      reviewList: fullReview.reviewList,
      turningPoint: fullReview.turningPoint,
      mode: gameMode
    };

    saveMatchToLocalStorage(matchObj);
    clearStorageGame();

    const token = localStorage.getItem('token');
    if (token && gameMode !== 'local') {
      try {
        const postBody = {
          pgn: matchObj.pgn,
          result: matchObj.result,
          accuracy: matchObj.accuracy,
          difficulty: matchObj.difficulty,
          timeControl: matchObj.timeControl
        };
        const res = await axios.post(`${API_URL}/matches/save`, postBody, {
          headers: { 'x-auth-token': token }
        });

        if (res.data?.match) {
          const apiMatch = {
            ...res.data.match,
            eloChange: res.data.match.eloChange || eloCalc.delta,
            ratingAfter: res.data.newRating || eloCalc.newRating,
            reviewList: fullReview.reviewList,
            turningPoint: fullReview.turningPoint
          };
          saveMatchToLocalStorage(apiMatch);
          setAnalysisData(apiMatch);
        } else {
          setAnalysisData(matchObj);
        }
      } catch (err) {
        console.error('Backend match save error, using local fallback', err);
        setAnalysisData(matchObj);
      }
    } else {
      setAnalysisData(matchObj);
    }

    setShowAnalysis(true);
  };

  const checkGameOver = useCallback((g) => {
    if (isReviewMode || location.state?.reviewMatch) return false;
    if (g.isGameOver()) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsGameOverState(true);
      if (g.isCheckmate()) {
        const winner = g.turn() === 'w' ? 'Black' : 'White';
        setStatus(`♚ ${t('checkmate')}! ${winner} wins!`);
        soundFx.playWin();
        saveMatch(g.turn() === 'w' ? '0-1' : '1-0');
      } else if (g.isDraw()) {
        setStatus(`½ ${t('draw')}!`);
        saveMatch('1/2-1/2');
      }
      return true;
    }
    if (g.inCheck()) {
      setStatus(`⚠️ ${t('check')}!`);
      soundFx.playCheck();
    } else {
      setStatus(t('your_turn'));
    }
    return false;
  }, [selectedElo, selectedTime, t, gameMode, isReviewMode, location.state]);

  const makeAMove = useCallback((move) => {
    try {
      const result = gameRef.current.move(move);
      if (!result) return null;

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

      // Play Sound Effects
      if (gameRef.current.inCheck()) soundFx.playCheck();
      else if (result.captured) soundFx.playCapture();
      else soundFx.playMove();

      return result;
    } catch (error) {
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

  const checkIfPromotionMove = useCallback((from, to) => {
    const piece = gameRef.current.get(from);
    if (!piece || piece.type !== 'p') return false;
    
    const isDestCorrect = (piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1');
    if (!isDestCorrect) return false;

    const moves = gameRef.current.moves({ square: from, verbose: true });
    return moves.some(m => m.to === to);
  }, []);

  const handleSelectPromotion = useCallback((pieceType) => {
    if (!promotionPending) return;
    const { from, to } = promotionPending;
    setPromotionPending(null);

    const result = makeAMove({
      from,
      to,
      promotion: pieceType
    });

    if (result !== null) {
      checkGameOver(gameRef.current);
    }
  }, [promotionPending, makeAMove, checkGameOver]);

  const getMoveOptions = useCallback((square) => {
    const moves = gameRef.current.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }
    
    const newSquares = {};
    newSquares[square] = {
      boxShadow: '0 0 0 5px var(--gold), 0 0 20px var(--gold)',
      backgroundColor: 'rgba(201, 162, 39, 0.25)',
      borderRadius: '8px',
    };

    moves.forEach((move) => {
      const isCapture = gameRef.current.get(move.to) && gameRef.current.get(move.to).color !== gameRef.current.get(square)?.color;
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

  const onSquareClick = useCallback(({ square } = {}) => {
    if (isReviewMode || currentMoveIndex !== pastFens.length - 1) return;
    if (!square || isThinking || gameRef.current.isGameOver() || gameState !== 'playing') return;

    const turn = gameRef.current.turn();
    if (gameMode === 'bot' && turn !== actualColor[0]) return;

    if (moveFrom) {
      if (checkIfPromotionMove(moveFrom, square)) {
        setPromotionPending({
          from: moveFrom,
          to: square,
          color: gameRef.current.get(moveFrom)?.color
        });
        setMoveFrom(null);
        setOptionSquares({});
        return;
      }
      const result = makeAMove({ from: moveFrom, to: square });
      if (result !== null) {
        checkGameOver(gameRef.current);
        return;
      }
      const clickedPiece = gameRef.current.get(square);
      if (clickedPiece && clickedPiece.color === turn) {
        const hasMoves = getMoveOptions(square);
        if (hasMoves) setMoveFrom(square);
        else { setMoveFrom(null); setOptionSquares({}); }
      } else {
        setMoveFrom(null);
        setOptionSquares({});
      }
    } else {
      const clickedPiece = gameRef.current.get(square);
      if (clickedPiece && clickedPiece.color === turn) {
        const hasMoves = getMoveOptions(square);
        if (hasMoves) setMoveFrom(square);
      }
    }
  }, [isReviewMode, currentMoveIndex, pastFens.length, isThinking, gameState, gameMode, actualColor, moveFrom, makeAMove, checkGameOver, getMoveOptions, checkIfPromotionMove]);

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare } = {}) => {
    if (isReviewMode || currentMoveIndex !== pastFens.length - 1) return false;
    if (!sourceSquare || !targetSquare) return false;
    if (isThinking || gameRef.current.isGameOver() || gameState !== 'playing') return false;

    const turn = gameRef.current.turn();
    if (gameMode === 'bot' && turn !== actualColor[0]) return false;

    if (checkIfPromotionMove(sourceSquare, targetSquare)) {
      setPromotionPending({
        from: sourceSquare,
        to: targetSquare,
        color: gameRef.current.get(sourceSquare)?.color
      });
      setMoveFrom(null);
      setOptionSquares({});
      return true;
    }

    const result = makeAMove({
      from: sourceSquare,
      to: targetSquare,
    });

    if (result === null) return false;

    checkGameOver(gameRef.current);
    return true;
  }, [isReviewMode, currentMoveIndex, pastFens.length, isThinking, gameState, gameMode, actualColor, makeAMove, checkGameOver, checkIfPromotionMove]);

  const getReviewSquareStyles = useCallback(() => {
    if (!isReviewMode || reviewIndex === 0) return {};
    const move = reviewHistory[reviewIndex - 1];
    if (!move) return {};
    const catInfo = getMoveCategoryInfo(move.classification);
    
    const styles = {};
    if (move.from && move.to) {
      styles[move.from] = { backgroundColor: `${catInfo.color}33` };
      styles[move.to] = { 
        backgroundColor: `${catInfo.color}44`,
        boxShadow: `inset 0 0 0 3px ${catInfo.color}`
      };
    }

    if (showPreventativeOnBoard && move.bestMoveFrom && move.bestMoveTo) {
      styles[move.bestMoveFrom] = {
        boxShadow: '0 0 0 4px #34d399, 0 0 16px #34d399',
        backgroundColor: 'rgba(52,211,153,0.3)',
        borderRadius: '6px'
      };
      styles[move.bestMoveTo] = {
        boxShadow: '0 0 0 4px #34d399, 0 0 16px #34d399',
        backgroundColor: 'rgba(52,211,153,0.4)',
        borderRadius: '6px'
      };
    }

    return styles;
  }, [isReviewMode, reviewIndex, reviewHistory, showPreventativeOnBoard]);

  const jumpToMove = useCallback((index) => {
    if (index < 0 || index >= pastFens.length) return;
    setCurrentMoveIndex(index);
  }, [pastFens.length]);

  // Pass customPieces as 'pieces' prop & theme darkSquareStyle / lightSquareStyle directly into Chessboard options
  const chessboardOptions = useMemo(() => {
    return {
      id: 'game-board',
      position: isReviewMode 
        ? (reviewIndex === 0 ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : (reviewHistory[reviewIndex - 1]?.fenAfter || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')) 
        : pastFens[currentMoveIndex],
      pieces: customPieces,
      onPieceDrop: onPieceDrop,
      onSquareClick: onSquareClick,
      animationDurationInMs: 220,
      boardStyle: { borderRadius: '10px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' },
      squareStyles: isReviewMode 
        ? getReviewSquareStyles() 
        : { ...moveSquares, ...optionSquares, ...dangerSquares },
      darkSquareStyle: theme.darkSquareStyle || { backgroundColor: theme.darkSquare },
      lightSquareStyle: theme.lightSquareStyle || { backgroundColor: theme.lightSquare },
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
    customPieces,
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
    setPromotionPending(null);
    setIsThinking(false);
    setShowAnalysis(false);
    setAnalysisData(null);
    setShowAbandonPrompt(false);
    setIsReviewMode(false);
    setReviewHistory([]);
    setReviewIndex(0);
    setShowPreventativeOnBoard(false);
    
    let finalColor = playerColor;
    if (playerColor === 'random') {
      finalColor = Math.random() > 0.5 ? 'white' : 'black';
    }
    setActualColor(finalColor);
    
    setPlayerTime(selectedTime.value);
    setBotTime(selectedTime.value);
    
    setStatus(t('your_turn'));
    soundFx.playStart();
    setGameState('playing');

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
    if (isReviewMode || location.state?.reviewMatch) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameOverState(true);
    setStatus('🏳️ Resignation. Match over.');
    clearStorageGame();
    saveMatch('0-1');
  };

  const handleOfferDraw = () => {
    if (isReviewMode || location.state?.reviewMatch || isThinking || gameRef.current.isGameOver()) return;
    const isAccepted = Math.random() > 0.5;
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
    if (isReviewMode || location.state?.reviewMatch) {
      handleCloseReview();
      return;
    }
    if (gameState === 'playing' && !gameRef.current.isGameOver() && !isGameOverState) {
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
    saveMatch('0-1');
    setGameState('menu');
    setShowAbandonPrompt(false);
  };

  const startInteractiveReview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const history = gameRef.current.history({ verbose: true });
    const fullRev = generateIndustryGameReview(history);
    setReviewHistory(fullRev.reviewList);
    setReviewIndex(fullRev.reviewList.length);
    setIsReviewMode(true);
    setShowAnalysis(false);
  };

  // Bot Turn Trigger Effect
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'bot' && !isThinking && !gameRef.current.isGameOver() && !isGameOverState && !isReviewMode && !location.state?.reviewMatch) {
      const turn = gameRef.current.turn();
      const botColorChar = actualColor === 'white' ? 'b' : 'w';
      if (turn === botColorChar) {
        const timer = setTimeout(makeBotMove, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [fen, gameState, gameMode, isThinking, actualColor, makeBotMove, isGameOverState, isReviewMode, location.state]);

  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'bot' && actualColor === 'black' && !isThinking && !isGameOverState && !isReviewMode && !location.state?.reviewMatch) {
      const turn = gameRef.current.turn();
      if (turn === 'w') {
        const timer = setTimeout(makeBotMove, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, actualColor, gameMode, isThinking, isGameOverState, isReviewMode, makeBotMove, location.state]);

  // ── MENU VIEW ──
  if (gameState === 'menu') {
    return (
      <div className="fade-in" style={{ maxWidth: '640px', margin: '2rem auto' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          
          <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
            <button className={`tab-btn${gameMode === 'bot' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setGameMode('bot')}>
              🤖 Play vs Bot
            </button>
            <button className={`tab-btn${gameMode === 'local' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setGameMode('local')}>
              👥 Local Multiplayer
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.25rem', animation: 'float 3s ease-in-out infinite' }}>♞</div>
            <h2>{gameMode === 'bot' ? 'Play vs Bot' : 'Local Multiplayer'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {gameMode === 'bot' ? 'Select ELO difficulty, time control & piece design' : 'Pass and play on the same device'}
            </p>
          </div>

          {/* Color Selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: '600' }}>
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
                    style={{ flex: 1, padding: '9px', border: isSelected ? '1px solid var(--gold)' : undefined }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme & Piece Set Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: '600' }}>
                🎨 Board Theme Design
              </label>
              <select value={themeId} onChange={e => setThemeId(e.target.value)} className="form-control" style={{ fontSize: '0.85rem', padding: '8px' }}>
                {Object.entries(allThemes).map(([id, th]) => (
                  <option key={id} value={id}>{th.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: '600' }}>
                ♛ Piece Set Design
              </label>
              <select value={pieceSetId} onChange={e => setPieceSetId(e.target.value)} className="form-control" style={{ fontSize: '0.85rem', padding: '8px' }}>
                {Object.entries(allPieceSets).map(([id, ps]) => (
                  <option key={id} value={id}>{ps.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ELO Levels */}
          {gameMode === 'bot' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: '600' }}>
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
                      style={{ flexShrink: 0, padding: '7px 12px', border: isSelected ? '1px solid var(--gold)' : undefined }}
                    >
                      {elo}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Controls */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: '600' }}>
              Time Control
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px' }}>
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

  const filteredReviewList = reviewHistory.filter((m) => {
    if (reviewFilter === 'mistakes') return ['blunder', 'mistake', 'inaccuracy', 'miss'].includes(m.classification);
    if (reviewFilter === 'brilliant') return ['brilliant', 'great', 'best'].includes(m.classification);
    return true;
  });

  return (
    <div className="game-container fade-in">
      <div>
        {/* Top Opponent Panel */}
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(15,21,37,0.8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid var(--border)' }}>
              {gameMode === 'bot' ? '🤖' : '👤'}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {opponentLabel}
                {actualColor === 'white' ? (
                  materialInfo.diff < 0 && <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: '700' }}>+{Math.abs(materialInfo.diff)}</span>
                ) : (
                  materialInfo.diff > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: '700' }}>+{materialInfo.diff}</span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                {actualColor === 'white' 
                  ? materialInfo.capturedByBlack.map((p, idx) => <span key={idx}>{p.symbol}</span>)
                  : materialInfo.capturedByWhite.map((p, idx) => <span key={idx}>{p.symbol}</span>)}
              </div>
            </div>
            {isThinking && <div className="spinner" />}
          </div>
          
          {selectedTime.value > 0 && gameMode === 'bot' && (
            <div style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ⏱️ {formatTime(actualColor === 'white' ? botTime : playerTime)}
            </div>
          )}
        </div>

        {/* Pass customPieces inside options to Chessboard */}
        <div className="board-wrapper">
          <Chessboard options={chessboardOptions} />
          
          {promotionPending && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(10, 14, 26, 0.92)',
              backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', zIndex: 100, borderRadius: '8px'
            }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                Select Promotion Piece
              </h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { key: 'q', label: 'Queen', emoji: promotionPending.color === 'w' ? '♕' : '♛' },
                  { key: 'r', label: 'Rook', emoji: promotionPending.color === 'w' ? '♖' : '♜' },
                  { key: 'b', label: 'Bishop', emoji: promotionPending.color === 'w' ? '♗' : '♝' },
                  { key: 'n', label: 'Knight', emoji: promotionPending.color === 'w' ? '♘' : '♞' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSelectPromotion(item.key)}
                    className="btn btn-secondary"
                    style={{ width: '60px', height: '60px', fontSize: '2rem', padding: 0 }}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Board Move Navigation */}
        {!isReviewMode && (
          <div className="navigation-controls" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '0.8rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToMove(0)} disabled={currentMoveIndex === 0}>«</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToMove(currentMoveIndex - 1)} disabled={currentMoveIndex === 0}>‹ Prev</button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Move {currentMoveIndex} / {pastFens.length - 1}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToMove(currentMoveIndex + 1)} disabled={currentMoveIndex === pastFens.length - 1}>Next ›</button>
            <button className="btn btn-secondary btn-sm" onClick={() => jumpToMove(pastFens.length - 1)} disabled={currentMoveIndex === pastFens.length - 1}>»</button>
          </div>
        )}

        {isReviewMode && (
          <div className="navigation-controls" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '0.8rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setReviewIndex(0)} disabled={reviewIndex === 0}>«</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setReviewIndex(prev => Math.max(0, prev - 1))} disabled={reviewIndex === 0}>‹ Prev</button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Review {reviewIndex} / {reviewHistory.length}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => setReviewIndex(prev => Math.min(reviewHistory.length, prev + 1))} disabled={reviewIndex === reviewHistory.length}>Next ›</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setReviewIndex(reviewHistory.length)} disabled={reviewIndex === reviewHistory.length}>»</button>
          </div>
        )}

        {/* Bottom Player Panel */}
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {playerLabel}
                {actualColor === 'white' ? (
                  materialInfo.diff > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: '700' }}>+{materialInfo.diff}</span>
                ) : (
                  materialInfo.diff < 0 && <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: '700' }}>+{Math.abs(materialInfo.diff)}</span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                {actualColor === 'white'
                  ? materialInfo.capturedByWhite.map((p, idx) => <span key={idx}>{p.symbol}</span>)
                  : materialInfo.capturedByBlack.map((p, idx) => <span key={idx}>{p.symbol}</span>)}
              </div>
            </div>
          </div>
          
          {selectedTime.value > 0 && gameMode === 'bot' && (
            <div style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--font-mono)', background: 'rgba(79,140,255,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--accent)' }}>
              ⏱️ {formatTime(actualColor === 'white' ? playerTime : botTime)}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Controls Panel */}
      <div className="controls-panel">
        {isReviewMode ? (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '440px', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCloseReview}>
                ← Close Review
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--gold)' }}>
                Game Review 🔍
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Performance Rating</div>
              </div>
            </div>

            {analysisData?.turningPoint && (
              <div style={{ padding: '8px 10px', background: 'rgba(248,113,113,0.08)', borderLeft: '3px solid var(--danger)', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', lineHeight: 1.4 }}>
                <strong>⚡ Key Turning Point:</strong> Move {analysisData.turningPoint.moveNum} ({analysisData.turningPoint.player}) — {analysisData.turningPoint.san} ({analysisData.turningPoint.classification})
              </div>
            )}

            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '6px' }}>
              {[
                { key: 'all', label: 'All Moves' },
                { key: 'mistakes', label: 'Blunders' },
                { key: 'brilliant', label: 'Highlights' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setReviewFilter(key)}
                  className={`btn btn-sm ${reviewFilter === key ? '' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem' }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '140px' }}>
              {reviewIndex === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', padding: '10px' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏁</div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Initial Board Position</strong>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Use Next or click any move below to step through analysis.</p>
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
                          Move {m.moveNum || Math.floor((reviewIndex - 1)/2)+1}: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{m.san}</strong> ({m.color === 'w' ? 'White' : 'Black'})
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: cat.color, background: `${cat.color}15`, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${cat.color}33` }}>
                          {cat.emoji} {cat.label}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {m.commentary}
                      </p>

                      {m.whatWentWrong && (
                        <div style={{ fontSize: '0.75rem', padding: '6px 8px', background: 'rgba(248,113,113,0.08)', borderLeft: '3px solid var(--danger)', borderRadius: '0 4px 4px 0', marginTop: '2px', color: '#fca5a5' }}>
                          {m.whatWentWrong}
                        </div>
                      )}

                      {m.preventativeMove && (
                        <div style={{ fontSize: '0.75rem', padding: '6px 8px', background: 'rgba(52,211,153,0.08)', borderLeft: '3px solid #34d399', borderRadius: '0 4px 4px 0', marginTop: '2px', color: '#a7f3d0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>{m.preventativeMove}</div>
                          {m.bestMoveFrom && m.bestMoveTo && (
                            <button
                              onClick={() => setShowPreventativeOnBoard(!showPreventativeOnBoard)}
                              className="btn btn-sm"
                              style={{ alignSelf: 'flex-start', padding: '2px 8px', fontSize: '0.68rem', background: showPreventativeOnBoard ? '#10b981' : 'rgba(52,211,153,0.2)', border: '1px solid #34d399', color: '#fff' }}
                            >
                              {showPreventativeOnBoard ? '✓ Hiding Idea on Board' : '💡 Show Alternative on Board'}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>

            <div className="move-history" style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', padding: '2px' }}>
                {filteredReviewList.map((m) => {
                  const cat = getMoveCategoryInfo(m.classification);
                  const isCurrent = reviewIndex === m.index;
                  return (
                    <div
                      key={m.index}
                      onClick={() => { setReviewIndex(m.index); setShowPreventativeOnBoard(false); }}
                      style={{
                        padding: '6px 8px',
                        background: isCurrent ? 'rgba(201, 162, 39, 0.18)' : 'rgba(255,255,255,0.01)',
                        border: isCurrent ? '1px solid var(--gold)' : '1px solid var(--border)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: '500', fontFamily: 'var(--font-mono)' }}>
                        {m.moveNum || Math.floor((m.index - 1)/2)+1}.{m.color === 'w' ? '' : '..'} {m.san}
                      </span>
                      <span style={{ fontSize: '0.85rem' }} title={cat.label}>
                        {cat.emoji}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '6px' }}>
              <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={handleCloseReview}>
                🏠 Main Menu
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

            {isGameOverState && (
              <div className="slide-in" style={{ padding: '12px', background: 'rgba(201,162,39,0.08)', border: '1px solid var(--gold)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏆</div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--gold)' }}>Match Finished!</strong>
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={startInteractiveReview}>
                    🔍 Review Game
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setGameState('menu'); setIsGameOverState(false); }}>
                    🏠 Main Menu
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '2px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', userSelect: 'none', flex: 1, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <input type="checkbox" checked={showDanger} onChange={(e) => setShowDanger(e.target.checked)} />
                ⚠️ Danger
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', userSelect: 'none', flex: 1, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <input type="checkbox" checked={useTutor} onChange={(e) => setUseTutor(e.target.checked)} />
                🎓 Tutor
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', userSelect: 'none', padding: '5px 8px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
                🔊 Sound
              </label>
            </div>

            {useTutor && tutorTip && (
              <div className="slide-in" style={{ padding: '8px 12px', background: 'rgba(79,140,255,0.05)', borderLeft: '3px solid var(--accent)', borderRadius: '0 6px 6px 0', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {tutorTip}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.25rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('move_history')}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pairedMoves.length} moves</span>
            </div>

            <div className="move-history" style={{ flex: 1, overflowY: 'auto' }}>
              {pairedMoves.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem' }}>Tap a piece to select, then tap your destination square.</p>
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
                            padding: '6px', fontWeight: '500', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', cursor: 'pointer',
                            backgroundColor: currentMoveIndex === whiteMoveIdx ? 'rgba(201, 162, 39, 0.2)' : 'transparent', borderRadius: '4px'
                          }}
                          onClick={() => jumpToMove(whiteMoveIdx)}
                        >
                          {pair.white}
                        </td>
                        <td 
                          style={{ 
                            padding: '6px', fontWeight: '500', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer',
                            backgroundColor: currentMoveIndex === blackMoveIdx ? 'rgba(201, 162, 39, 0.2)' : 'transparent', borderRadius: '4px'
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

            {!isGameOverState ? (
              <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={handleResign} disabled={isThinking || gameRef.current.isGameOver()}>🏳️ Resign</button>
                {gameMode === 'bot' && (
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={handleOfferDraw} disabled={isThinking || gameRef.current.isGameOver()}>🤝 Draw</button>
                )}
                <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={handleQuitOrAbandon}>✕ Quit</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={startInteractiveReview}>🔍 Game Review</button>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setGameState('menu'); setIsGameOverState(false); }}>🏠 Main Menu</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ABANDON CONFIRMATION MODAL */}
      {showAbandonPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '20px' }}>
          <div className="glass-panel fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '24px', border: '1px solid var(--danger)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Abandon Match?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Leaving this match now will count as a forfeit loss. Are you sure?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAbandonPrompt(false)}>
                Continue Playing
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmAbandon}>
                Yes, Forfeit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER ANALYSIS OVERLAY MODAL */}
      {showAnalysis && analysisData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
          <div className="glass-panel fade-in" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(201, 162, 39, 0.4)', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
              <h2 style={{ marginBottom: '6px' }}>Game Performance Analysis</h2>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                <span className={`badge ${analysisData.result === '1-0' ? 'badge-win' : analysisData.result === '0-1' ? 'badge-loss' : 'badge-draw'}`} style={{ fontSize: '0.95rem', padding: '6px 16px' }}>
                  {analysisData.result === '1-0' ? '✓ Victory' : analysisData.result === '0-1' ? '✗ Defeat' : '= Draw'}
                </span>
                
                {/* REQUEST 5: ELO CHANGE BADGE */}
                {analysisData.eloChange !== undefined && (
                  <span className="badge" style={{
                    fontSize: '0.95rem', padding: '6px 16px',
                    backgroundColor: analysisData.eloChange > 0 ? 'rgba(52,211,153,0.15)' : analysisData.eloChange < 0 ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)',
                    color: analysisData.eloChange > 0 ? '#34d399' : analysisData.eloChange < 0 ? '#f87171' : 'var(--text-muted)',
                    border: `1px solid ${analysisData.eloChange > 0 ? '#34d399' : analysisData.eloChange < 0 ? '#f87171' : 'var(--border)'}`
                  }}>
                    {analysisData.eloChange > 0 ? `+${analysisData.eloChange}` : analysisData.eloChange} ELO (Now {analysisData.ratingAfter || 1200})
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--gold)' }}>{analysisData.accuracy}%</div>
                <div className="stat-label">Accuracy Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--accent)' }}>{analysisData.performanceRating}</div>
                <div className="stat-label">Performance Rating</div>
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Opening Played:</span>
              <strong style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>{analysisData.openingName || 'Standard Opening'}</strong>
            </div>

            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Move Quality Breakdown</h4>
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
                🏠 Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;
