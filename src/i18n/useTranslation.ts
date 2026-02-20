import { useLanguage } from './LanguageContext';
import ko from './translations/ko';
import en from './translations/en';

const translations = { ko, en } as const;

type TranslationKeys = typeof ko;

export const useTranslation = () => {
  const { language } = useLanguage();
  const t = translations[language] as TranslationKeys;
  return { t, language };
};
