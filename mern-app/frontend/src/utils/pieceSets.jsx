import React from 'react';

// Piece Set definitions for react-chessboard
// 5 Unique Piece Set Designs:
// 1. staunton - Classic modern vector Staunton
// 2. gothic - Ornate Medieval Gothic Imperial
// 3. cyber - Futuristic Neon Cyberpunk
// 4. metallic - 3D Metallic Glassmorphism
// 5. pixel - Retro 8-Bit Arcade Pixel

export const PIECE_SETS_INFO = {
  staunton: { id: 'staunton', name: 'Staunton Pro', desc: 'Standard tournament high-contrast vector pieces' },
  gothic: { id: 'gothic', name: 'Gothic Imperial', desc: 'Ornate medieval crowns, crests, and battlements' },
  cyber: { id: 'cyber', name: 'Cyber Neon 2077', desc: 'Glowing energy lines with geometric vector cores' },
  metallic: { id: 'metallic', name: '3D Metallic Glass', desc: 'Luminous metallic gradient shading with gloss' },
  pixel: { id: 'pixel', name: 'Pixel Arcade 8-Bit', desc: 'Nostalgic retro gaming 8-bit arcade style' }
};

// Helper SVG renderers for custom piece sets
const renderGothicPiece = (type, isWhite) => {
  const fill = isWhite ? 'url(#gothicWhiteGrad)' : 'url(#gothicBlackGrad)';
  const stroke = isWhite ? '#1e293b' : '#38bdf8';
  const filter = isWhite ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))' : 'drop-shadow(0 0 8px rgba(56,189,248,0.4))';
  
  const symbols = {
    P: '♟',
    N: '♞',
    B: '♝',
    R: '♜',
    Q: '♛',
    K: '♚'
  };

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      <defs>
        <linearGradient id="gothicWhiteGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="gothicBlackGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill={fill} stroke={stroke} strokeWidth="4" />
      <text
        x="50" y="66"
        fontSize="54"
        textAnchor="middle"
        fill={isWhite ? '#0f172a' : '#38bdf8'}
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        {symbols[type]}
      </text>
    </svg>
  );
};

const renderCyberPiece = (type, isWhite) => {
  const stroke = isWhite ? '#00dfd8' : '#ff007f';
  const fill = isWhite ? 'rgba(0, 223, 216, 0.15)' : 'rgba(255, 0, 127, 0.15)';
  const glow = isWhite ? '0 0 12px #00dfd8' : '0 0 12px #ff007f';

  const symbols = {
    P: '▲',
    N: '➞',
    B: '◆',
    R: '▧',
    Q: '❖',
    K: '✦'
  };

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
      <rect x="12" y="12" width="76" height="76" rx="16" fill={fill} stroke={stroke} strokeWidth="3" />
      <polygon points="50,16 84,50 50,84 16,50" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.6" />
      <text
        x="50" y="64"
        fontSize="44"
        textAnchor="middle"
        fill={stroke}
        fontFamily="monospace"
        fontWeight="900"
      >
        {symbols[type]}
      </text>
    </svg>
  );
};

const renderMetallicPiece = (type, isWhite) => {
  const gradId = isWhite ? 'goldGrad' : 'obsidianGrad';
  const symbols = { P: '♟', N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚' };

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))' }}>
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe259" />
          <stop offset="50%" stopColor="#ffa751" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
        <linearGradient id="obsidianGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#434343" />
          <stop offset="50%" stopColor="#1c1c1c" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill={`url(#${gradId})`} stroke={isWhite ? '#fff' : '#666'} strokeWidth="3" />
      <circle cx="50" cy="50" r="38" fill="none" stroke={isWhite ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'} strokeWidth="2" />
      <text
        x="50" y="66"
        fontSize="52"
        textAnchor="middle"
        fill={isWhite ? '#222' : '#f59e0b'}
        fontFamily="sans-serif"
      >
        {symbols[type]}
      </text>
    </svg>
  );
};

const renderPixelPiece = (type, isWhite) => {
  const bg = isWhite ? '#fef08a' : '#1e1b4b';
  const border = isWhite ? '#ca8a04' : '#6366f1';
  const fg = isWhite ? '#713f12' : '#a5b4fc';
  const symbols = { P: 'P', N: 'N', B: 'B', R: 'R', Q: 'Q', K: 'K' };

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="10" width="80" height="80" fill={bg} stroke={border} strokeWidth="6" rx="4" />
      <rect x="18" y="18" width="64" height="64" fill="none" stroke={border} strokeWidth="2" strokeDasharray="4,4" />
      <text
        x="50" y="68"
        fontSize="50"
        textAnchor="middle"
        fill={fg}
        fontFamily="'Courier New', monospace"
        fontWeight="900"
      >
        {symbols[type]}
      </text>
    </svg>
  );
};

export const getCustomPieces = (pieceSetId) => {
  if (!pieceSetId || pieceSetId === 'staunton') {
    return undefined; // Uses react-chessboard's built-in Staunton SVGs
  }

  const pieceTypes = ['P', 'N', 'B', 'R', 'Q', 'K'];
  const pieces = {};

  pieceTypes.forEach((type) => {
    ['w', 'b'].forEach((color) => {
      const isWhite = color === 'w';
      const key = `${color}${type}`;

      pieces[key] = ({ squareWidth }) => {
        if (pieceSetId === 'gothic') return renderGothicPiece(type, isWhite);
        if (pieceSetId === 'cyber') return renderCyberPiece(type, isWhite);
        if (pieceSetId === 'metallic') return renderMetallicPiece(type, isWhite);
        if (pieceSetId === 'pixel') return renderPixelPiece(type, isWhite);
        return renderGothicPiece(type, isWhite);
      };
    });
  });

  return pieces;
};
