import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  isEnglish: boolean;
  isKorean: boolean;
  /** Returns the path with the correct language prefix */
  localePath: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ko',
  isEnglish: false,
  isKorean: true,
  localePath: (path) => path,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const language: Language = location.pathname.startsWith('/en') ? 'en' : 'ko';

  const value = useMemo(() => ({
    language,
    isEnglish: language === 'en',
    isKorean: language === 'ko',
    localePath: (path: string) => {
      if (language === 'en') {
        return `/en${path.startsWith('/') ? path : `/${path}`}`;
      }
      return path;
    },
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
