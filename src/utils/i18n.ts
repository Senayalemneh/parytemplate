import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "../locales/en/translation.json";
import translationAM from "../locales/am/translation.json";
import translationOR from "../locales/or/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  am: {
    translation: translationAM,
  },
  or: {
    translation: translationOR,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "am",
  fallbackLng: "am",
  debug: true,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
