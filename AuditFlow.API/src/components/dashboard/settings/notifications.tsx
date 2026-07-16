'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAppLanguage } from '@/hooks/use-app-language';
import { useNotifications } from '@/hooks/use-notifications';

const STORAGE_KEY = 'auditflow-notification-settings';
const defaultValues = {
  emailMissionUpdates: true,
  emailSecurityAlerts: true,
  phoneMissionAlerts: false,
  phoneFollowUpReminders: true,
};

export function Notifications(): React.JSX.Element {
  const { language } = useAppLanguage();
  const { addNotification } = useNotifications();
  const [values, setValues] = React.useState(defaultValues);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    const storedValues = globalThis.localStorage.getItem(STORAGE_KEY);

    if (!storedValues) {
      return;
    }

    try {
      setValues({ ...defaultValues, ...(JSON.parse(storedValues) as Partial<typeof defaultValues>) });
    } catch {
      globalThis.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleToggle =
    (field: keyof typeof defaultValues) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setIsSaved(false);
      setValues((currentValues) => ({ ...currentValues, [field]: event.target.checked }));
    };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
        setIsSaved(true);
        addNotification({
          message: language === 'fr' ? 'Les préférences de notification ont été mises à jour.' : 'Notification preferences were updated.',
          title: language === 'fr' ? 'Notifications' : 'Notifications',
        });
      }}
    >
      <Card>
        <CardHeader
          subheader={language === 'fr' ? 'Choisis comment recevoir les alertes et les rappels importants.' : 'Choose how to receive important alerts and reminders.'}
          title={language === 'fr' ? 'Notifications' : 'Notifications'}
        />
        <Divider />
        <CardContent>
          {isSaved ? (
            <Alert color="success" sx={{ mb: 3 }}>
              {language === 'fr' ? 'Les préférences ont été enregistrées avec succès.' : 'Preferences were saved successfully.'}
            </Alert>
          ) : null}
          <Grid container spacing={6} wrap="wrap">
            <Grid
              size={{
                md: 4,
                sm: 6,
                xs: 12,
              }}
            >
              <Stack spacing={1}>
                <Typography variant="h6">{language === 'fr' ? 'E-mail' : 'Email'}</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={values.emailMissionUpdates} onChange={handleToggle('emailMissionUpdates')} />}
                    label={language === 'fr' ? 'Mises à jour des missions' : 'Mission updates'}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={values.emailSecurityAlerts} onChange={handleToggle('emailSecurityAlerts')} />}
                    label={language === 'fr' ? 'Alertes de sécurité' : 'Security alerts'}
                  />
                </FormGroup>
              </Stack>
            </Grid>
            <Grid
              size={{
                md: 4,
                sm: 6,
                xs: 12,
              }}
            >
              <Stack spacing={1}>
                <Typography variant="h6">{language === 'fr' ? 'Téléphone' : 'Phone'}</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={values.phoneMissionAlerts} onChange={handleToggle('phoneMissionAlerts')} />}
                    label={language === 'fr' ? 'Alertes de mission' : 'Mission alerts'}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={values.phoneFollowUpReminders} onChange={handleToggle('phoneFollowUpReminders')} />}
                    label={language === 'fr' ? 'Rappels de suivi' : 'Follow-up reminders'}
                  />
                </FormGroup>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            {language === 'fr' ? 'Enregistrer les modifications' : 'Save changes'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
