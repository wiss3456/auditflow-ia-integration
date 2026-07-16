'use client';

import * as React from 'react';

import { NotificationsContext } from '@/contexts/notifications-context';

export function useNotifications() {
  const context = React.useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
}
