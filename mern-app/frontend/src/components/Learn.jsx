import React from 'react';

const Learn = () => {
  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="glass-panel">
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Learn to Play</h2>
        
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--accent-color)' }}>♟️ The Pawn</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Pawns move forward one square, but capture diagonally. On their very first move, they can choose to move forward two squares.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--accent-color)' }}>♞ The Knight</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Knights move in an 'L' shape: two squares in one direction, and then one square at a right angle. They are the only pieces that can jump over others.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--accent-color)' }}>♝ The Bishop</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Bishops move diagonally any number of squares. They always stay on the same color square they started on.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--accent-color)' }}>♜ The Rook</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Rooks move horizontally or vertically any number of squares.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--accent-color)' }}>♛ The Queen</h3>
            <p style={{ marginTop: '0.5rem' }}>
              The most powerful piece. The Queen can move horizontally, vertically, or diagonally any number of squares.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--accent-color)' }}>♚ The King</h3>
            <p style={{ marginTop: '0.5rem' }}>
              The King can move one square in any direction. If the King is captured (checkmated), the game is over.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
