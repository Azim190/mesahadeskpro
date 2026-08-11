import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ar from './ar.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: localStorage.getItem('lng') || 'ar', // Default to Arabic for Saudi office context
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Sync layout direction with language changes
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  localStorage.setItem('lng', lng);
});

// Set initial layout direction on boot
const initialLng = i18n.language || 'ar';
document.documentElement.dir = initialLng === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = initialLng;

export default i18n;
