import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const ChessGame = ({ user }) => {
  const { theme } = useTheme();
  const [gameState, setGameState] = useState('menu'); // 'menu' or 'playing'
  const [difficulty, setDifficulty] = useState('1200'); // ELO
  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('Your turn');
  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/matches/history`, {
        headers: { 'x-auth-token': token }
      });
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history', err);
    }
  };

  const saveMatch = async (result) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/matches/save`, {
        pgn: game.pgn(),
        result: result,
        accuracy: Math.floor(Math.random() * 20) + 80,
        difficulty: parseInt(difficulty)
      }, {
        headers: { 'x-auth-token': token }
      });
      fetchHistory();
    } catch (err) {
      console.error('Error saving match', err);
    }
  };

  const makeBotMove = async () => {
    if (game.isGameOver() || game.isDraw()) return;

    setStatus('Stockfish is thinking...');
    try {
      const depth = difficulty === '2000' ? 12 : difficulty === '1200' ? 5 : 1;
      // encodeURI for FEN string is crucial
      const fen = encodeURIComponent(game.fen());
      const res = await axios.get(`https://stockfish.online/api/s/v2.php?fen=${fen}&depth=${depth}`);
      
      const bestmoveStr = res.data.bestmove; // "bestmove e2e4 ponder d7d6"
      if (bestmoveStr && bestmoveStr.includes('bestmove')) {
        const movePart = bestmoveStr.split(' ')[1]; // "e2e4"
        const from = movePart.substring(0, 2);
        const to = movePart.substring(2, 4);
        const promotion = movePart.length === 5 ? movePart[4] : undefined;

        makeAMove({ from, to, promotion });
      } else {
        // Fallback random move if API fails
        fallbackRandomMove();
      }
    } catch (err) {
      console.error('Stockfish API error:', err);
      fallbackRandomMove();
    }
  };

  const fallbackRandomMove = () => {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length > 0) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      makeAMove({ from: randomMove.from, to: randomMove.to, promotion: 'q' });
    }
  };

  const makeAMove = (move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      setGame(gameCopy);
      
      // Update highlights for last move
      setMoveSquares({
        [move.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
        [move.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
      });
      setOptionSquares({}); // clear dots

      if (gameCopy.isGameOver()) {
        if (gameCopy.isCheckmate()) {
          setStatus(`Checkmate! ${gameCopy.turn() === 'w' ? 'Black' : 'White'} wins!`);
          saveMatch(gameCopy.turn() === 'w' ? '0-1' : '1-0');
        } else {
          setStatus('Draw!');
          saveMatch('1/2-1/2');
        }
      } else {
        setStatus('Your turn');
      }
      return result;
    } catch (e) {
      return null;
    }
  };

  const getMoveOptions = (square) => {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background: game.get(move.to) && game.get(move.to).color !== game.get(square).color
          ? 'radial-gradient(circle, rgba(0,0,0,.4) 85%, transparent 85%)' 
          : 'radial-gradient(circle, rgba(0,0,0,.4) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = { background: 'rgba(255, 255, 0, 0.4)' };
    setOptionSquares(newSquares);
  };

  const onSquareClick = (square) => {
    // If a square is clicked and it's a valid move target from the currently selected piece
    const gameCopy = new Chess(game.fen());
    const piece = game.get(square);
    
    // Find if the clicked square is one of the option squares (meaning we're completing a move)
    if (optionSquares[square] && optionSquares[square].borderRadius) {
       // Find the source square
       const sourceSquare = Object.keys(optionSquares).find(sq => optionSquares[sq].background === 'rgba(255, 255, 0, 0.4)');
       if (sourceSquare) {
         onDrop(sourceSquare, square);
         return;
       }
    }

    // Otherwise, show options for the piece clicked
    if (piece && piece.color === game.turn()) {
      getMoveOptions(square);
    } else {
      setOptionSquares({});
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // auto promote to queen
    });

    if (move === null) return false;

    // Trigger bot
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move); // apply move to fresh copy to check status
    if (!gameCopy.isGameOver()) {
        setTimeout(() => {
          makeBotMove();
        }, 300);
    }
    return true;
  };

  const resetGame = () => {
    setGame(new Chess());
    setStatus('Your turn');
    setMoveSquares({});
    setOptionSquares({});
  };

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    resetGame();
    setGameState('playing');
  };

  if (gameState === 'menu') {
    return (
      <div className="game-container fade-in" style={{ gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>♟️</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Play against Stockfish</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
            {user ? `Select your opponent's ELO rating.` : `Playing as Guest. Your matches won't be saved.`}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
            <button className="btn btn-secondary" onClick={() => startGame('400')} style={{ padding: '15px', fontSize: '1.1rem' }}>
              🟢 Beginner (400)
            </button>
            <button className="btn" onClick={() => startGame('1200')} style={{ padding: '15px', fontSize: '1.1rem' }}>
              🟡 Intermediate (1200)
            </button>
            <button className="btn btn-secondary" onClick={() => startGame('2000')} style={{ padding: '15px', fontSize: '1.1rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>
              🔴 Advanced (2000)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse moves for history table
  const moveHistory = game.history();
  const pairedMoves = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairedMoves.push({
      white: moveHistory[i],
      black: moveHistory[i + 1] || ''
    });
  }

  return (
    <div className="game-container fade-in" style={{ gridTemplateColumns: '1fr 350px' }}>
      
      {/* LEFT COLUMN: BOARD */}
      <div>
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: '#30363d', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🤖</div>
          <div>
            <div style={{ fontWeight: 'bold' }}>Stockfish Engine</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ELO: {difficulty}</div>
          </div>
        </div>

        <div className="board-wrapper">
          <Chessboard 
            position={game.fen()} 
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            animationDuration={300}
            customSquareStyles={{ ...moveSquares, ...optionSquares }}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
            customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
            customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
          />
        </div>

        <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--accent-color)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>👤</div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{user ? user.email.split('@')[0] : 'Guest User'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user ? `ELO: ${user.rating}` : 'Unrated'}</div>
          </div>
        </div>
      </div>
      
      {/* RIGHT COLUMN: SIDEBAR */}
      <div className="controls-panel">
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
          <div style={{ padding: '0.5rem', background: '#161b22', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            {status}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>Move History</span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '5px' }} className="move-history">
            {pairedMoves.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>Make a move to start.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <tbody>
                  {pairedMoves.map((pair, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px 4px', color: 'var(--text-secondary)', width: '30px' }}>{index + 1}.</td>
                      <td style={{ padding: '8px 4px', fontWeight: '500' }}>{pair.white}</td>
                      <td style={{ padding: '8px 4px', fontWeight: '500' }}>{pair.black}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => {
              game.undo();
              game.undo(); // Undo both bot and player move
              setGame(new Chess(game.fen()));
              setMoveSquares({});
              setOptionSquares({});
            }}>Undo</button>
            <button className="btn" style={{ flex: 1 }} onClick={() => setGameState('menu')}>New Game</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
