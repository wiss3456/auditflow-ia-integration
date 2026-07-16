'use client';

import * as React from 'react';

export type AppLanguage = 'en' | 'fr';

export interface AppLanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

export const AppLanguageContext = React.createContext<AppLanguageContextValue | undefined>(undefined);

export interface AppLanguageProviderProps {
  children: React.ReactNode;
}

export function AppLanguageProvider({ children }: AppLanguageProviderProps): React.JSX.Element {
  const language = 'fr';

  const setLanguage = React.useCallback((_nextLanguage: AppLanguage): void => {
    // L'application reste en francais uniquement.
  }, []);

  return <AppLanguageContext.Provider value={{ language, setLanguage }}>{children}</AppLanguageContext.Provider>;
}
