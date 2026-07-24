import React, { createContext, useState, useContext, useEffect } from 'react';
import { PIECE_SETS_INFO } from '../utils/pieceSets';
import { soundFx } from '../utils/audio';

export const themes = {
  classic: {
    name: 'Classic Green',
    darkSquare: '#739552',
    lightSquare: '#ebecd0',
    accentColor: '#34d399'
  },
  wood: {
    name: 'Rustic Wood',
    darkSquare: '#b58863',
    lightSquare: '#f0d9b5',
    accentColor: '#fbbf24'
  },
  midnight: {
    name: 'Midnight Blue',
    darkSquare: '#2a4a7f',
    lightSquare: '#9ab8d8',
    accentColor: '#4f8cff'
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    darkSquare: '#260a4c',
    lightSquare: '#064e3b',
    accentColor: '#00dfd8'
  },
  goldObsidian: {
    name: 'Golden Obsidian',
    darkSquare: '#261e14',
    lightSquare: '#856404',
    accentColor: '#ffd700'
  },
  emerald: {
    name: 'Emerald Matrix',
    darkSquare: '#064e3b',
    lightSquare: '#6ee7b7',
    accentColor: '#10b981'
  },
  crimson: {
    name: 'Sunset Crimson',
    darkSquare: '#7f1d1d',
    lightSquare: '#fca5a5',
    accentColor: '#ef4444'
  },
  monochrome: {
    name: 'Monochrome Glass',
    darkSquare: '#27272a',
    lightSquare: '#a1a1aa',
    accentColor: '#e4e4e7'
  },
  galaxy: {
    name: 'Deep Space Galaxy',
    darkSquare: '#1e1b4b',
    lightSquare: '#818cf8',
    accentColor: '#93c5fd'
  },
  parchment: {
    name: 'Vintage Parchment',
    darkSquare: '#8c6d46',
    lightSquare: '#e8d7be',
    accentColor: '#d97706'
  },
  coral: {
    name: 'Coral Reef',
    darkSquare: '#c06040',
    lightSquare: '#f0d0b0',
    accentColor: '#f97316'
  },
  ice: {
    name: 'Arctic Ice',
    darkSquare: '#5a8aaa',
    lightSquare: '#d8e8f0',
    accentColor: '#38bdf8'
  },
  royal: {
    name: 'Royal Purple',
    darkSquare: '#6b4c9a',
    lightSquare: '#d8c8e8',
    accentColor: '#a855f7'
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
