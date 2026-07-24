import React, { createContext, useState, useContext, useEffect } from 'react';
import { PIECE_SETS_INFO } from '../utils/pieceSets';
import { soundFx } from '../utils/audio';

export const themes = {
  classic: {
    name: 'Classic Green',
    darkSquare: '#739552',
    lightSquare: '#ebecd0',
    accentColor: '#34d399',
    darkSquareStyle: { backgroundColor: '#739552', boxShadow: 'inset 0 0 6px rgba(0,0,0,0.15)' },
    lightSquareStyle: { backgroundColor: '#ebecd0' }
  },
  wood: {
    name: 'Rustic Wood',
    darkSquare: '#b58863',
    lightSquare: '#f0d9b5',
    accentColor: '#fbbf24',
    darkSquareStyle: { background: 'radial-gradient(circle, #b58863 0%, #8c5a32 100%)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.35)', border: '1px solid rgba(110,65,30,0.2)' },
    lightSquareStyle: { background: 'radial-gradient(circle, #f0d9b5 0%, #d8be97 100%)', boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)' }
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    darkSquare: '#260a4c',
    lightSquare: '#064e3b',
    accentColor: '#00dfd8',
    darkSquareStyle: { background: 'linear-gradient(135deg, #260a4c 0%, #110324 100%)', boxShadow: 'inset 0 0 12px rgba(0,223,216,0.2)', border: '1px solid rgba(0,223,216,0.25)' },
    lightSquareStyle: { background: 'linear-gradient(135deg, #09382b 0%, #032018 100%)', boxShadow: 'inset 0 0 12px rgba(255,0,127,0.2)', border: '1px solid rgba(255,0,127,0.25)' }
  },
  goldObsidian: {
    name: 'Golden Obsidian',
    darkSquare: '#261e14',
    lightSquare: '#856404',
    accentColor: '#ffd700',
    darkSquareStyle: { background: 'linear-gradient(135deg, #1c160c 0%, #0d0a06 100%)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.2)' },
    lightSquareStyle: { background: 'linear-gradient(135deg, #d4af37 0%, #997b15 100%)', boxShadow: 'inset 0 0 8px rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)' }
  },
  emerald: {
    name: 'Emerald Matrix',
    darkSquare: '#064e3b',
    lightSquare: '#6ee7b7',
    accentColor: '#10b981',
    darkSquareStyle: { background: 'radial-gradient(circle, #064e3b 0%, #022c22 100%)', boxShadow: 'inset 0 0 12px rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.3)' },
    lightSquareStyle: { background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: 'inset 0 0 8px rgba(167,243,208,0.3)' }
  },
  crimson: {
    name: 'Sunset Crimson',
    darkSquare: '#7f1d1d',
    lightSquare: '#fca5a5',
    accentColor: '#ef4444',
    darkSquareStyle: { background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)', boxShadow: 'inset 0 0 12px rgba(239,68,68,0.3)' },
    lightSquareStyle: { background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)', boxShadow: 'inset 0 0 8px rgba(254,202,202,0.4)' }
  },
  monochrome: {
    name: 'Monochrome Glass',
    darkSquare: '#27272a',
    lightSquare: '#a1a1aa',
    accentColor: '#e4e4e7',
    darkSquareStyle: { background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)', boxShadow: 'inset 0 0 8px rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' },
    lightSquareStyle: { background: 'linear-gradient(135deg, #52525b 0%, #3f3f46 100%)', boxShadow: 'inset 0 0 8px rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.15)' }
  },
  galaxy: {
    name: 'Deep Space Galaxy',
    darkSquare: '#1e1b4b',
    lightSquare: '#818cf8',
    accentColor: '#93c5fd',
    darkSquareStyle: { background: 'radial-gradient(circle, #1e1b4b 0%, #0f172a 100%)', boxShadow: 'inset 0 0 14px rgba(129,140,248,0.3)', border: '1px solid rgba(129,140,248,0.2)' },
    lightSquareStyle: { background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)', boxShadow: 'inset 0 0 10px rgba(199,210,254,0.3)' }
  },
  parchment: {
    name: 'Vintage Parchment',
    darkSquare: '#8c6d46',
    lightSquare: '#e8d7be',
    accentColor: '#d97706',
    darkSquareStyle: { background: 'radial-gradient(circle, #8c6d46 0%, #634a2d 100%)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3)', border: '1px solid rgba(99,74,45,0.3)' },
    lightSquareStyle: { background: 'radial-gradient(circle, #e8d7be 0%, #d4be9b 100%)', boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)' }
  },
  coral: {
    name: 'Coral Reef',
    darkSquare: '#c06040',
    lightSquare: '#f0d0b0',
    accentColor: '#f97316',
    darkSquareStyle: { background: 'linear-gradient(135deg, #c06040 0%, #8c3f25 100%)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.25)' },
    lightSquareStyle: { background: 'linear-gradient(135deg, #f0d0b0 0%, #e0b088 100%)', boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)' }
  },
  ice: {
    name: 'Arctic Ice',
    darkSquare: '#5a8aaa',
    lightSquare: '#d8e8f0',
    accentColor: '#38bdf8',
    darkSquareStyle: { background: 'linear-gradient(135deg, #5a8aaa 0%, #355870 100%)', boxShadow: 'inset 0 0 10px rgba(56,189,248,0.3)', border: '1px solid rgba(56,189,248,0.2)' },
    lightSquareStyle: { background: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%)', boxShadow: 'inset 0 0 6px rgba(255,255,255,0.4)' }
  },
  royal: {
    name: 'Royal Purple',
    darkSquare: '#6b4c9a',
    lightSquare: '#d8c8e8',
    accentColor: '#a855f7',
    darkSquareStyle: { background: 'linear-gradient(135deg, #6b4c9a 0%, #442a6b 100%)', boxShadow: 'inset 0 0 12px rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.25)' },
    lightSquareStyle: { background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)', boxShadow: 'inset 0 0 8px rgba(243,232,255,0.4)' }
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('chess7k_theme') || 'cyberpunk');
  const [pieceSetId, setPieceSetId] = useState(() => localStorage.getItem('chess7k_piece_set') || 'staunton');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('chess7k_sound') !== 'false');
  const [useCustomCursor, setUseCustomCursor] = useState(() => localStorage.getItem('chess7k_cursor') === 'true');

  useEffect(() => {
    localStorage.setItem('chess7k_theme', themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem('chess7k_piece_set', pieceSetId);
  }, [pieceSetId]);

  useEffect(() => {
    localStorage.setItem('chess7k_sound', String(soundEnabled));
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('chess7k_cursor', String(useCustomCursor));
    if (useCustomCursor) {
      document.body.style.cursor = 'url(/queen-cursor.png) 16 16, auto';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [useCustomCursor]);

  return (
    <ThemeContext.Provider value={{
      themeId, setThemeId,
      theme: themes[themeId] || themes.cyberpunk,
      pieceSetId, setPieceSetId,
      allPieceSets: PIECE_SETS_INFO,
      soundEnabled, setSoundEnabled,
      useCustomCursor, setUseCustomCursor,
      allThemes: themes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
