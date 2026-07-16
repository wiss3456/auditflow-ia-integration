'use client';

import * as React from 'react';

export interface AppNotification {
  createdAt: string;
  id: string;
  message: string;
  title: string;
}

export interface NotificationsContextValue {
  addNotification: (notification: Pick<AppNotification, 'message' | 'title'>) => void;
  clearNotifications: () => void;
  notifications: AppNotification[];
}

export const NotificationsContext = React.createContext<NotificationsContextValue | undefined>(undefined);

export interface NotificationsProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'auditflow-notifications';

function shouldKeepNotification(notification: AppNotification): boolean {
  const normalizedTitle = notification.title.toLowerCase();
  const normalizedMessage = notification.message.toLowerCase();

  if (normalizedTitle === 'navigation' || normalizedTitle === 'langue' || normalizedTitle === 'language') {
    return false;
  }

  if (
    normalizedTitle === 'connexion' ||
    normalizedTitle === 'sign in' ||
    normalizedTitle === 'deconnexion' ||
    normalizedTitle === 'sign out'
  ) {
    return false;
  }

  if (normalizedTitle === 'mission') {
    if (normalizedMessage.includes('vous avez ouvert la mission') || normalizedMessage.includes('you opened the mission')) {
      return false;
    }

    if (normalizedMessage.includes('ouverture de la creation') || normalizedMessage.includes('opening new mission creation')) {
      return false;
    }
  }

  return true;
}

function createNotificationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function NotificationsProvider({ children }: NotificationsProviderProps): React.JSX.Element {
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);

  React.useEffect(() => {
    const storedNotifications = globalThis.localStorage.getItem(STORAGE_KEY);

    if (!storedNotifications) {
      return;
    }

    try {
      const parsedNotifications = (JSON.parse(storedNotifications) as AppNotification[]).filter((notification) =>
        shouldKeepNotification(notification)
      );

      setNotifications(parsedNotifications);
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedNotifications));
    } catch {
      globalThis.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persistNotifications = React.useCallback((nextNotifications: AppNotification[]): void => {
    setNotifications(nextNotifications);
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotifications));
  }, []);

  const addNotification = React.useCallback(
    (notification: Pick<AppNotification, 'message' | 'title'>): void => {
      setNotifications((currentNotifications) => {
        const nextNotifications = [
          {
            createdAt: new Date().toISOString(),
            id: createNotificationId(),
            message: notification.message,
            title: notification.title,
          },
          ...currentNotifications,
        ].slice(0, 100);

        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotifications));
        return nextNotifications;
      });
    },
    []
  );

  const clearNotifications = React.useCallback((): void => {
    persistNotifications([]);
  }, [persistNotifications]);

  return (
    <NotificationsContext.Provider value={{ addNotification, clearNotifications, notifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}
