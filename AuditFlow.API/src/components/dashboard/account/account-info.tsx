'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { PROFILE_UPDATED_EVENT, loadStoredProfile, saveStoredProfile } from '@/lib/profile-storage';

export function AccountInfo(): React.JSX.Element {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [profile, setProfile] = React.useState(() => loadStoredProfile(user));

  React.useEffect(() => {
    setProfile(loadStoredProfile(user));

    const handleProfileUpdate = (): void => {
      setProfile(loadStoredProfile(user));
    };

    globalThis.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);

    return () => {
      globalThis.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);
    };
  }, [user]);

  const handleAvatarChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (typeof reader.result !== 'string') {
          return;
        }

        const nextProfile = { ...loadStoredProfile(user), avatar: reader.result };

        saveStoredProfile(nextProfile, user);
        addNotification({
          message: 'La photo de profil a ete mise a jour avec succes.',
          title: 'Compte utilisateur',
        });
      });

      reader.readAsDataURL(file);
      event.target.value = '';
    },
    [addNotification, user]
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={profile.avatar} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{`${profile.firstName} ${profile.lastName}`}</Typography>
            <Typography color="text.secondary" variant="body2">
              {profile.status}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Equipe {profile.team}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {profile.timezone}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2 }}>
        <Stack spacing={1.25} sx={{ width: '100%' }}>
          <Button
            fullWidth
            onClick={(): void => {
              inputRef.current?.click();
            }}
            variant="text"
          >
            Changer la photo
          </Button>
          <input accept="image/*" hidden onChange={handleAvatarChange} ref={inputRef} type="file" />
        </Stack>
      </CardActions>
    </Card>
  );
}
