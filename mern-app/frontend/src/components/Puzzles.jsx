import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getCustomPieces } from '../utils/pieceSets';

const PUZZLES = [
  { id: 1, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', solution: 'Qxf7', instruction: 'White to move — Scholar\'s Mate!', hint: 'The queen can deliver checkmate on f7.', category: 'Checkmate', rating: 600 },
  { id: 2, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5', solution: 'Nxe5', instruction: 'White to move — Win material!', hint: 'A knight can capture the e5 pawn safely.', category: 'Tactics', rating: 800 },
  { id: 3, fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', solution: 'Nf3', instruction: 'Find the best developing move.', hint: 'Develop a knight toward the center.', category: 'Opening', rating: 700 },
  { id: 4, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', solution: 'Ng5', instruction: 'Attack the vulnerable f7 square!', hint: 'Move your knight to threaten f7.', category: 'Attack', rating: 900 },
  { id: 5, fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', solution: 'Re8', instruction: 'White to move — Deliver checkmate!', hint: 'The rook can deliver a back rank mate.', category: 'Checkmate', rating: 800 },
  { id: 6, fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', solution: 'e5', instruction: 'Black to move — Best response to 1.e4', hint: 'Mirror White\'s move to control the center.', category: 'Opening', rating: 600 },
  { id: 7, fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6', solution: 'O-O', instruction: 'Castle to safety!', hint: 'Castling protects your king and activates your rook.', category: 'Strategy', rating: 700 },
  { id: 8, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P1b1/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5', solution: 'Bxf7', instruction: 'Sacrifice the bishop!', hint: 'The bishop sacrifice on f7 wins the black king\'s safety.', category: 'Sacrifice', rating: 1100 },
  { id: 9, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 4', solution: 'Be2', instruction: 'Develop your bishop safely.', hint: 'Put the bishop on a safe developing square.', category: 'Opening', rating: 750 },
  { id: 10, fen: '4r1k1/ppp2ppp/8/3Pp3/8/8/PPP2PPP/R3R1K1 w - - 0 1', solution: 'd6', instruction: 'Push the passed pawn!', hint: 'Advanced passed pawns are very powerful.', category: 'Endgame', rating: 900 },
];

const Puzzles = () => {
  const { theme, pieceSetId } = useTheme();
  const { t } = useLanguage();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [solved, setSolved] = useState(0);

  const gameRef = useRef(new Chess(PUZZLES[0].fen));
  const [fen, setFen] = useState(gameRef.current.fen());
  const [status, setStatus] = useState(PUZZLES[0].instruction);
  const [statusType, setStatusType] = useState('info');
  const [showHint, setShowHint] = useState(false);
  const [moveFrom, setMoveFrom] = useState(null);
  const [optionSquares, setOptionSquares] = useState({});
  const [completed, setCompleted] = useState(false);
  const [boardWidth, setBoardWidth] = useState(480);

  const customPieces = useMemo(() => getCustomPieces(pieceSetId), [pieceSetId]);
  const puzzle = PUZZLES[currentPuzzle];

  useEffect(() => {
    const updateSize = () => setBoardWidth(Math.min(500, window.innerWidth - 48));
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const loadPuzzle = useCallback((index) => {
    gameRef.current = new Chess(PUZZLES[index].fen);
    setFen(gameRef.current.fen());
    setCurrentPuzzle(index);
    setStatus(PUZZLES[index].instruction);
    setStatusType('info');
    setShowHint(false);
    setMoveFrom(null);
    setOptionSquares({});
    setCompleted(false);
  }, []);

  const tryMove = useCallback((from, to) => {
    if (completed) return false;
    try {
      const result = gameRef.current.move({ from, to, promotion: 'q' });
      if (!result) return false;
      setFen(gameRef.current.fen());
      setOptionSquares({});
      setMoveFrom(null);

      if (result.san === puzzle.solution) {
        setStatus(`✓ ${t('correct')}`);
        setStatusType('success');
        setCompleted(true);
        setSolved(s => s + 1);
        setStreak(s => { const n = s + 1; if (n > bestStreak) setBestStreak(n); return n; });
        setTimeout(() => {
          if (currentPuzzle + 1 < PUZZLES.length) loadPuzzle(currentPuzzle + 1);
          else { setStatus(`🏆 ${t('all_solved')}`); setStatusType('success'); }
        }, 1800);
      } else {
        setStatus(`✗ ${t('incorrect')}`);
        setStatusType('error');
        setStreak(0);
        setTimeout(() => {
          gameRef.current = new Chess(puzzle.fen);
          setFen(gameRef.current.fen());
          setStatus(puzzle.instruction);
          setStatusType('info');
        }, 1500);
      }
      return true;
    } catch { return false; }
  }, [completed, currentPuzzle, puzzle, loadPuzzle, t, bestStreak]);

  const getMoveOptions = useCallback((square) => {
    const moves = gameRef.current.moves({ square, verbose: true });
    if (moves.length === 0) { setOptionSquares({}); return false; }
    const newSquares = {};
    moves.forEach(m => {
      const isCapture = gameRef.current.get(m.to);
      newSquares[m.to] = {
        background: isCapture
          ? 'radial-gradient(circle, rgba(248,113,113,.6) 65%, transparent 65%)'
          : 'radial-gradient(circle, rgba(79,140,255,.5) 26%, transparent 26%)',
        borderRadius: '50%',
      };
    });
    newSquares[square] = { backgroundColor: 'rgba(201, 162, 39, 0.5)' };
    setOptionSquares(newSquares);
    return true;
  }, []);

  const onSquareClick = useCallback(({ square } = {}) => {
    if (!square || completed) return;
    const turn = gameRef.current.turn();
    if (moveFrom) {
      const success = tryMove(moveFrom, square);
      if (!success) {
        const piece = gameRef.current.get(square);
        if (piece && piece.color === turn) {
          const hasMoves = getMoveOptions(square);
          if (hasMoves) setMoveFrom(square);
          else { setMoveFrom(null); setOptionSquares({}); }
        } else { setMoveFrom(null); setOptionSquares({}); }
      }
      return;
    }
    const piece = gameRef.current.get(square);
    if (piece && piece.color === turn) {
      const hasMoves = getMoveOptions(square);
      if (hasMoves) setMoveFrom(square);
    }
  }, [completed, moveFrom, tryMove, getMoveOptions]);

  const onDrop = useCallback(({ sourceSquare, targetSquare } = {}) => {
    if (!sourceSquare || !targetSquare) return false;
    return tryMove(sourceSquare, targetSquare);
  }, [tryMove]);

  const chessboardOptions = useMemo(() => ({
    id: 'puzzle-board',
    position: fen,
    onPieceDrop: onDrop,
    onSquareClick: onSquareClick,
    animationDurationInMs: 200,
    boardStyle: { borderRadius: '8px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' },
    squareStyles: optionSquares,
    darkSquareStyle: { backgroundColor: theme.darkSquare },
    lightSquareStyle: { backgroundColor: theme.lightSquare },
    customPieces: customPieces,
    canDragPiece: () => !completed,
    boardOrientation: puzzle.fen.includes(' b ') ? 'black' : 'white',
    showNotation: true,
  }), [fen, onDrop, onSquareClick, optionSquares, theme, customPieces, completed, puzzle]);

  const statusStyle = {
    info: { borderColor: 'var(--accent)', color: 'var(--accent)' },
    success: { borderColor: 'var(--success)', color: 'var(--success)' },
    error: { borderColor: 'var(--danger)', color: 'var(--danger)' },
  }[statusType];

  return (
    <div className="fade-in" style={{ maxWidth: '640px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { val: solved, label: 'Solved', color: 'var(--success)' },
          { val: streak, label: 'Streak 🔥', color: 'var(--warning)' },
          { val: bestStreak, label: 'Best', color: 'var(--gold)' },
        ].map(({ val, label, color }) => (
          <div key={label} className="stat-card" style={{ flex: 1, padding: '0.6rem' }}>
            <div className="stat-value" style={{ fontSize: '1.4rem', color }}>{val}</div>
            <div className="stat-label" style={{ fontSize: '0.7rem' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>{t('puzzles')} #{currentPuzzle + 1}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge" style={{ background: 'rgba(201,162,39,0.1)', color: 'var(--gold)', border: '1px solid rgba(201,162,39,0.2)' }}>{puzzle.category}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{currentPuzzle + 1}/{PUZZLES.length}</span>
          </div>
        </div>

        <div className="progress-bar-track" style={{ marginBottom: '1rem' }}>
          <div className="progress-bar-fill" style={{ width: `${((currentPuzzle + (completed ? 1 : 0)) / PUZZLES.length) * 100}%` }} />
        </div>

        <div className="status-bar" style={{ marginBottom: '1rem', ...statusStyle }}>{status}</div>

        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Chessboard
            options={chessboardOptions}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowHint(!showHint)}>💡 {showHint ? t('hide_hint') : t('show_hint')}</button>
          <button className="btn btn-secondary btn-sm" onClick={() => loadPuzzle(currentPuzzle)}>↺ {t('restart')}</button>
          {currentPuzzle + 1 < PUZZLES.length && (
            <button className="btn btn-sm" onClick={() => loadPuzzle(currentPuzzle + 1)}>Skip →</button>
          )}
        </div>

        {showHint && (
          <div className="slide-in" style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.2)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--accent)' }}>
            💡 {puzzle.hint}
          </div>
        )}
      </div>
    </div>
  );
};

export default Puzzles;
