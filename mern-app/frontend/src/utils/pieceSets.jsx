import React from 'react';

// Piece Set definitions for react-chessboard
// 7 Unique Custom Vector Piece Set Designs:
// 1. staunton - Standard tournament vector pieces
// 2. woodland - Woodland Nature & Animals (Mushrooms, Bears, Leaves, Tree Stumps, Nature Crowns)
// 3. gothic - Gothic Imperial Medieval Armor (Shield Pawns, Warhorse Knights, Cathedral Bishops, Castle Keeps, Fleur-de-lis Crowns)
// 4. cyber - Cyber Neon 2077 Sci-Fi (Probe Drones, Mech Knights, Plasma Obelisks, Cyber Turrets, Matrix Monarchs)
// 5. metallic - 3D Metallic Glass (Bevelled Gold & Obsidian Staunton shapes with gloss highlights)
// 6. pixel - Pixel Arcade 8-Bit (Authentic 8-bit retro pixel grid matrices)
// 7. royalGold - Royal Gold Kingdom (Sculpted gold & marble heraldic pieces with jewel accents)

export const PIECE_SETS_INFO = {
  staunton: { id: 'staunton', name: 'Staunton Pro', desc: 'Standard tournament high-contrast vector pieces' },
  woodland: { id: 'woodland', name: 'Woodland Nature & Animals', desc: 'Mushroom Pawns, Bear Knights, Leaf Bishops, Tree Stump Rooks & Nature Crowns' },
  gothic: { id: 'gothic', name: 'Gothic Imperial', desc: 'Shield Pawns, Warhorse Knights, Cathedral Bishops & Fleur-de-lis Crowns' },
  cyber: { id: 'cyber', name: 'Cyber Neon 2077', desc: 'Probe Drones, Mech Knights, Plasma Obelisks & Energy Matrix Crowns' },
  metallic: { id: 'metallic', name: '3D Metallic Glass', desc: 'Bevelled 3D Gold & Obsidian Metallic Staunton shapes with gloss shading' },
  pixel: { id: 'pixel', name: 'Pixel Arcade 8-Bit', desc: 'Authentic retro gaming 8-bit pixel-art vector sprites' },
  royalGold: { id: 'royalGold', name: 'Royal Gold Kingdom', desc: 'Sculpted Gold & Marble heraldic pieces with ruby/emerald jewel accents' }
};

// ==========================================
// 1. WOODLAND NATURE & ANIMALS PIECE SET
// ==========================================
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
        <path d="M 40 85 C 38 60, 42 45, 50 45 C 58 45, 62 60, 60 85 Z" fill={secondaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <ellipse cx="50" cy="85" rx="14" ry="4" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
        <path d="M 18 52 C 18 20, 82 20, 82 52 C 82 56, 18 56, 18 52 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <circle cx="34" cy="36" r="5" fill={accentColor} />
        <circle cx="50" cy="28" r="6" fill={accentColor} />
        <circle cx="66" cy="36" r="5" fill={accentColor} />
        <circle cx="42" cy="46" r="3.5" fill={accentColor} />
        <circle cx="58" cy="46" r="3.5" fill={accentColor} />
      </svg>
    );
  }

  if (type === 'N') {
    // Bear / Polar Bear Knight
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <circle cx="34" cy="24" r="11" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <circle cx="34" cy="24" r="5" fill={accentColor} />
        <circle cx="66" cy="24" r="11" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <circle cx="66" cy="24" r="5" fill={accentColor} />
        <path d="M 24 45 C 24 25, 76 25, 76 45 C 78 70, 72 85, 50 86 C 28 85, 22 70, 24 45 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <ellipse cx="50" cy="60" rx="18" ry="14" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
        <ellipse cx="50" cy="53" rx="7" ry="5" fill={strokeColor} />
        <circle cx="38" cy="42" r="4.5" fill={strokeColor} />
        <circle cx="62" cy="42" r="4.5" fill={strokeColor} />
        {isWhite && <circle cx="39.5" cy="40.5" r="1.5" fill="#fff" />}
        {isWhite && <circle cx="63.5" cy="40.5" r="1.5" fill="#fff" />}
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
        <rect x="23" y="20" width="14" height="14" fill={primaryFill} stroke={strokeColor} strokeWidth="3" />
        <rect x="43" y="20" width="14" height="14" fill={primaryFill} stroke={strokeColor} strokeWidth="3" />
        <rect x="63" y="20" width="14" height="14" fill={primaryFill} stroke={strokeColor} strokeWidth="3" />
        <rect x="20" y="80" width="60" height="10" rx="2" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
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
      <path d="M 50 8 L 50 24 M 42 16 L 58 16" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M 20 76 C 20 40, 35 30, 50 30 C 65 30, 80 40, 80 76 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
      <path d="M 50 30 L 50 76" stroke={accentColor} strokeWidth="3" strokeDasharray="4,3" />
      <path d="M 32 42 Q 50 54 68 42" fill="none" stroke={strokeColor} strokeWidth="2.5" />
      <rect x="18" y="76" width="64" height="10" rx="3" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
      <circle cx="50" cy="81" r="3.5" fill={accentColor} />
    </svg>
  );
};

// ==========================================
// 2. GOTHIC IMPERIAL PIECE SET (Vector Armor & Crests)
// ==========================================
const renderGothicPiece = (type, isWhite) => {
  const mainFill = isWhite ? '#f8fafc' : '#1e293b';
  const accentFill = isWhite ? '#e2e8f0' : '#0f172a';
  const stroke = isWhite ? '#334155' : '#38bdf8';
  const emblemColor = isWhite ? '#475569' : '#00f0ff';
  const filter = isWhite ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' : 'drop-shadow(0 0 10px rgba(56,189,248,0.5))';

  if (type === 'P') {
    // Shield & Spearhead Pawn
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 50 12 C 30 12, 22 45, 22 65 C 22 80, 40 90, 50 94 C 60 90, 78 80, 78 65 C 78 45, 70 12, 50 12 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 50 20 L 50 84 M 32 48 L 68 48" stroke={emblemColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="48" r="8" fill={accentFill} stroke={emblemColor} strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'N') {
    // Gothic Armored Warhorse Knight
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 30 85 L 30 55 C 30 35, 45 15, 68 18 C 76 20, 80 32, 70 42 C 60 50, 68 62, 78 65 L 78 85 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 45 28 L 56 12 L 62 25 Z" fill={accentFill} stroke={stroke} strokeWidth="2" />
        <polygon points="52,38 72,36 64,48" fill={accentFill} stroke={emblemColor} strokeWidth="2" />
        <path d="M 34 50 Q 52 56 70 50" fill="none" stroke={stroke} strokeWidth="3" />
        <path d="M 34 65 Q 54 72 74 65" fill="none" stroke={stroke} strokeWidth="3" />
        <rect x="24" y="85" width="58" height="8" rx="2" fill={accentFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }

  if (type === 'B') {
    // Gothic Cathedral Mitre Bishop
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 50 10 C 28 35, 24 68, 24 82 L 76 82 C 76 68, 72 35, 50 10 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 50 22 C 38 42, 36 66, 36 78 L 64 78 C 64 66, 62 42, 50 22 Z" fill={accentFill} stroke={stroke} strokeWidth="2" />
        <path d="M 50 30 L 50 68 M 38 46 L 62 46" stroke={emblemColor} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="50" cy="10" r="4.5" fill={emblemColor} />
        <rect x="20" y="82" width="60" height="9" rx="2" fill={accentFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }

  if (type === 'R') {
    // Fortified Gothic Castle Keep Rook
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 26 32 L 26 84 L 74 84 L 74 32 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        {/* Crenellations */}
        <path d="M 22 18 L 34 18 L 34 32 L 44 32 L 44 18 L 56 18 L 56 32 L 66 32 L 66 18 L 78 18 L 78 32 L 22 32 Z" fill={accentFill} stroke={stroke} strokeWidth="3" />
        {/* Arrow slit windows */}
        <rect x="47" y="44" width="6" height="18" rx="3" fill={emblemColor} />
        <rect x="34" y="50" width="4" height="12" rx="2" fill={stroke} />
        <rect x="62" y="50" width="4" height="12" rx="2" fill={stroke} />
        <rect x="20" y="84" width="60" height="9" rx="2" fill={accentFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }

  if (type === 'Q') {
    // Gothic Crown with Fleur-de-lis Peaks Queen
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 20 78 L 14 36 L 34 52 L 50 18 L 66 52 L 86 36 L 80 78 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        {/* Fleur-de-lis Peaks */}
        <circle cx="14" cy="32" r="5" fill={emblemColor} stroke={stroke} strokeWidth="2" />
        <circle cx="34" cy="48" r="4" fill={emblemColor} stroke={stroke} strokeWidth="2" />
        <path d="M 50 10 L 44 22 L 56 22 Z" fill={emblemColor} stroke={stroke} strokeWidth="2" />
        <circle cx="66" cy="48" r="4" fill={emblemColor} stroke={stroke} strokeWidth="2" />
        <circle cx="86" cy="32" r="5" fill={emblemColor} stroke={stroke} strokeWidth="2" />
        <rect x="18" y="78" width="64" height="10" rx="3" fill={accentFill} stroke={stroke} strokeWidth="3" />
        <circle cx="50" cy="83" r="3.5" fill={emblemColor} />
      </svg>
    );
  }

  // Imperial Gothic Crown King
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      <path d="M 50 6 L 50 22 M 42 14 L 58 14" stroke={emblemColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M 22 78 C 22 36, 36 26, 50 26 C 64 26, 78 36, 78 78 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
      <path d="M 26 48 C 36 34, 64 34, 74 48" fill="none" stroke={stroke} strokeWidth="2.5" />
      <path d="M 50 26 L 50 78" stroke={emblemColor} strokeWidth="3" strokeDasharray="5,4" />
      <rect x="18" y="78" width="64" height="10" rx="3" fill={accentFill} stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="83" r="4" fill={emblemColor} />
    </svg>
  );
};

// ==========================================
// 3. CYBER NEON 2077 PIECE SET (Sci-Fi Vector Shapes)
// ==========================================
const renderCyberPiece = (type, isWhite) => {
  const neonColor = isWhite ? '#00dfd8' : '#ff007f';
  const fillBg = isWhite ? 'rgba(0, 223, 216, 0.18)' : 'rgba(255, 0, 127, 0.18)';
  const glow = isWhite ? '0 0 12px #00dfd8' : '0 0 12px #ff007f';

  if (type === 'P') {
    // Sci-Fi Probe Drone Pawn
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="50,14 74,48 50,82 26,48" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <circle cx="50" cy="48" r="10" fill={neonColor} />
        <ellipse cx="50" cy="86" rx="22" ry="4" fill="none" stroke={neonColor} strokeWidth="2" strokeDasharray="4,3" />
      </svg>
    );
  }

  if (type === 'N') {
    // Mech Knight Horse Head
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="26,84 26,48 42,22 72,16 82,34 62,52 74,84" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <line x1="48" y1="30" x2="74" y2="34" stroke={neonColor} strokeWidth="4" strokeLinecap="round" />
        <line x1="32" y1="62" x2="68" y2="62" stroke={neonColor} strokeWidth="2" />
        <line x1="32" y1="74" x2="72" y2="74" stroke={neonColor} strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'B') {
    // Energy Obelisk Bishop
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="50,10 76,46 64,82 36,82 24,46" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <line x1="50" y1="10" x2="50" y2="82" stroke={neonColor} strokeWidth="3" />
        <circle cx="50" cy="34" r="6" fill={neonColor} />
        <rect x="22" y="82" width="56" height="8" rx="2" fill={fillBg} stroke={neonColor} strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'R') {
    // Plasma Turret Rook
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="24,24 38,24 38,36 62,36 62,24 76,24 76,82 24,82" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <line x1="34" y1="50" x2="66" y2="50" stroke={neonColor} strokeWidth="4" />
        <line x1="34" y1="66" x2="66" y2="66" stroke={neonColor} strokeWidth="4" />
        <rect x="20" y="82" width="60" height="8" rx="2" fill={fillBg} stroke={neonColor} strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'Q') {
    // Cyber Matrix Monarch Queen
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="20,80 14,32 36,54 50,16 64,54 86,32 80,80" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <circle cx="50" cy="16" r="6" fill={neonColor} />
        <circle cx="14" cy="32" r="4" fill={neonColor} />
        <circle cx="86" cy="32" r="4" fill={neonColor} />
        <circle cx="50" cy="54" r="8" fill="none" stroke={neonColor} strokeWidth="2" />
        <rect x="18" y="80" width="64" height="8" rx="2" fill={fillBg} stroke={neonColor} strokeWidth="2" />
      </svg>
    );
  }

  // Cyber Core Overlord King
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
      <polygon points="50,8 58,20 50,32 42,20" fill={neonColor} />
      <polygon points="22,80 22,36 36,26 50,36 64,26 78,36 78,80" fill={fillBg} stroke={neonColor} strokeWidth="3" />
      <line x1="50" y1="36" x2="50" y2="80" stroke={neonColor} strokeWidth="3" />
      <rect x="18" y="80" width="64" height="8" rx="2" fill={fillBg} stroke={neonColor} strokeWidth="2" />
    </svg>
  );
};

// ==========================================
// 4. 3D METALLIC GLASS PIECE SET (Vector Bevels)
// ==========================================
const renderMetallicPiece = (type, isWhite) => {
  const gradId = isWhite ? 'goldGrad' : 'obsidianGrad';
  const strokeColor = isWhite ? '#b45309' : '#334155';
  const highlightColor = isWhite ? '#fef08a' : '#94a3b8';
  const filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))';

  const defs = (
    <defs>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="35%" stopColor="#fde047" />
        <stop offset="70%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <linearGradient id="obsidianGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="40%" stopColor="#1e293b" />
        <stop offset="85%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
    </defs>
  );

  if (type === 'P') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <circle cx="50" cy="30" r="16" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
        <circle cx="45" cy="25" r="4" fill={highlightColor} opacity="0.6" />
        <path d="M 32 46 Q 50 42 68 46 L 62 80 L 38 80 Z" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
        <rect x="24" y="80" width="52" height="10" rx="3" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
      </svg>
    );
  }

  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 28 80 L 28 50 C 28 32, 45 18, 66 22 C 76 24, 78 36, 68 44 C 58 50, 68 62, 74 80 Z" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
        <circle cx="58" cy="30" r="3.5" fill={strokeColor} />
        <rect x="22" y="80" width="56" height="10" rx="3" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
      </svg>
    );
  }

  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <circle cx="50" cy="14" r="4.5" fill={highlightColor} stroke={strokeColor} strokeWidth="2" />
        <path d="M 50 20 C 30 36, 26 66, 26 80 L 74 80 C 74 66, 70 36, 50 20 Z" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
        <path d="M 40 40 L 60 52" stroke={strokeColor} strokeWidth="3" />
        <rect x="22" y="80" width="56" height="10" rx="3" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
      </svg>
    );
  }

  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 26 32 L 26 80 L 74 80 L 74 32 Z" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
        <path d="M 22 20 L 34 20 L 34 32 L 44 32 L 44 20 L 56 20 L 56 32 L 66 32 L 66 20 L 78 20 L 78 32 L 22 32 Z" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
        <rect x="22" y="80" width="56" height="10" rx="3" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
      </svg>
    );
  }

  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 22 80 L 16 34 L 34 52 L 50 20 L 66 52 L 84 34 L 78 80 Z" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
        <circle cx="16" cy="30" r="4" fill={highlightColor} />
        <circle cx="50" cy="16" r="5" fill={highlightColor} />
        <circle cx="84" cy="30" r="4" fill={highlightColor} />
        <rect x="20" y="80" width="60" height="10" rx="3" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
      </svg>
    );
  }

  // King
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {defs}
      <path d="M 50 8 L 50 24 M 42 16 L 58 16" stroke={highlightColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M 22 80 C 22 36, 36 26, 50 26 C 64 26, 78 36, 78 80 Z" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
      <rect x="20" y="80" width="60" height="10" rx="3" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
    </svg>
  );
};

// ==========================================
// 5. PIXEL ARCADE 8-BIT PIECE SET (Vector Rect Grid)
// ==========================================
const renderPixelPiece = (type, isWhite) => {
  const fg = isWhite ? '#fef08a' : '#818cf8';
  const bg = isWhite ? '#854d0e' : '#1e1b4b';
  const border = isWhite ? '#eab308' : '#6366f1';

  // 8x8 Pixel Grid matrix definitions
  const matrixPawn = [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1]
  ];

  const matrixKnight = [
    [0,0,1,1,1,0,0,0],
    [0,1,1,1,1,1,0,0],
    [1,1,0,1,1,1,1,0],
    [1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1]
  ];

  const matrixBishop = [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1]
  ];

  const matrixRook = [
    [1,0,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1]
  ];

  const matrixQueen = [
    [1,0,1,0,0,1,0,1],
    [1,0,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1]
  ];

  const matrixKing = [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1]
  ];

  const gridMap = { P: matrixPawn, N: matrixKnight, B: matrixBishop, R: matrixRook, Q: matrixQueen, K: matrixKing };
  const matrix = gridMap[type] || matrixPawn;

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="8" y="8" width="84" height="84" rx="10" fill={bg} stroke={border} strokeWidth="4" />
      <g transform="translate(18, 18)">
        {matrix.map((row, r) =>
          row.map((cell, c) => cell === 1 ? (
            <rect key={`${r}-${c}`} x={c * 8} y={r * 8} width="7" height="7" fill={fg} />
          ) : null)
        )}
      </g>
    </svg>
  );
};

// ==========================================
// 6. ROYAL GOLD KINGDOM PIECE SET (Sculpted Gold & Jewels)
// ==========================================
const renderRoyalGoldPiece = (type, isWhite) => {
  const mainGold = isWhite ? 'url(#royalGoldLightGrad)' : 'url(#royalGoldDarkGrad)';
  const stroke = isWhite ? '#d97706' : '#78350f';
  const gemColor = isWhite ? '#ef4444' : '#10b981';
  const filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.65))';

  const defs = (
    <defs>
      <linearGradient id="royalGoldLightGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="40%" stopColor="#fef08a" />
        <stop offset="80%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="royalGoldDarkGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#92400e" />
        <stop offset="50%" stopColor="#451a03" />
        <stop offset="100%" stopColor="#1c1917" />
      </linearGradient>
    </defs>
  );

  if (type === 'P') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 12 L 88 32 L 88 68 L 50 88 L 12 68 L 12 32 Z" fill={mainGold} stroke={stroke} strokeWidth="3" />
        <circle cx="50" cy="50" r="14" fill={gemColor} stroke={stroke} strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 8 L 88 28 L 88 72 L 50 92 L 12 72 L 12 28 Z" fill={mainGold} stroke={stroke} strokeWidth="3" />
        <path d="M 32 68 C 32 42, 46 28, 68 32 C 76 34, 76 46, 68 52 C 58 58, 66 70, 72 82 Z" fill="none" stroke={stroke} strokeWidth="3.5" />
      </svg>
    );
  }

  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 8 L 88 28 L 88 72 L 50 92 L 12 72 L 12 28 Z" fill={mainGold} stroke={stroke} strokeWidth="3" />
        <path d="M 50 24 L 50 76 M 34 46 L 66 46" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="46" r="6" fill={gemColor} />
      </svg>
    );
  }

  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 8 L 88 28 L 88 72 L 50 92 L 12 72 L 12 28 Z" fill={mainGold} stroke={stroke} strokeWidth="3" />
        <path d="M 32 34 L 42 34 L 42 44 L 58 44 L 58 34 L 68 34 L 68 68 L 32 68 Z" fill="none" stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }

  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 8 L 88 28 L 88 72 L 50 92 L 12 72 L 12 28 Z" fill={mainGold} stroke={stroke} strokeWidth="3" />
        <path d="M 28 68 L 22 36 L 38 48 L 50 24 L 62 48 L 78 36 L 72 68 Z" fill="none" stroke={stroke} strokeWidth="3" />
        <circle cx="50" cy="24" r="4" fill={gemColor} />
      </svg>
    );
  }

  // King
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {defs}
      <path d="M 50 8 L 88 28 L 88 72 L 50 92 L 12 72 L 12 28 Z" fill={mainGold} stroke={stroke} strokeWidth="3" />
      <path d="M 50 20 L 50 38 M 42 28 L 58 28" stroke={gemColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M 28 70 C 28 44, 38 38, 50 38 C 62 38, 72 44, 72 70 Z" fill="none" stroke={stroke} strokeWidth="3" />
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
