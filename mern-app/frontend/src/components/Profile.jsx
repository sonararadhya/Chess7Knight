import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Profile = ({ user }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

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

  if (!user) {
    return (
      <div className="fade-in" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="glass-panel">
          <h2>Guest Profile</h2>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            You are currently playing as a guest. Please create an account to track your ELO rating and match history!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ width: '100px', height: '100px', background: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white' }}>
          👤
        </div>
        <div>
          <h2>{user.email.split('@')[0]}</h2>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Rating: <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{user.rating}</span></div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Matches Played: {history.length}</div>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Match History</h3>
        
        {history.length === 0 ? (
          <p>No matches found in your history.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Opponent</th>
                <th style={{ padding: '10px' }}>Result</th>
                <th style={{ padding: '10px' }}>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {history.map((match, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px' }}>{new Date(match.date).toLocaleDateString()}</td>
                  <td style={{ padding: '10px' }}>Bot (ELO {match.difficulty === 3 ? 2000 : match.difficulty === 2 ? 1200 : 400})</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: match.result === '1-0' ? 'var(--success-color)' : match.result === '0-1' ? 'var(--danger-color)' : 'var(--text-color)' }}>
                    {match.result === '1-0' ? 'Victory' : match.result === '0-1' ? 'Defeat' : 'Draw'}
                  </td>
                  <td style={{ padding: '10px' }}>{match.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Profile;
