'use client';

import * as React from 'react';

import { AppLanguageContext } from '@/contexts/app-language-context';

export function useAppLanguage() {
  const context = React.useContext(AppLanguageContext);

  if (!context) {
    throw new Error('useAppLanguage must be used within an AppLanguageProvider');
  }

  return context;
}
