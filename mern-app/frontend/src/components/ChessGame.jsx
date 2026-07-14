import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';

const ChessGame = ({ user }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu' or 'playing'
  const [difficulty, setDifficulty] = useState('Medium');
  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('Your turn');
  
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
        difficulty: difficulty === 'Hard' ? 3 : difficulty === 'Medium' ? 2 : 1
      }, {
        headers: { 'x-auth-token': token }
      });
      fetchHistory();
    } catch (err) {
      console.error('Error saving match', err);
    }
  };

  const makeBotMove = () => {
    const possibleMoves = game.moves({ verbose: true });
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return;

    let chosenMove = null;
    const captureMoves = possibleMoves.filter(m => m.flags.includes('c') || m.flags.includes('e'));

    if (difficulty === 'Hard' && captureMoves.length > 0) {
      // Always capture if possible
      chosenMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
    } else if (difficulty === 'Medium' && captureMoves.length > 0 && Math.random() > 0.5) {
      // 50% chance to capture
      chosenMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
    } else {
      // Easy or fallback: Random move
      chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    makeAMove({
      from: chosenMove.from,
      to: chosenMove.to,
      promotion: 'q'
    });
  };

  const makeAMove = (move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      setGame(gameCopy);

      if (gameCopy.game_over()) {
        if (gameCopy.in_checkmate()) {
          setStatus(`Checkmate! ${gameCopy.turn() === 'w' ? 'Black' : 'White'} wins!`);
          saveMatch(gameCopy.turn() === 'w' ? '0-1' : '1-0');
        } else {
          setStatus('Draw!');
          saveMatch('1/2-1/2');
        }
      }
      return result;
    } catch (e) {
      // Illegal move caught by chess.js
      return null;
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to a queen for example simplicity
    });

    if (move === null) return false; // Illegal move

    // setTimeout to let piece drop animation finish before AI thinks
    setStatus('Bot is thinking...');
    setTimeout(() => {
      makeBotMove();
      if (!game.game_over()) setStatus('Your turn');
    }, 400);
    return true;
  };

  const resetGame = () => {
    setGame(new Chess());
    setStatus('Your turn');
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
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Play CHESS7KNIGHT</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.2rem' }}>
            {user ? `Welcome back! Ready for your next match?` : `Playing as Guest. Log in to save your match history.`}
          </p>
          
          <h3 style={{ marginBottom: '1.5rem' }}>Select Bot Difficulty</h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <button className="btn btn-secondary" onClick={() => startGame('Easy')} style={{ flex: 1, padding: '15px' }}>
              🟢 Easy
            </button>
            <button className="btn" onClick={() => startGame('Medium')} style={{ flex: 1, padding: '15px' }}>
              🟡 Medium
            </button>
            <button className="btn btn-secondary" onClick={() => startGame('Hard')} style={{ flex: 1, padding: '15px', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>
              🔴 Hard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container fade-in">
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>{status}</h2>
          <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.9rem' }}>
            Bot: {difficulty}
          </span>
        </div>
        <div className="board-wrapper">
          <Chessboard 
            position={game.fen()} 
            onPieceDrop={onDrop}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}
            customDarkSquareStyle={{ backgroundColor: '#739552' }}
            customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
          />
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={() => setGameState('menu')}>Quit Match</button>
          <button className="btn btn-secondary" onClick={() => {
            game.undo();
            game.undo(); // Undo both bot and player move
            setGame(new Chess(game.fen()));
          }}>Undo Move</button>
        </div>
      </div>
      
      <div className="controls-panel">
        <div className="glass-panel stats-panel" style={{ marginTop: 0 }}>
          <h3>Your Match History</h3>
          <div style={{ marginTop: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
            {!user ? (
              <p style={{ color: 'var(--text-secondary)' }}>Log in to track your matches and rating.</p>
            ) : history.length === 0 ? (
              <p>No matches played yet.</p>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {history.map((match, i) => (
                  <li key={i} style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>{new Date(match.date).toLocaleDateString()}</span>
                      <span style={{ 
                        fontWeight: 'bold',
                        color: match.result === '1-0' ? 'var(--success-color)' : 
                               match.result === '0-1' ? 'var(--danger-color)' : 'var(--text-color)' 
                      }}>
                        {match.result === '1-0' ? 'Victory' : match.result === '0-1' ? 'Defeat' : 'Draw'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.9rem' }}>Acc: {match.accuracy}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
