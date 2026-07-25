import React from 'react';

// Piece Set definitions for react-chessboard
// 17 Unique Custom Vector Piece Set Designs:
// 1. staunton - Standard tournament vector pieces
// 2. woodland - Woodland Nature & Animals (Mushrooms, Bears, Leaves, Tree Stumps, Nature Crowns)
// 3. gothic - Gothic Imperial Medieval Armor (Shield Pawns, Warhorse Knights, Cathedral Bishops, Castle Keeps)
// 4. cyber - Cyber Neon 2077 Sci-Fi (Probe Drones, Mech Knights, Plasma Obelisks, Cyber Turrets)
// 5. metallic - 3D Metallic Glass (Bevelled Gold & Obsidian Staunton shapes)
// 6. pixel - Pixel Arcade 8-Bit (Authentic 8-bit retro pixel grid matrices)
// 7. royalGold - Royal Gold Kingdom (Sculpted gold & marble heraldic pieces with jewel accents)
// 8. egyptian - Egyptian Pharaohs (Pyramids, Anubis Knights, Horus Falcons, Temple Towers, Nefertiti & Tutankhamun)
// 9. cosmic - Cosmic Galaxy & Starlight (Shooting Stars, Pegasus Knights, Crescent Moon Bishops, Spaceports, Supernovas)
// 10. ocean - Ocean Atlantis (Sea Shell Pawns, Seahorse Knights, Trident Bishops, Coral Citadel Rooks, Pearl Queens)
// 11. emerald - Emerald Matrix (Gem Pawns, Dragon Knights, Crystal Prisms, Gem Towers, Star Tiaras)
// 12. crimson - Sunset Crimson Fire (Flame Sparks, Phoenix Knights, Torch Bishops, Inferno Towers, Fire Queens)
// 13. arctic - Arctic Ice & Frost (Icicle Gems, Frost Wolves, Glacial Scepters, Ice Castles, Glacier Queens)
// 14. vintage - Vintage Brass & Antique (Key Pawns, Carved Knights, Quill Bishops, Gear Towers, Victorian Queens)
// 15. samurai - Japanese Samurai & Ninja (Kunai Pawns, Samurai Horse Knights, Pagoda Bishops, Castle Tenshu Rooks, Shogun Helmet Kings)
// 16. neonEmpire - Cyberpunk Neon Empire (Circuit Nodes, Cyber Gliders, Laser Arrays, Neon Towers, Overlord Matrix Kings)
// 17. candy - Candy Kingdom (Gumdrop Pawns, Carousel Knights, Candy Cane Bishops, Gingerbread Towers, Cupcake Queens)

export const PIECE_SETS_INFO = {
  staunton: { id: 'staunton', name: 'Staunton Pro', desc: 'Standard tournament high-contrast vector pieces' },
  woodland: { id: 'woodland', name: 'Woodland Nature & Animals', desc: 'Mushroom Pawns, Bear Knights, Leaf Bishops, Tree Stump Rooks & Nature Crowns' },
  gothic: { id: 'gothic', name: 'Gothic Imperial', desc: 'Shield Pawns, Warhorse Knights, Cathedral Bishops & Fleur-de-lis Crowns' },
  cyber: { id: 'cyber', name: 'Cyber Neon 2077', desc: 'Probe Drones, Mech Knights, Plasma Obelisks & Energy Matrix Crowns' },
  metallic: { id: 'metallic', name: '3D Metallic Glass', desc: 'Bevelled 3D Gold & Obsidian Metallic Staunton shapes with gloss shading' },
  pixel: { id: 'pixel', name: 'Pixel Arcade 8-Bit', desc: 'Authentic retro gaming 8-bit pixel-art vector sprites' },
  royalGold: { id: 'royalGold', name: 'Royal Gold Kingdom', desc: 'Sculpted Gold & Marble heraldic pieces with ruby/emerald jewel accents' },
  egyptian: { id: 'egyptian', name: 'Egyptian Pharaohs', desc: 'Pyramids, Anubis Jackal Knights, Horus Falcon Bishops, Temple Pylon Rooks & Tutankhamun' },
  cosmic: { id: 'cosmic', name: 'Cosmic Galaxy & Starlight', desc: 'Shooting Stars, Pegasus Knights, Crescent Moon Bishops, Orbiting Spaceports & Supernova Suns' },
  ocean: { id: 'ocean', name: 'Ocean Atlantis', desc: 'Nautilus Shell Pawns, Seahorse Knights, Trident Bishops & Sunken Coral Citadel Rooks' },
  emerald: { id: 'emerald', name: 'Emerald Matrix', desc: 'Cut Gem Pawns, Emerald Dragon Knights, Crystal Prisms & Faceted Gem Citadel Rooks' },
  crimson: { id: 'crimson', name: 'Sunset Crimson Fire', desc: 'Flame Spark Pawns, Phoenix Fire Knights, Torch Bishops & Vulcan Inferno Citadel Rooks' },
  arctic: { id: 'arctic', name: 'Arctic Ice & Frost', desc: 'Icicle Gem Pawns, Frost Wolf Knights, Glacial Scepters & Ice Castle Citadel Rooks' },
  vintage: { id: 'vintage', name: 'Vintage Antique Brass', desc: 'Key Pawns, Carved Stallion Knights, Quill Bishops, Clockwork Gear Towers & Victorian Crowns' },
  samurai: { id: 'samurai', name: 'Japanese Samurai & Shogun', desc: 'Kunai Pawns, Samurai Armored Knights, Pagoda Bishops, Castle Tenshu Rooks & Shogun Helmet Kings' },
  neonEmpire: { id: 'neonEmpire', name: 'Cyberpunk Neon Empire', desc: 'Circuit Nodes, Cyber Glider Knights, Laser Arrays, Neon Skyscraper Towers & Matrix Kings' },
  candy: { id: 'candy', name: 'Candy Kingdom', desc: 'Gumdrop Pawns, Gummy Carousel Knights, Candy Cane Bishops & Gingerbread Castle Rooks' }
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
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 40 85 C 38 60, 42 45, 50 45 C 58 45, 62 60, 60 85 Z" fill={secondaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <ellipse cx="50" cy="85" rx="14" ry="4" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
        <path d="M 18 52 C 18 20, 82 20, 82 52 C 82 56, 18 56, 18 52 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <circle cx="34" cy="36" r="5" fill={accentColor} />
        <circle cx="50" cy="28" r="6" fill={accentColor} />
        <circle cx="66" cy="36" r="5" fill={accentColor} />
      </svg>
    );
  }
  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <circle cx="34" cy="24" r="11" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <circle cx="66" cy="24" r="11" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <path d="M 24 45 C 24 25, 76 25, 76 45 C 78 70, 72 85, 50 86 C 28 85, 22 70, 24 45 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <ellipse cx="50" cy="60" rx="18" ry="14" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
        <ellipse cx="50" cy="53" rx="7" ry="5" fill={strokeColor} />
        <circle cx="38" cy="42" r="4.5" fill={strokeColor} />
        <circle cx="62" cy="42" r="4.5" fill={strokeColor} />
      </svg>
    );
  }
  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 50 12 C 24 35, 28 75, 50 86 C 72 75, 76 35, 50 12 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <path d="M 50 12 L 50 86" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 50 32 L 34 45 M 50 48 L 30 60" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 50 32 L 66 45 M 50 48 L 70 60" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <rect x="25" y="32" width="50" height="52" rx="4" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <rect x="23" y="20" width="14" height="14" fill={primaryFill} stroke={strokeColor} strokeWidth="3" />
        <rect x="43" y="20" width="14" height="14" fill={primaryFill} stroke={strokeColor} strokeWidth="3" />
        <rect x="63" y="20" width="14" height="14" fill={primaryFill} stroke={strokeColor} strokeWidth="3" />
        <rect x="20" y="80" width="60" height="10" rx="2" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 22 76 L 16 34 L 35 52 L 50 20 L 65 52 L 84 34 L 78 76 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
        <circle cx="50" cy="16" r="6" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
        <rect x="20" y="76" width="60" height="10" rx="3" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      <path d="M 50 8 L 50 24 M 42 16 L 58 16" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M 20 76 C 20 40, 35 30, 50 30 C 65 30, 80 40, 80 76 Z" fill={primaryFill} stroke={strokeColor} strokeWidth="3.5" />
      <rect x="18" y="76" width="64" height="10" rx="3" fill={secondaryFill} stroke={strokeColor} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 2. GOTHIC IMPERIAL PIECE SET
// ==========================================
const renderGothicPiece = (type, isWhite) => {
  const mainFill = isWhite ? '#f8fafc' : '#1e293b';
  const accentFill = isWhite ? '#e2e8f0' : '#0f172a';
  const stroke = isWhite ? '#334155' : '#38bdf8';
  const emblemColor = isWhite ? '#475569' : '#00f0ff';
  const filter = isWhite ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' : 'drop-shadow(0 0 10px rgba(56,189,248,0.5))';

  if (type === 'P') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 50 12 C 30 12, 22 45, 22 65 C 22 80, 40 90, 50 94 C 60 90, 78 80, 78 65 C 78 45, 70 12, 50 12 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 50 20 L 50 84 M 32 48 L 68 48" stroke={emblemColor} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 30 85 L 30 55 C 30 35, 45 15, 68 18 C 76 20, 80 32, 70 42 C 60 50, 68 62, 78 65 L 78 85 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        <polygon points="52,38 72,36 64,48" fill={accentFill} stroke={emblemColor} strokeWidth="2" />
        <rect x="24" y="85" width="58" height="8" rx="2" fill={accentFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 50 10 C 28 35, 24 68, 24 82 L 76 82 C 76 68, 72 35, 50 10 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 50 30 L 50 68 M 38 46 L 62 46" stroke={emblemColor} strokeWidth="3.5" strokeLinecap="round" />
        <rect x="20" y="82" width="60" height="9" rx="2" fill={accentFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 26 32 L 26 84 L 74 84 L 74 32 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 22 18 L 34 18 L 34 32 L 44 32 L 44 18 L 56 18 L 56 32 L 66 32 L 66 18 L 78 18 L 78 32 L 22 32 Z" fill={accentFill} stroke={stroke} strokeWidth="3" />
        <rect x="47" y="44" width="6" height="18" rx="3" fill={emblemColor} />
      </svg>
    );
  }
  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 20 78 L 14 36 L 34 52 L 50 18 L 66 52 L 86 36 L 80 78 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
        <circle cx="50" cy="18" r="5" fill={emblemColor} stroke={stroke} strokeWidth="2" />
        <rect x="18" y="78" width="64" height="10" rx="3" fill={accentFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      <path d="M 50 6 L 50 22 M 42 14 L 58 14" stroke={emblemColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M 22 78 C 22 36, 36 26, 50 26 C 64 26, 78 36, 78 78 Z" fill={mainFill} stroke={stroke} strokeWidth="3.5" />
      <rect x="18" y="78" width="64" height="10" rx="3" fill={accentFill} stroke={stroke} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 3. CYBER NEON 2077 PIECE SET
// ==========================================
const renderCyberPiece = (type, isWhite) => {
  const neonColor = isWhite ? '#00dfd8' : '#ff007f';
  const fillBg = isWhite ? 'rgba(0, 223, 216, 0.18)' : 'rgba(255, 0, 127, 0.18)';
  const glow = isWhite ? '0 0 12px #00dfd8' : '0 0 12px #ff007f';

  if (type === 'P') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="50,14 74,48 50,82 26,48" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <circle cx="50" cy="48" r="10" fill={neonColor} />
      </svg>
    );
  }
  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="26,84 26,48 42,22 72,16 82,34 62,52 74,84" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <line x1="48" y1="30" x2="74" y2="34" stroke={neonColor} strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="50,10 76,46 64,82 36,82 24,46" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <circle cx="50" cy="34" r="6" fill={neonColor} />
      </svg>
    );
  }
  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="24,24 38,24 38,36 62,36 62,24 76,24 76,82 24,82" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <line x1="34" y1="50" x2="66" y2="50" stroke={neonColor} strokeWidth="4" />
      </svg>
    );
  }
  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="20,80 14,32 36,54 50,16 64,54 86,32 80,80" fill={fillBg} stroke={neonColor} strokeWidth="3" />
        <circle cx="50" cy="16" r="6" fill={neonColor} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
      <polygon points="50,8 58,20 50,32 42,20" fill={neonColor} />
      <polygon points="22,80 22,36 36,26 50,36 64,26 78,36 78,80" fill={fillBg} stroke={neonColor} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 4. 3D METALLIC GLASS PIECE SET
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
        <stop offset="50%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <linearGradient id="obsidianGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
    </defs>
  );

  if (type === 'P') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <circle cx="50" cy="30" r="16" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
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
        <circle cx="50" cy="20" r="5" fill={highlightColor} />
        <rect x="20" y="80" width="60" height="10" rx="3" fill={`url(#${gradId})`} stroke={strokeColor} strokeWidth="2.5" />
      </svg>
    );
  }
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
// 5. PIXEL ARCADE 8-BIT PIECE SET
// ==========================================
const renderPixelPiece = (type, isWhite) => {
  const fg = isWhite ? '#fef08a' : '#818cf8';
  const bg = isWhite ? '#854d0e' : '#1e1b4b';
  const border = isWhite ? '#eab308' : '#6366f1';

  const matrixPawn = [[0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]];
  const matrixKnight = [[0,0,1,1,1,0,0,0],[0,1,1,1,1,1,0,0],[1,1,0,1,1,1,1,0],[1,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]];
  const matrixBishop = [[0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,1,1,0,0,1,1,0],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]];
  const matrixRook = [[1,0,1,1,1,1,0,1],[1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]];
  const matrixQueen = [[1,0,1,0,0,1,0,1],[1,0,1,1,1,1,0,1],[1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]];
  const matrixKing = [[0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[1,1,1,1,1,1,1,1],[1,0,1,1,1,1,0,1],[0,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]];

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
// 6. ROYAL GOLD KINGDOM PIECE SET
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
        <stop offset="50%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f59e0b" />
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
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {defs}
      <path d="M 50 8 L 88 28 L 88 72 L 50 92 L 12 72 L 12 28 Z" fill={mainGold} stroke={stroke} strokeWidth="3" />
      <path d="M 50 20 L 50 38 M 42 28 L 58 28" stroke={gemColor} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};

// ==========================================
// 7. EGYPTIAN PHARAOHS PIECE SET (NEW #1)
// ==========================================
const renderEgyptianPiece = (type, isWhite) => {
  const goldFill = isWhite ? '#fef08a' : '#1c1917';
  const stroke = isWhite ? '#ca8a04' : '#0284c7';
  const lapis = isWhite ? '#0284c7' : '#eab308';
  const filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))';

  if (type === 'P') {
    // Pyramid Obelisk Pawn
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <polygon points="50,14 82,82 18,82" fill={goldFill} stroke={stroke} strokeWidth="3.5" />
        <polygon points="50,14 50,82 82,82" fill={lapis} opacity="0.4" />
        <circle cx="50" cy="52" r="6" fill={lapis} stroke={stroke} strokeWidth="2" />
        <rect x="14" y="82" width="72" height="10" rx="3" fill={goldFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'N') {
    // Anubis Jackal Knight
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <polygon points="34,10 44,34 28,38" fill={goldFill} stroke={stroke} strokeWidth="2.5" />
        <polygon points="66,10 56,34 72,38" fill={goldFill} stroke={stroke} strokeWidth="2.5" />
        <path d="M 28 82 L 28 44 C 28 28, 72 28, 72 44 L 84 54 L 72 64 L 72 82 Z" fill={goldFill} stroke={stroke} strokeWidth="3.5" />
        <ellipse cx="68" cy="46" rx="4" ry="2.5" fill={lapis} />
        <rect x="22" y="82" width="56" height="10" rx="3" fill={lapis} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    // Horus Falcon Bishop
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <circle cx="50" cy="18" r="8" fill={lapis} stroke={stroke} strokeWidth="2" />
        <path d="M 50 26 C 26 40, 24 70, 24 82 L 76 82 C 76 70, 74 40, 50 26 Z" fill={goldFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 28 46 Q 50 36 72 46 M 32 60 Q 50 50 68 60" stroke={lapis} strokeWidth="3" fill="none" />
        <rect x="20" y="82" width="60" height="10" rx="3" fill={goldFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    // Temple Pylon Tower Rook
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <polygon points="30,22 70,22 76,82 24,82" fill={goldFill} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="14" width="56" height="8" rx="2" fill={lapis} stroke={stroke} strokeWidth="3" />
        <path d="M 44 82 L 44 56 C 44 50, 56 50, 56 56 L 56 82 Z" fill={stroke} />
        <rect x="18" y="82" width="64" height="10" rx="3" fill={goldFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    // Nefertiti Crown Queen
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <polygon points="26,78 18,22 82,22 74,78" fill={goldFill} stroke={stroke} strokeWidth="3.5" />
        <rect x="18" y="22" width="64" height="10" fill={lapis} stroke={stroke} strokeWidth="2" />
        <circle cx="50" cy="27" r="4" fill={goldFill} />
        <rect x="20" y="78" width="60" height="10" rx="3" fill={goldFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  // Tutankhamun Nemes Crown King
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      <path d="M 50 8 L 50 20 M 42 14 L 58 14" stroke={lapis} strokeWidth="4" strokeLinecap="round" />
      <path d="M 20 78 C 16 42, 30 20, 50 20 C 70 20, 84 42, 80 78 Z" fill={goldFill} stroke={stroke} strokeWidth="3.5" />
      <path d="M 22 40 L 78 40 M 26 56 L 74 56" stroke={lapis} strokeWidth="3" />
      <rect x="18" y="78" width="64" height="10" rx="3" fill={lapis} stroke={stroke} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 8. COSMIC GALAXY PIECE SET (NEW #2)
// ==========================================
const renderCosmicPiece = (type, isWhite) => {
  const cosmicGrad = isWhite ? 'url(#cosmicWhiteGrad)' : 'url(#cosmicDarkGrad)';
  const stroke = isWhite ? '#a855f7' : '#38bdf8';
  const starColor = isWhite ? '#fef08a' : '#38bdf8';
  const filter = 'drop-shadow(0 0 10px rgba(168,85,247,0.6))';

  const defs = (
    <defs>
      <linearGradient id="cosmicWhiteGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#faf5ff" />
        <stop offset="50%" stopColor="#e9d5ff" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
      <linearGradient id="cosmicDarkGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3b0764" />
        <stop offset="50%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#09090b" />
      </linearGradient>
    </defs>
  );

  if (type === 'P') {
    // Shooting Star Comet Pawn
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 14 Q 72 45 60 82 L 40 82 Q 28 45 50 14 Z" fill={cosmicGrad} stroke={stroke} strokeWidth="3" />
        <polygon points="50,14 54,26 66,26 56,34 60,46 50,38 40,46 44,34 34,26 46,26" fill={starColor} />
        <rect x="24" y="82" width="52" height="9" rx="3" fill={cosmicGrad} stroke={stroke} strokeWidth="2.5" />
      </svg>
    );
  }
  if (type === 'N') {
    // Pegasus Star Horse Knight
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 28 82 L 28 48 C 28 28, 48 14, 70 20 C 78 22, 82 34, 70 44 L 40 50 Q 64 54 74 82 Z" fill={cosmicGrad} stroke={stroke} strokeWidth="3" />
        <circle cx="58" cy="30" r="3" fill={starColor} />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={cosmicGrad} stroke={stroke} strokeWidth="2.5" />
      </svg>
    );
  }
  if (type === 'B') {
    // Crescent Moon Staff Bishop
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 12 C 60 12, 68 20, 68 32 C 68 44, 56 48, 50 48 C 60 48, 62 32, 50 12 Z" fill={starColor} />
        <path d="M 50 20 C 30 36, 26 66, 26 82 L 74 82 C 74 66, 70 36, 50 20 Z" fill={cosmicGrad} stroke={stroke} strokeWidth="3" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={cosmicGrad} stroke={stroke} strokeWidth="2.5" />
      </svg>
    );
  }
  if (type === 'R') {
    // Orbiting Spaceport Rook
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <ellipse cx="50" cy="30" rx="30" ry="10" fill="none" stroke={starColor} strokeWidth="3" strokeDasharray="6,4" />
        <path d="M 30 30 L 30 82 L 70 82 L 70 30 Z" fill={cosmicGrad} stroke={stroke} strokeWidth="3" />
        <rect x="24" y="82" width="52" height="9" rx="3" fill={cosmicGrad} stroke={stroke} strokeWidth="2.5" />
      </svg>
    );
  }
  if (type === 'Q') {
    // Supernova Queen
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 22 82 L 14 34 L 34 54 L 50 18 L 66 54 L 86 34 L 78 82 Z" fill={cosmicGrad} stroke={stroke} strokeWidth="3" />
        <circle cx="50" cy="18" r="6" fill={starColor} />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={cosmicGrad} stroke={stroke} strokeWidth="2.5" />
      </svg>
    );
  }
  // Solar Flare Sun King
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {defs}
      <path d="M 50 6 L 50 24 M 42 14 L 58 14" stroke={starColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M 22 82 C 22 38, 36 26, 50 26 C 64 26, 78 38, 78 82 Z" fill={cosmicGrad} stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="54" r="10" fill={starColor} />
      <rect x="20" y="82" width="60" height="9" rx="3" fill={cosmicGrad} stroke={stroke} strokeWidth="2.5" />
    </svg>
  );
};

// ==========================================
// 9. OCEAN ATLANTIS PIECE SET (NEW #3)
// ==========================================
const renderOceanPiece = (type, isWhite) => {
  const oceanGrad = isWhite ? 'url(#oceanWhiteGrad)' : 'url(#oceanDarkGrad)';
  const stroke = isWhite ? '#0284c7' : '#38bdf8';
  const pearl = isWhite ? '#fff' : '#38bdf8';
  const filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))';

  const defs = (
    <defs>
      <linearGradient id="oceanWhiteGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f0f9ff" />
        <stop offset="50%" stopColor="#bae6fd" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="oceanDarkGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0369a1" />
        <stop offset="50%" stopColor="#0c4a6e" />
        <stop offset="100%" stopColor="#082f49" />
      </linearGradient>
    </defs>
  );

  if (type === 'P') {
    // Shell Nautilus Pawn
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 20 C 30 20, 20 40, 20 60 C 20 82, 80 82, 80 60 C 80 40, 70 20, 50 20 Z" fill={oceanGrad} stroke={stroke} strokeWidth="3.5" />
        <path d="M 50 20 Q 50 60 20 60 M 50 20 Q 60 70 80 60" stroke={stroke} strokeWidth="2.5" fill="none" />
        <circle cx="50" cy="50" r="5" fill={pearl} />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={oceanGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'N') {
    // Seahorse Knight
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 32 82 C 32 60, 42 45, 60 38 C 76 32, 70 18, 54 22 C 40 26, 32 38, 30 50 Z" fill={oceanGrad} stroke={stroke} strokeWidth="3.5" />
        <circle cx="56" cy="26" r="3" fill={pearl} />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={oceanGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    // Trident Bishop
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 32 20 L 32 42 M 50 12 L 50 42 M 68 20 L 68 42 M 32 42 Q 50 56 68 42" stroke={stroke} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M 50 42 L 50 82" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <rect x="24" y="82" width="52" height="9" rx="3" fill={oceanGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    // Coral Citadel Rook
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 28 32 L 28 82 L 72 82 L 72 32 Z" fill={oceanGrad} stroke={stroke} strokeWidth="3.5" />
        <path d="M 22 18 L 36 18 L 36 32 L 46 32 L 46 18 L 54 18 L 54 32 L 64 32 L 64 18 L 78 18 L 78 32 L 22 32 Z" fill={oceanGrad} stroke={stroke} strokeWidth="3" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={oceanGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    // Pearl Queen Tiara
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 22 82 L 14 36 L 34 52 L 50 20 L 66 52 L 86 36 L 78 82 Z" fill={oceanGrad} stroke={stroke} strokeWidth="3.5" />
        <circle cx="50" cy="20" r="6" fill={pearl} stroke={stroke} strokeWidth="2" />
        <circle cx="14" cy="36" r="4" fill={pearl} stroke={stroke} strokeWidth="2" />
        <circle cx="86" cy="36" r="4" fill={pearl} stroke={stroke} strokeWidth="2" />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={oceanGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  // Poseidon King Crown
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {defs}
      <path d="M 50 10 L 50 30 M 42 18 L 58 18" stroke={pearl} strokeWidth="4" strokeLinecap="round" />
      <path d="M 22 82 C 22 38, 36 28, 50 28 C 64 28, 78 38, 78 82 Z" fill={oceanGrad} stroke={stroke} strokeWidth="3.5" />
      <rect x="18" y="82" width="64" height="9" rx="3" fill={oceanGrad} stroke={stroke} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 10. EMERALD MATRIX PIECE SET (NEW #4)
// ==========================================
const renderEmeraldPiece = (type, isWhite) => {
  const emGrad = isWhite ? 'url(#emWhiteGrad)' : 'url(#emDarkGrad)';
  const stroke = isWhite ? '#047857' : '#34d399';
  const filter = 'drop-shadow(0 0 8px rgba(52,211,153,0.5))';

  const defs = (
    <defs>
      <linearGradient id="emWhiteGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ecfdf5" />
        <stop offset="50%" stopColor="#a7f3d0" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <linearGradient id="emDarkGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#065f46" />
        <stop offset="50%" stopColor="#064e3b" />
        <stop offset="100%" stopColor="#022c22" />
      </linearGradient>
    </defs>
  );

  if (type === 'P') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="50,14 74,48 50,82 26,48" fill={emGrad} stroke={stroke} strokeWidth="3.5" />
        <polygon points="50,14 50,82 74,48" fill={stroke} opacity="0.3" />
        <rect x="24" y="82" width="52" height="9" rx="3" fill={emGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="28,82 28,48 48,18 74,24 82,42 60,54 74,82" fill={emGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={emGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="50,10 76,46 64,82 36,82 24,46" fill={emGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={emGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="26,24 38,24 38,34 62,34 62,24 74,24 74,82 26,82" fill={emGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={emGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="22,82 14,32 34,54 50,18 66,54 86,32 78,82" fill={emGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={emGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {defs}
      <polygon points="50,8 58,20 50,32 42,20" fill={stroke} />
      <polygon points="22,82 22,36 36,26 50,36 64,26 78,36 78,82" fill={emGrad} stroke={stroke} strokeWidth="3.5" />
      <rect x="18" y="82" width="64" height="9" rx="3" fill={emGrad} stroke={stroke} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 11. SUNSET CRIMSON FIRE PIECE SET (NEW #5)
// ==========================================
const renderCrimsonPiece = (type, isWhite) => {
  const fireGrad = isWhite ? 'url(#fireWhiteGrad)' : 'url(#fireDarkGrad)';
  const stroke = isWhite ? '#b91c1c' : '#ef4444';
  const spark = isWhite ? '#fef08a' : '#f97316';
  const filter = 'drop-shadow(0 0 10px rgba(239,68,68,0.5))';

  const defs = (
    <defs>
      <linearGradient id="fireWhiteGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff7ed" />
        <stop offset="50%" stopColor="#ffedd5" />
        <stop offset="100%" stopColor="#fb923c" />
      </linearGradient>
      <linearGradient id="fireDarkGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#991b1b" />
        <stop offset="50%" stopColor="#7f1d1d" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>
    </defs>
  );

  if (type === 'P') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 14 Q 74 45 64 82 L 36 82 Q 26 45 50 14 Z" fill={fireGrad} stroke={stroke} strokeWidth="3.5" />
        <path d="M 50 30 Q 60 50 50 70 Q 40 50 50 30 Z" fill={spark} opacity="0.7" />
        <rect x="24" y="82" width="52" height="9" rx="3" fill={fireGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 28 82 L 28 48 Q 45 16 68 22 C 78 24, 80 36, 70 44 L 40 52 Q 68 58 74 82 Z" fill={fireGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={fireGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 12 Q 62 26 50 40 Q 38 26 50 12 Z" fill={spark} stroke={stroke} strokeWidth="2" />
        <path d="M 50 20 C 30 36, 26 66, 26 82 L 74 82 C 74 66, 70 36, 50 20 Z" fill={fireGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={fireGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 28 32 L 28 82 L 72 82 L 72 32 Z" fill={fireGrad} stroke={stroke} strokeWidth="3.5" />
        <path d="M 22 18 L 34 18 L 34 32 L 44 32 L 44 18 L 56 18 L 56 32 L 66 32 L 66 18 L 78 18 L 78 32 L 22 32 Z" fill={fireGrad} stroke={stroke} strokeWidth="3" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={fireGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 22 82 L 14 34 L 34 52 L 50 18 L 66 52 L 86 34 L 78 82 Z" fill={fireGrad} stroke={stroke} strokeWidth="3.5" />
        <circle cx="50" cy="18" r="5" fill={spark} />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={fireGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {defs}
      <path d="M 50 8 L 50 24 M 42 16 L 58 16" stroke={spark} strokeWidth="4" strokeLinecap="round" />
      <path d="M 22 82 C 22 36, 36 26, 50 26 C 64 26, 78 36, 78 82 Z" fill={fireGrad} stroke={stroke} strokeWidth="3.5" />
      <rect x="18" y="82" width="64" height="9" rx="3" fill={fireGrad} stroke={stroke} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 12. ARCTIC ICE & FROST PIECE SET (NEW #6)
// ==========================================
const renderArcticPiece = (type, isWhite) => {
  const iceGrad = isWhite ? 'url(#iceWhiteGrad)' : 'url(#iceDarkGrad)';
  const stroke = isWhite ? '#0284c7' : '#38bdf8';
  const frost = isWhite ? '#fff' : '#7dd3fc';
  const filter = 'drop-shadow(0 0 8px rgba(56,189,248,0.5))';

  const defs = (
    <defs>
      <linearGradient id="iceWhiteGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f0f9ff" />
        <stop offset="50%" stopColor="#e0f2fe" />
        <stop offset="100%" stopColor="#7dd3fc" />
      </linearGradient>
      <linearGradient id="iceDarkGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0369a1" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
    </defs>
  );

  if (type === 'P') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="50,14 74,48 50,82 26,48" fill={iceGrad} stroke={stroke} strokeWidth="3.5" />
        <line x1="50" y1="14" x2="50" y2="82" stroke={frost} strokeWidth="2" />
        <rect x="24" y="82" width="52" height="9" rx="3" fill={iceGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="28,82 28,48 48,18 74,24 82,42 60,54 74,82" fill={iceGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={iceGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="50,10 76,46 64,82 36,82 24,46" fill={iceGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={iceGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="26,24 38,24 38,34 62,34 62,24 74,24 74,82 26,82" fill={iceGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={iceGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <polygon points="22,82 14,32 34,54 50,18 66,54 86,32 78,82" fill={iceGrad} stroke={stroke} strokeWidth="3.5" />
        <circle cx="50" cy="18" r="5" fill={frost} />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={iceGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {defs}
      <polygon points="50,8 58,20 50,32 42,20" fill={frost} />
      <polygon points="22,82 22,36 36,26 50,36 64,26 78,36 78,82" fill={iceGrad} stroke={stroke} strokeWidth="3.5" />
      <rect x="18" y="82" width="64" height="9" rx="3" fill={iceGrad} stroke={stroke} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 13. VINTAGE ANTIQUE BRASS PIECE SET (NEW #7)
// ==========================================
const renderVintagePiece = (type, isWhite) => {
  const brassGrad = isWhite ? 'url(#brassLightGrad)' : 'url(#brassDarkGrad)';
  const stroke = isWhite ? '#78350f' : '#451a03';
  const antique = isWhite ? '#fbbf24' : '#d97706';
  const filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))';

  const defs = (
    <defs>
      <linearGradient id="brassLightGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="50%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="brassDarkGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#92400e" />
        <stop offset="50%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
    </defs>
  );

  if (type === 'P') {
    // Key Pawns
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <circle cx="50" cy="30" r="16" fill={brassGrad} stroke={stroke} strokeWidth="3.5" />
        <circle cx="50" cy="30" r="8" fill="none" stroke={stroke} strokeWidth="2.5" />
        <rect x="46" y="46" width="8" height="36" fill={brassGrad} stroke={stroke} strokeWidth="2.5" />
        <rect x="24" y="82" width="52" height="9" rx="3" fill={brassGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 28 82 L 28 50 C 28 32, 45 18, 66 22 C 76 24, 78 36, 68 44 C 58 50, 68 62, 74 82 Z" fill={brassGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={brassGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 50 14 Q 68 28 50 42 Q 32 28 50 14 Z" fill={antique} stroke={stroke} strokeWidth="2" />
        <path d="M 50 20 C 30 36, 26 66, 26 82 L 74 82 C 74 66, 70 36, 50 20 Z" fill={brassGrad} stroke={stroke} strokeWidth="3.5" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={brassGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 28 32 L 28 82 L 72 82 L 72 32 Z" fill={brassGrad} stroke={stroke} strokeWidth="3.5" />
        <path d="M 22 18 L 34 18 L 34 32 L 44 32 L 44 18 L 56 18 L 56 32 L 64 32 L 64 18 L 78 18 L 78 32 L 22 32 Z" fill={brassGrad} stroke={stroke} strokeWidth="3" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={brassGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        {defs}
        <path d="M 22 82 L 14 34 L 34 52 L 50 18 L 66 52 L 86 34 L 78 82 Z" fill={brassGrad} stroke={stroke} strokeWidth="3.5" />
        <circle cx="50" cy="18" r="5" fill={antique} />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={brassGrad} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      {defs}
      <path d="M 50 8 L 50 24 M 42 16 L 58 16" stroke={antique} strokeWidth="4" strokeLinecap="round" />
      <path d="M 22 82 C 22 36, 36 26, 50 26 C 64 26, 78 36, 78 82 Z" fill={brassGrad} stroke={stroke} strokeWidth="3.5" />
      <rect x="18" y="82" width="64" height="9" rx="3" fill={brassGrad} stroke={stroke} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 14. JAPANESE SAMURAI & SHOGUN PIECE SET (NEW #8)
// ==========================================
const renderSamuraiPiece = (type, isWhite) => {
  const samFill = isWhite ? '#fff' : '#18181b';
  const stroke = isWhite ? '#dc2626' : '#ef4444';
  const goldAcc = isWhite ? '#eab308' : '#dc2626';
  const filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))';

  if (type === 'P') {
    // Kunai Dagger Pawn
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <polygon points="50,10 64,48 50,82 36,48" fill={samFill} stroke={stroke} strokeWidth="3.5" />
        <circle cx="50" cy="48" r="6" fill={goldAcc} />
        <rect x="24" y="82" width="52" height="9" rx="3" fill={samFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'N') {
    // Armored Samurai Horse Knight
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 28 82 L 28 48 C 28 28, 48 14, 70 20 C 78 22, 82 34, 70 44 L 40 50 Q 64 54 74 82 Z" fill={samFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 46 22 L 72 26" stroke={goldAcc} strokeWidth="4" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={samFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    // Pagoda Spire Bishop
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <polygon points="50,10 76,46 64,82 36,82 24,46" fill={samFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 20 46 L 80 46 M 26 64 L 74 64" stroke={goldAcc} strokeWidth="3" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={samFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    // Castle Tenshu Rook
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 28 32 L 28 82 L 72 82 L 72 32 Z" fill={samFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 18 32 C 34 24, 66 24, 82 32 Z" fill={goldAcc} stroke={stroke} strokeWidth="3" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={samFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    // Empress Fan Queen
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 20 78 C 20 30, 80 30, 80 78 Z" fill={samFill} stroke={stroke} strokeWidth="3.5" />
        <path d="M 50 30 L 30 78 M 50 30 L 50 78 M 50 30 L 70 78" stroke={goldAcc} strokeWidth="2.5" />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={samFill} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  // Shogun Helmet Kabuto King
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      <path d="M 20 20 L 50 36 L 80 20" stroke={goldAcc} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 22 82 C 22 36, 36 28, 50 28 C 64 28, 78 36, 78 82 Z" fill={samFill} stroke={stroke} strokeWidth="3.5" />
      <rect x="18" y="82" width="64" height="9" rx="3" fill={samFill} stroke={stroke} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 15. CYBERPUNK NEON EMPIRE PIECE SET (NEW #9)
// ==========================================
const renderNeonEmpirePiece = (type, isWhite) => {
  const stroke = isWhite ? '#00dfd8' : '#a855f7';
  const fillBg = isWhite ? 'rgba(0,223,216,0.15)' : 'rgba(168,85,247,0.15)';
  const glow = isWhite ? '0 0 12px #00dfd8' : '0 0 12px #a855f7';

  if (type === 'P') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="50,14 74,48 50,82 26,48" fill={fillBg} stroke={stroke} strokeWidth="3" />
        <circle cx="50" cy="48" r="8" fill={stroke} />
      </svg>
    );
  }
  if (type === 'N') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="26,84 26,48 42,22 72,16 82,34 62,52 74,84" fill={fillBg} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="50,10 76,46 64,82 36,82 24,46" fill={fillBg} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="24,24 38,24 38,36 62,36 62,24 76,24 76,82 24,82" fill={fillBg} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
        <polygon points="20,80 14,32 36,54 50,16 64,54 86,32 80,80" fill={fillBg} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: `drop-shadow(${glow})` }}>
      <polygon points="50,8 58,20 50,32 42,20" fill={stroke} />
      <polygon points="22,80 22,36 36,26 50,36 64,26 78,36 78,80" fill={fillBg} stroke={stroke} strokeWidth="3" />
    </svg>
  );
};

// ==========================================
// 16. CANDY KINGDOM PIECE SET (NEW #10)
// ==========================================
const renderCandyPiece = (type, isWhite) => {
  const mainFill = isWhite ? '#fce7f3' : '#db2777';
  const stroke = isWhite ? '#ec4899' : '#831843';
  const accent = isWhite ? '#f472b6' : '#fbcfe8';
  const filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';

  if (type === 'P') {
    // Gumdrop Pawn
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 50 18 C 30 18, 22 45, 22 82 L 78 82 C 78 45, 70 18, 50 18 Z" fill={mainFill} stroke={stroke} strokeWidth="4" />
        <circle cx="42" cy="36" r="4" fill="#fff" opacity="0.6" />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={accent} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'N') {
    // Carousel Gummy Horse Knight
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 28 82 L 28 48 C 28 28, 48 14, 70 20 C 78 22, 82 34, 70 44 L 40 50 Q 64 54 74 82 Z" fill={mainFill} stroke={stroke} strokeWidth="4" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={accent} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'B') {
    // Candy Cane Bishop
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 50 12 C 30 36, 26 66, 26 82 L 74 82 C 74 66, 70 36, 50 12 Z" fill={mainFill} stroke={stroke} strokeWidth="4" />
        <path d="M 32 38 L 68 50 M 30 56 L 70 68" stroke={stroke} strokeWidth="4" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={accent} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'R') {
    // Gingerbread Tower Rook
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <rect x="26" y="32" width="48" height="50" rx="4" fill={mainFill} stroke={stroke} strokeWidth="4" />
        <rect x="22" y="18" width="12" height="14" rx="2" fill={accent} stroke={stroke} strokeWidth="3" />
        <rect x="44" y="18" width="12" height="14" rx="2" fill={accent} stroke={stroke} strokeWidth="3" />
        <rect x="66" y="18" width="12" height="14" rx="2" fill={accent} stroke={stroke} strokeWidth="3" />
        <rect x="22" y="82" width="56" height="9" rx="3" fill={accent} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  if (type === 'Q') {
    // Cupcake Queen
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
        <path d="M 22 82 L 14 36 L 34 52 L 50 20 L 66 52 L 86 36 L 78 82 Z" fill={mainFill} stroke={stroke} strokeWidth="4" />
        <circle cx="50" cy="20" r="7" fill="#ef4444" stroke={stroke} strokeWidth="2" />
        <rect x="20" y="82" width="60" height="9" rx="3" fill={accent} stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }
  // Sugar King Crown
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter }}>
      <path d="M 50 8 L 50 24 M 42 16 L 58 16" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <path d="M 22 82 C 22 36, 36 26, 50 26 C 64 26, 78 36, 78 82 Z" fill={mainFill} stroke={stroke} strokeWidth="4" />
      <rect x="18" y="82" width="64" height="9" rx="3" fill={accent} stroke={stroke} strokeWidth="3" />
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
        if (pieceSetId === 'egyptian') return renderEgyptianPiece(type, isWhite);
        if (pieceSetId === 'cosmic') return renderCosmicPiece(type, isWhite);
        if (pieceSetId === 'ocean') return renderOceanPiece(type, isWhite);
        if (pieceSetId === 'emerald') return renderEmeraldPiece(type, isWhite);
        if (pieceSetId === 'crimson') return renderCrimsonPiece(type, isWhite);
        if (pieceSetId === 'arctic') return renderArcticPiece(type, isWhite);
        if (pieceSetId === 'vintage') return renderVintagePiece(type, isWhite);
        if (pieceSetId === 'samurai') return renderSamuraiPiece(type, isWhite);
        if (pieceSetId === 'neonEmpire') return renderNeonEmpirePiece(type, isWhite);
        if (pieceSetId === 'candy') return renderCandyPiece(type, isWhite);
        return renderWoodlandPiece(type, isWhite);
      };
    });
  });

  return pieces;
};
