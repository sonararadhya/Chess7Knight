import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useTheme } from '../contexts/ThemeContext';

const PUZZLES = [
  {
    id: 1,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
    solution: 'Nxe5', // very basic placeholder
    instruction: 'White to move and gain an advantage.'
  },
  {
    id: 2,
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    solution: 'Nf3',
    instruction: 'Find the best developing move for White.'
  }
];

const Puzzles = () => {
  const { theme } = useTheme();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [game, setGame] = useState(new Chess(PUZZLES[0].fen));
  const [status, setStatus] = useState(PUZZLES[0].instruction);

  const onDrop = (sourceSquare, targetSquare) => {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) return false;

      setGame(gameCopy);

      if (move.san === PUZZLES[currentPuzzle].solution) {
        setStatus('Correct! Well done.');
        setTimeout(() => {
          if (currentPuzzle + 1 < PUZZLES.length) {
            setCurrentPuzzle(currentPuzzle + 1);
            setGame(new Chess(PUZZLES[currentPuzzle + 1].fen));
            setStatus(PUZZLES[currentPuzzle + 1].instruction);
          } else {
            setStatus('You have completed all puzzles!');
          }
        }, 2000);
      } else {
        setStatus('Incorrect. Try again.');
        setTimeout(() => {
          setGame(new Chess(PUZZLES[currentPuzzle].fen));
          setStatus(PUZZLES[currentPuzzle].instruction);
        }, 1500);
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <h2>Puzzle #{currentPuzzle + 1}</h2>
        <p style={{ margin: '1rem 0', color: 'var(--accent-color)' }}>{status}</p>
        
        <div style={{ margin: '0 auto', maxWidth: '500px' }}>
          <Chessboard 
            position={game.fen()} 
            onPieceDrop={onDrop}
            animationDuration={300}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
            customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
            customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
          />
        </div>
      </div>
    </div>
  );
};

export default Puzzles;
