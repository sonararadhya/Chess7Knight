import React, { createContext, useState, useContext, useEffect } from 'react';

export const themes = {
  classic: {
    name: 'Classic Green',
    darkSquare: '#739552',
    lightSquare: '#ebecd0',
    background: 'radial-gradient(circle at top right, #1f2937, #0d1117)'
  },
  wood: {
    name: 'Rustic Wood',
    darkSquare: '#b58863',
    lightSquare: '#f0d9b5',
    background: 'linear-gradient(135deg, #3e2723, #1b0000)'
  },
  midnight: {
    name: 'Midnight Blue',
    darkSquare: '#1e3a5f',
    lightSquare: '#8da8c7',
    background: 'url(/bg.png) center/cover no-repeat fixed'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState('classic');
  const [useCustomCursor, setUseCustomCursor] = useState(false);

  useEffect(() => {
    document.body.style.background = themes[themeId].background;
    
    if (useCustomCursor) {
      document.body.style.cursor = 'url(/cursor.png) 16 16, auto';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [themeId, useCustomCursor]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme: themes[themeId], useCustomCursor, setUseCustomCursor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
