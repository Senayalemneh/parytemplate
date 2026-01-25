import { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
const LanguageContext = createContext(null);
import "../utils/i18n";

export const useLanguage = () => useContext(LanguageContext);
const LanguageProvider = ({ children }: any) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      <div className="w-full p-0">{children}</div>
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
