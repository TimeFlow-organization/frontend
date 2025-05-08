import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEn from './locales/en.json';
import translationUa from './locales/ua.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: translationEn },
      ua: { translation: translationUa },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
