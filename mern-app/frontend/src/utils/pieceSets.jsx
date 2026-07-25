import React from 'react';

// Piece Set definitions for react-chessboard
// 6 Unique Piece Set Designs:
// 1. staunton - Classic modern vector Staunton
// 2. woodland - Woodland Nature & Animals (Mushrooms, Bears, Leaves, Tree Stumps - from preferred designs)
// 3. gothic - Ornate Medieval Gothic Imperial
// 4. cyber - Futuristic Neon Cyberpunk
// 5. metallic - 3D Metallic Glassmorphism
// 6. pixel - Retro 8-Bit Arcade Pixel
// 7. royalGold - Royal Kingdom Gold & Marble

export const PIECE_SETS_INFO = {
  staunton: { id: 'staunton', name: 'Staunton Pro', desc: 'Standard tournament high-contrast vector pieces' },
  woodland: { id: 'woodland', name: 'Woodland Nature & Animals', desc: 'Custom Mushroom Pawns, Bear Knights, Leaf Bishops, Tree Stump Rooks & Nature Crowns' },
  gothic: { id: 'gothic', name: 'Gothic Imperial', desc: 'Ornate medieval crowns, crests, and battlements' },
  cyber: { id: 'cyber', name: 'Cyber Neon 2077', desc: 'Glowing energy lines with geometric vector cores' },
  metallic: { id: 'metallic', name: '3D Metallic Glass', desc: 'Luminous metallic gradient shading with gloss' },
  pixel: { id: 'pixel', name: 'Pixel Arcade 8-Bit', desc: 'Nostalgic retro gaming 8-bit arcade style' },
  royalGold: { id: 'royalGold', name: 'Royal Gold Kingdom', desc: 'Luxurious 3D Gold filigree silhouettes with marble glow' }
};

// 1. Woodland Nature & Animal Piece Set (Preferred Style from chess/ screenshots)
const renderWoodlandPiece = (type, isWhite) => {
  const primaryFill = isWhite ? '#fffdf7' : '#5c381c';
  const secondaryFill = isWhite ? '#f3e6cd' : '#3d220e';
  const strokeColor = isWhite ? '#7c5228' : '#231206';
  const accentColor = isWhite ? '#e8c886' : '#d98e48';
  const filter = 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))';

  if (type === 'P') {
    // Mushroom / Toadstool Pawn
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {/* Stem */}
        <path d="M 40 85 C 38 60, 42 45, 50 45 C 58 45, 62 60, 60 85 Z" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
        <ellipse cx="50" cy="85" rx="14" ry="4" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
        {/* Cap */}
        <path d="M 18 52 C 18 20, 82 20, 82 52 C 82 56, 18 56, 18 52 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        {/* Spots */}
        <circle cx="34" cy="36" r="5" fill={accentColor} />
        <circle cx="50" cy="28" r="6" fill={accentColor} />
        <circle cx="66" cy="36" r="5" fill={accentColor} />
        <circle cx="42" cy="46" r="3.5" fill={accentColor} />
        <circle cx="58" cy="46" r="3.5" fill={accentColor} />
      </svg>
    );
  }

  if (type === 'N') {
    // Bear / Polar Bear Knight (Polar Bear for White, Brown Bear for Black)
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {/* Ears */}
        <circle cx="34" cy="24" r="11" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <circle cx="34" cy="24" r="5" fill={accentColor} />
        <circle cx="66" cy="24" r="11" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <circle cx="66" cy="24" r="5" fill={accentColor} />
        {/* Head */}
        <path d="M 24 45 C 24 25, 76 25, 76 45 C 78 70, 72 85, 50 86 C 28 85, 22 70, 24 45 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        {/* Snout */}
        <ellipse cx="50" cy="60" rx="18" ry="14" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
        <ellipse cx="50" cy="53" rx="7" ry="5" fill={strokeColor} />
        {/* Eyes */}
        <circle cx="38" cy="42" r="4.5" fill={strokeColor} />
        <circle cx="62" cy="42" r="4.5" fill={strokeColor} />
        {isWhite && <circle cx="39.5" cy="40.5" r="1.5" fill="#fff" />}
        {isWhite && <circle cx="63.5" cy="40.5" r="1.5" fill="#fff" />}
        {/* Mouth */}
        <path d="M 50 58 L 50 65 M 44 65 Q 50 69 56 65" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'B') {
    // Leaf / Feather Blade Bishop
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 50 12 C 24 35, 28 75, 50 86 C 72 75, 76 35, 50 12 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <path d="M 50 12 L 50 86" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 50 32 L 34 45 M 50 48 L 30 60 M 50 64 L 36 74" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 50 32 L 66 45 M 50 48 L 70 60 M 50 64 L 64 74" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="12" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'R') {
    // Tree Stump / Castle Tower Rook
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <rect x="25" y="32" width="50" height="52" rx="4" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        {/* Merlons / Rings */}
        <rect x="23" y="20" width="14" height="14" fill={primaryFill} stroke={strokeColor} strokeWidth="3" />
        <rect x="43" y="20" width="14" height="14" fill={primaryFill} stroke={strokeColor} strokeWidth="3" />
        <rect x="63" y="20" width="14" height="14" fill={primaryFill} stroke={strokeColor} strokeWidth="3" />
        {/* Base */}
        <rect x="20" y="80" width="60" height="10" rx="2" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
        {/* Tree Rings / Door */}
        <path d="M 42 80 C 42 62, 58 62, 58 80 Z" fill={secondaryFill} stroke={strokeColor} strokeWidth="2.5" />
        <line x1="32" y1="42" x2="68" y2="42" stroke={accentColor} strokeWidth="2" strokeDasharray="3,3" />
        <line x1="32" y1="56" x2="68" y2="56" stroke={accentColor} strokeWidth="2" strokeDasharray="3,3" />
      </svg>
    );
  }

  if (type === 'Q') {
    // Queen Crown with Nature Petals
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 22 76 L 16 34 L 35 52 L 50 20 L 65 52 L 84 34 L 78 76 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <circle cx="16" cy="30" r="4.5" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
        <circle cx="35" cy="48" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
        <circle cx="50" cy="16" r="6" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
        <circle cx="65" cy="48" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
        <circle cx="84" cy="30" r="4.5" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
        <rect x="20" y="76" width="60" height="10" rx="3" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
        <circle cx="50" cy="81" r="3" fill={accentColor} />
      </svg>
    );
  }

  // King Crown with Imperial Cross & rings
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {/* Top Cross */}
      <path d="M 50 8 L 50 24 M 42 16 L 58 16" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M 20 76 C 20 40, 35 30, 50 30 C 65 30, 80 40, 80 76 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
      <path d="M 50 30 L 50 76" stroke={accentColor} strokeWidth="3" strokeDasharray="4,3" />
      <path d="M 32 42 Q 50 54 68 42" fill="none" stroke={strokeColor} strokeWidth="2.5" />
      <rect x="18" y="76" width="64" height="10" rx="3" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
      <circle cx="50" cy="81" r="3.5" fill={accentColor} />
    </svg>
  );
};

// 2. Gothic Imperial Piece Set
const renderGothicPiece = (type, isWhite) => {
  const fill = isWhite ? 'url(#gothicWhiteGrad)' : 'url(#gothicBlackGrad)';
  const stroke = isWhite ? '#1e293b' : '#38bdf8';
  const filter = isWhite ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' : 'drop-shadow(0 0 10px rgba(56,189,248,0.5))';

  const symbols = { P: '♟', N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚' };

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
      <circle cx="50" cy="50" r="36" fill="none" stroke={isWhite ? 'rgba(30,41,59,0.2)' : 'rgba(56,189,248,0.3)'} strokeWidth="1.5" strokeDasharray="4,3" />
      <text
        x="50" y="67"
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

// 3. Cyber Neon 2077 Piece Set
const renderCyberPiece = (type, isWhite) => {
  const stroke = isWhite ? '#00dfd8' : '#ff007f';
  const fill = isWhite ? 'rgba(0, 223, 216, 0.18)' : 'rgba(255, 0, 127, 0.18)';
  const glow = isWhite ? '0 0 12px #00dfd8' : '0 0 12px #ff007f';

  const symbols = { P: '▲', N: '➞', B: '◆', R: '▧', Q: '❖', K: '✦' };

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

// 4. 3D Metallic Glass Piece Set
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

// 5. Pixel Arcade 8-Bit Piece Set
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

// 6. Royal Gold Kingdom Piece Set
const renderRoyalGoldPiece = (type, isWhite) => {
  const fill = isWhite ? 'url(#royalGoldWhiteGrad)' : 'url(#royalGoldBlackGrad)';
  const stroke = isWhite ? '#d97706' : '#9a3412';
  const symbols = { P: '♟', N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚' };

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))' }}>
      <defs>
        <linearGradient id="royalGoldWhiteGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="royalGoldBlackGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="50%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#1c1917" />
        </linearGradient>
      </defs>
      <path d="M 50 8 L 88 30 L 88 70 L 50 92 L 12 70 L 12 30 Z" fill={fill} stroke={stroke} strokeWidth="3" />
      <text
        x="50" y="66"
        fontSize="52"
        textAnchor="middle"
        fill={isWhite ? '#78350f' : '#fbbf24'}
        fontFamily="serif"
        fontWeight="bold"
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

      pieces[key] = (props) => {
        if (pieceSetId === 'woodland' || pieceSetId === 'nature') return renderWoodlandPiece(type, isWhite);
        if (pieceSetId === 'gothic') return renderGothicPiece(type, isWhite);
        if (pieceSetId === 'cyber') return renderCyberPiece(type, isWhite);
        if (pieceSetId === 'metallic') return renderMetallicPiece(type, isWhite);
        if (pieceSetId === 'pixel') return renderPixelPiece(type, isWhite);
        if (pieceSetId === 'royalGold') return renderRoyalGoldPiece(type, isWhite);
        return renderWoodlandPiece(type, isWhite);
      };
    });
  });

  return pieces;
};
