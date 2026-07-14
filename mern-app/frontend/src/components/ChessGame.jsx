import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';

const ChessGame = ({ user }) => {
  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('Game in progress');
  
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
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
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/matches/save`, {
        pgn: game.pgn(),
        result: result,
        accuracy: Math.floor(Math.random() * 20) + 80, // Mock accuracy
        difficulty: 5
      }, {
        headers: { 'x-auth-token': token }
      });
      fetchHistory();
    } catch (err) {
      console.error('Error saving match', err);
    }
  };

  const makeRandomMove = () => {
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    makeAMove(possibleMoves[randomIndex]);
  };

  const makeAMove = (move) => {
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
    return result; // null if move was illegal
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to a queen for example simplicity
    });

    if (move === null) return false;

    // setTimeout to let piece drop animation finish before AI thinks
    setTimeout(makeRandomMove, 200);
    return true;
  };

  const resetGame = () => {
    setGame(new Chess());
    setStatus('Game in progress');
  };

  return (
    <div className="game-container fade-in">
      <div className="glass-panel">
        <h2>{status}</h2>
        <div className="board-wrapper">
          <Chessboard 
            position={game.fen()} 
            onPieceDrop={onDrop}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
            }}
            customDarkSquareStyle={{ backgroundColor: '#58a6ff' }}
            customLightSquareStyle={{ backgroundColor: '#c9d1d9' }}
          />
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={resetGame}>New Game</button>
          <button className="btn btn-secondary" onClick={() => game.undo() && setGame(new Chess(game.fen()))}>Undo Move</button>
        </div>
      </div>
      
      <div className="controls-panel">
        <div className="glass-panel stats-panel">
          <h3>Your Match History</h3>
          <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {history.length === 0 ? (
              <p>No matches played yet.</p>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {history.map((match, i) => (
                  <li key={i} style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{new Date(match.date).toLocaleDateString()}</span>
                    <span style={{ 
                      color: match.result === '1-0' ? 'var(--success-color)' : 
                             match.result === '0-1' ? 'var(--danger-color)' : 'var(--text-color)' 
                    }}>
                      {match.result}
                    </span>
                    <span>Acc: {match.accuracy}%</span>
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
