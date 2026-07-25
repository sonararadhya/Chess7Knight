import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getCustomPieces } from '../utils/pieceSets';

const PUZZLES = [
  { id: 1, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', solution: 'Qxf7', instruction: "White to move — Scholar's Mate!", hint: 'The queen can deliver checkmate on f7 supported by the bishop.', category: 'Checkmate', rating: 600 },
  { id: 2, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5', solution: 'Nxe5', instruction: 'White to move — Win material with tactical trick!', hint: 'A knight sacrifice on e5 wins back central pawns.', category: 'Tactics', rating: 800 },
  { id: 3, fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', solution: 'Nf3', instruction: 'Find the best developing move.', hint: 'Develop your knight to f3 to control the d4 square.', category: 'Opening', rating: 700 },
  { id: 4, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', solution: 'Ng5', instruction: 'Attack the vulnerable f7 square!', hint: 'Move your knight to g5 to double attack f7 alongside your bishop.', category: 'Attack', rating: 900 },
  { id: 5, fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', solution: 'Re8', instruction: 'White to move — Deliver back-rank checkmate!', hint: 'The enemy pawns lock in the king. Slide your rook to e8!', category: 'Checkmate', rating: 800 },
  { id: 6, fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', solution: 'e5', instruction: 'Black to move — Best response to 1.e4', hint: 'Mirror White\'s central pawn move to contest e4.', category: 'Opening', rating: 600 },
  { id: 7, fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6', solution: 'O-O', instruction: 'Castle your king to safety!', hint: 'Short castling (O-O) safeguards the king and activates the f1 rook.', category: 'Strategy', rating: 700 },
  { id: 8, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P1b1/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5', solution: 'Bxf7', instruction: 'Sacrifice the bishop to break black\'s setup!', hint: 'The bishop strike on f7 deprives the black king of castling rights.', category: 'Sacrifice', rating: 1100 },
  { id: 9, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 4', solution: 'Be2', instruction: 'Develop your bishop safely.', hint: 'Position your bishop on e2 to prepare kingside castling.', category: 'Opening', rating: 750 },
  { id: 10, fen: '4r1k1/ppp2ppp/8/3Pp3/8/8/PPP2PPP/R3R1K1 w - - 0 1', solution: 'd6', instruction: 'Push the passed pawn!', hint: 'Pushing d6 forces the black defense to overcommit.', category: 'Endgame', rating: 900 },
  { id: 11, fen: '6rk/5Npp/8/8/8/8/8/6K1 w - - 0 1', solution: 'Nf7', instruction: 'Deliver the famous Smothered Mate!', hint: 'The black king is trapped by its own pieces. Jump your knight to f7!', category: 'Checkmate', rating: 1200 },
  { id: 12, fen: 'r1b2rk1/ppp2ppp/2n5/4p3/2B5/3P1Q2/PPP2PPP/R3K2R w KQ - 0 1', solution: 'Qxf7', instruction: 'Exploit the weak f7 square!', hint: 'Combine Queen and Bishop power on f7 to deliver checkmate.', category: 'Checkmate', rating: 1050 },
  { id: 13, fen: '4k3/8/8/4q3/8/8/8/R3K3 w - - 0 1', solution: 'Ra8', instruction: 'Deliver a powerful Rook Skewer!', hint: 'Check the king along the 8th rank. Once the king moves, pick up the undefended queen!', category: 'Skewer', rating: 1150 },
  { id: 14, fen: 'r1bqk2r/pppp1ppp/2n5/4P3/1b2n3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 6', solution: 'Bd2', instruction: 'Shield your king and neutralize the pin.', hint: 'Interpose your bishop on d2 to break the pinning line on your c3 knight.', category: 'Tactics', rating: 850 },
  { id: 15, fen: 'r3k3/8/8/8/8/8/3Q4/4K3 w - - 0 1', solution: 'Qe3', instruction: 'Fork the enemy King and Rook!', hint: 'Place your Queen on e3 to deliver check while simultaneously attacking the a7/a8 rook line.', category: 'Fork', rating: 1000 },
  { id: 16, fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', solution: 'Rxd8', instruction: 'Capture the undefended rook on d8!', hint: 'Capture directly on d8 to deliver an immediate back-rank checkmate.', category: 'Tactics', rating: 750 },
  { id: 17, fen: '1R6/3k4/8/3P4/8/8/3K4/8 w - - 0 1', solution: 'Rb7', instruction: 'White to move — Drive the enemy king away!', hint: 'Deliver check on b7 to push the black king onto the c-file.', category: 'Endgame', rating: 1100 },
  { id: 18, fen: 'r1bq1rk1/ppp2ppp/2n5/3np3/2B5/3P1N2/PPP2PPP/R1BQ1RK1 w - - 0 1', solution: 'Bxf7', instruction: 'Sacrifice your Bishop on f7!', hint: 'Sacrifice on f7 to strip the king of its pawn shield.', category: 'Sacrifice', rating: 1250 },
  { id: 19, fen: 'rnb1k2r/ppppqppp/5n2/4p3/1b2P3/2N2N2/PPPPQPPP/R1B1KB1R w KQkq - 4 5', solution: 'Nd5', instruction: 'Centralize the Knight with tempo!', hint: 'Jump your Knight to d5 to attack the black Queen while gaining space.', category: 'Attack', rating: 950 },
  { id: 20, fen: 'r1b1k2r/pppp1ppp/2n2n2/q3p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5', solution: 'a3', instruction: 'Trap the Black Queen!', hint: 'Play a3 to prepare b4, trapping the overextended Queen on the edge.', category: 'Tactics', rating: 1300 },
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

  // Pass customPieces as 'pieces' prop & theme darkSquareStyle / lightSquareStyle directly into Chessboard options
  const chessboardOptions = useMemo(() => ({
    id: 'puzzle-board',
    position: fen,
    pieces: customPieces,
    onPieceDrop: onDrop,
    onSquareClick: onSquareClick,
    animationDurationInMs: 200,
    boardStyle: { borderRadius: '10px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' },
    squareStyles: optionSquares,
    darkSquareStyle: theme.darkSquareStyle || { backgroundColor: theme.darkSquare },
    lightSquareStyle: theme.lightSquareStyle || { backgroundColor: theme.lightSquare },
    canDragPiece: () => !completed,
    boardOrientation: puzzle.fen.includes(' b ') ? 'black' : 'white',
    showNotation: true,
  }), [fen, onDrop, onSquareClick, optionSquares, theme, completed, puzzle, customPieces]);

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
          <Chessboard options={chessboardOptions} />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowHint(!showHint)}>💡 {showHint ? t('hide_hint') : t('show_hint')}</button>
          <button className="btn btn-secondary btn-sm" onClick={() => loadPuzzle(currentPuzzle)}>↺ {t('restart')}</button>
          {currentPuzzle + 1 < PUZZLES.length && (
            <button className="btn btn-sm" onClick={() => loadPuzzle(currentPuzzle + 1)}>Skip →</button>
          )}
        </div>

        {showHint && (
          <div className="slide-in" style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.2)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--accent)', textAlign: 'left', lineHeight: 1.5 }}>
            <strong>💡 Hint:</strong> {puzzle.hint}
          </div>
        )}
      </div>
    </div>
  );
};

export default Puzzles;
