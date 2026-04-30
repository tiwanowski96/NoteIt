import React, { createContext, useContext } from 'react';
import { Lang, t as translate, TranslationKey, pluralizeNotes as pluralize } from './i18n';

interface LangContextType {
  lang: Lang;
  t: (key: TranslationKey) => string;
  pluralizeNotes: (count: number) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  t: (key) => translate(key, 'en'),
  pluralizeNotes: (count) => pluralize(count, 'en'),
});

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const value: LangContextType = {
    lang,
    t: (key) => translate(key, lang),
    pluralizeNotes: (count) => pluralize(count, lang),
  };
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
