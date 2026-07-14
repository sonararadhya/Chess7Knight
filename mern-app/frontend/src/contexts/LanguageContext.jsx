import React, { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    play: 'Play',
    puzzles: 'Puzzles',
    learn: 'Learn',
    profile: 'Profile',
    guest: 'Play as Guest',
    login: 'Login',
    signup: 'Sign Up',
    welcome: 'Welcome back',
    dashboard_title: 'The Ultimate Chess Experience',
    settings: 'Settings'
  },
  es: {
    play: 'Jugar',
    puzzles: 'Rompecabezas',
    learn: 'Aprender',
    profile: 'Perfil',
    guest: 'Jugar como Invitado',
    login: 'Iniciar Sesión',
    signup: 'Regístrate',
    welcome: 'Bienvenido de nuevo',
    dashboard_title: 'La Experiencia Definitiva de Ajedrez',
    settings: 'Ajustes'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
