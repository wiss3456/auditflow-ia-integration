'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAppLanguage } from '@/hooks/use-app-language';
import { useNotifications } from '@/hooks/use-notifications';

function formatNotificationDate(value: string, language: 'en' | 'fr'): string {
  return new Date(value).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function Page(): React.JSX.Element {
  const { language } = useAppLanguage();
  const { notifications } = useNotifications();

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{language === 'fr' ? 'Historique des notifications' : 'Notification history'}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {language === 'fr'
            ? "Tous les changements effectués dans l’application sont conservés dans cette section."
            : 'All changes made in the application are stored in this section.'}
        </Typography>
      </div>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <Stack spacing={1} sx={{ p: 3 }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{notification.title}</Typography>
                  <Typography color="text.secondary">{notification.message}</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                    {formatNotificationDate(notification.createdAt, language)}
                  </Typography>
                </Stack>
                {index < notifications.length - 1 ? <Divider /> : null}
              </React.Fragment>
            ))
          ) : (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: 220, p: 3, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                {language === 'fr' ? 'Aucune notification disponible' : 'No notifications available'}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
