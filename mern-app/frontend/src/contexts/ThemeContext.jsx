import React, { createContext, useState, useContext, useEffect } from 'react';

export const themes = {
  classic: {
    name: 'Classic Green',
    darkSquare: '#739552',
    lightSquare: '#ebecd0',
  },
  wood: {
    name: 'Rustic Wood',
    darkSquare: '#b58863',
    lightSquare: '#f0d9b5',
  },
  midnight: {
    name: 'Midnight Blue',
    darkSquare: '#2a4a7f',
    lightSquare: '#9ab8d8',
  },
  coral: {
    name: 'Coral Reef',
    darkSquare: '#c06040',
    lightSquare: '#f0d0b0',
  },
  ice: {
    name: 'Arctic Ice',
    darkSquare: '#5a8aaa',
    lightSquare: '#d8e8f0',
  },
  royal: {
    name: 'Royal Purple',
    darkSquare: '#6b4c9a',
    lightSquare: '#d8c8e8',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('chess7k_theme') || 'classic');
  const [useCustomCursor, setUseCustomCursor] = useState(() => localStorage.getItem('chess7k_cursor') === 'true');

  useEffect(() => {
    localStorage.setItem('chess7k_theme', themeId);
  }, [themeId]);

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
      theme: themes[themeId] || themes.classic,
      useCustomCursor, setUseCustomCursor,
      allThemes: themes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
