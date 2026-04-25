import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, TranslationKey, Lang } from "@/i18n/translations";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LangCtx | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("saarthi-lang") as Lang) || "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang === "mr" ? "mr" : "en";
    localStorage.setItem("saarthi-lang", lang);
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((l) => (l === "en" ? "mr" : "en"));
  const t = (key: TranslationKey) => translations[lang][key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
};
