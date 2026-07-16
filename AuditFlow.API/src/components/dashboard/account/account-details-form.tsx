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
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';

import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { authClient } from '@/lib/auth/client';
import { profileStatusOptions } from '@/lib/auth/roles';
import { PROFILE_UPDATED_EVENT, type StoredProfile, loadStoredProfile, saveStoredProfile } from '@/lib/profile-storage';

const statusOptions = profileStatusOptions;
const teamOptions = ['1', '2', '3'] as const;
const MAIN_ACCOUNT_EMAIL = 'rimdiab20@gmail.com';
const AUDITOR_STATUS = 'Auditeur';

export function AccountDetailsForm(): React.JSX.Element {
  const { addNotification } = useNotifications();
  const { checkSession, user } = useUser();
  const [isSaved, setIsSaved] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<StoredProfile>(() => loadStoredProfile(user));
  const isMainAccount = user?.email?.trim().toLowerCase() === MAIN_ACCOUNT_EMAIL;
  const isAuditorAccount =
    (typeof user?.role === 'string' ? user.role : profile.status).trim().toLowerCase() === AUDITOR_STATUS.toLowerCase();
  const canEditStatus = isMainAccount;

  React.useEffect(() => {
    const nextProfile = loadStoredProfile(user);
    setProfile(isAuditorAccount ? { ...nextProfile, status: AUDITOR_STATUS } : nextProfile);

    const handleProfileUpdate = (): void => {
      const nextProfile = loadStoredProfile(user);
      setProfile(isAuditorAccount ? { ...nextProfile, status: AUDITOR_STATUS } : nextProfile);
    };

    globalThis.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);

    return () => {
      globalThis.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);
    };
  }, [isAuditorAccount, user]);

  const handleFieldChange =
    (field: keyof StoredProfile) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }): void => {
      const { value } = event.target;
      setIsSaved(false);
      setSaveError(null);
      setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
    };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        void (async (): Promise<void> => {
          const nextProfile = isAuditorAccount ? { ...profile, status: AUDITOR_STATUS } : profile;
          const { data, error } = await authClient.updateProfile({
            firstName: nextProfile.firstName,
            lastName: nextProfile.lastName,
            phone: nextProfile.phone,
            statusLabel: nextProfile.status,
            team: nextProfile.team,
          });

          if (error) {
            setSaveError(error);
            return;
          }

          saveStoredProfile(nextProfile, data ?? user);
          globalThis.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
          await checkSession?.();
          setIsSaved(true);
          setSaveError(null);
          addNotification({
            message: 'Les informations du compte utilisateur ont ete enregistrees.',
            title: 'Compte utilisateur',
          });
        })();
      }}
    >
      <Card>
        <CardHeader subheader="Les informations du profil peuvent etre modifiees ici." title="Profil utilisateur" />
        <Divider />
        <CardContent>
          {saveError ? (
            <Alert color="error" sx={{ mb: 3 }}>
              {saveError}
            </Alert>
          ) : null}
          {isSaved ? (
            <Alert color="success" sx={{ mb: 3 }}>
              Les informations ont ete mises a jour avec succes.
            </Alert>
          ) : null}
          <Grid container spacing={3}>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <FormControl fullWidth required>
                <InputLabel>Prenom</InputLabel>
                <OutlinedInput label="Prenom" name="firstName" onChange={handleFieldChange('firstName')} value={profile.firstName} />
              </FormControl>
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <FormControl fullWidth required>
                <InputLabel>Nom</InputLabel>
                <OutlinedInput label="Nom" name="lastName" onChange={handleFieldChange('lastName')} value={profile.lastName} />
              </FormControl>
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <FormControl fullWidth required>
                <InputLabel>Adresse e-mail</InputLabel>
                <OutlinedInput label="Adresse e-mail" name="email" readOnly value={profile.email} />
              </FormControl>
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Telephone</InputLabel>
                <OutlinedInput label="Telephone" name="phone" onChange={handleFieldChange('phone')} type="tel" value={profile.phone} />
              </FormControl>
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                {canEditStatus ? (
                  <Select label="Statut" name="status" onChange={handleFieldChange('status')} value={profile.status} variant="outlined">
                    {statusOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <OutlinedInput label="Statut" readOnly value={isAuditorAccount ? AUDITOR_STATUS : profile.status} />
                )}
              </FormControl>
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Equipe</InputLabel>
                <Select label="Equipe" name="team" onChange={handleFieldChange('team')} value={profile.team} variant="outlined">
                  {teamOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            Enregistrer les informations
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
