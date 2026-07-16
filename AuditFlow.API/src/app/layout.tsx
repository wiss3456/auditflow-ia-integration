import * as React from 'react';
import type { Viewport } from 'next';

import '@/styles/global.css';

import { AppLanguageProvider } from '@/contexts/app-language-context';
import { NotificationsProvider } from '@/contexts/notifications-context';
import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="fr">
      <body>
        <LocalizationProvider>
          <AppLanguageProvider>
            <NotificationsProvider>
              <UserProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </UserProvider>
            </NotificationsProvider>
          </AppLanguageProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
