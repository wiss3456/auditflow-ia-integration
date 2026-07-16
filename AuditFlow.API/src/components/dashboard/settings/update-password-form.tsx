'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

import { useAppLanguage } from '@/hooks/use-app-language';
import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { authClient } from '@/lib/auth/client';

export function UpdatePasswordForm(): React.JSX.Element {
  const { language } = useAppLanguage();
  const { addNotification } = useNotifications();
  const { user } = useUser();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [feedback, setFeedback] = React.useState<{ message: string; severity: 'error' | 'success' } | null>(null);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        if (!user?.id) {
          setFeedback({
            message: language === 'fr' ? 'Aucun utilisateur connecte.' : 'No signed-in user.',
            severity: 'error',
          });
          return;
        }

        if (!password || !confirmPassword) {
          setFeedback({
            message: language === 'fr' ? 'Renseigne les deux champs de mot de passe.' : 'Fill in both password fields.',
            severity: 'error',
          });
          return;
        }

        if (password !== confirmPassword) {
          setFeedback({
            message: language === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.',
            severity: 'error',
          });
          return;
        }

        const { error } = await authClient.updatePassword({ password, userId: user.id });

        if (error) {
          setFeedback({ message: error, severity: 'error' });
          return;
        }

        setPassword('');
        setConfirmPassword('');
        setFeedback({
          message:
            language === 'fr'
              ? 'Le mot de passe de ce compte a ete mis a jour avec succes.'
              : 'This account password was updated successfully.',
          severity: 'success',
        });
        addNotification({
          message: language === 'fr' ? 'Le mot de passe du compte a ete mis a jour.' : 'The account password was updated.',
          title: language === 'fr' ? 'Securite' : 'Security',
        });
      }}
    >
      <Card>
        <CardHeader
          subheader={language === 'fr' ? 'Renforce les acces du compte depuis ce panneau de securite.' : 'Strengthen account access from this security panel.'}
          title={language === 'fr' ? 'Mot de passe' : 'Password'}
        />
        <Divider />
        <CardContent>
          {feedback ? (
            <Alert color={feedback.severity} sx={{ mb: 3 }}>
              {feedback.message}
            </Alert>
          ) : null}
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <FormControl fullWidth>
              <InputLabel>{language === 'fr' ? 'Mot de passe' : 'Password'}</InputLabel>
              <OutlinedInput
                label={language === 'fr' ? 'Mot de passe' : 'Password'}
                name="password"
                onChange={(event): void => {
                  setFeedback(null);
                  setPassword(event.target.value);
                }}
                type="password"
                value={password}
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}</InputLabel>
              <OutlinedInput
                label={language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                name="confirmPassword"
                onChange={(event): void => {
                  setFeedback(null);
                  setConfirmPassword(event.target.value);
                }}
                type="password"
                value={confirmPassword}
              />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            {language === 'fr' ? 'Mettre a jour' : 'Update'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
