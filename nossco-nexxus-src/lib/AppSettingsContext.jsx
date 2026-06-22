import React, { createContext, useContext, useState, useEffect } from 'react';

const AppSettingsContext = createContext();

export const AppSettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('nossco_theme') || 'dark');
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('nossco_lang');
    if (saved) return saved;
    const browserLang = (navigator.language || 'en').toLowerCase();
    return browserLang.startsWith('ar') ? 'ar' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('nossco_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nossco_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  return (
    <AppSettingsContext.Provider value={{ theme, lang, toggleTheme, toggleLang }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);