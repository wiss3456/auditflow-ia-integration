import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import { useAppLanguage } from '@/hooks/use-app-language';
import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { canManagePersonnel, normalizeProfileStatus } from '@/lib/auth/roles';
import { logger } from '@/lib/default-logger';
import { loadStoredProfile } from '@/lib/profile-storage';
import { useUser } from '@/hooks/use-user';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { checkSession, user } = useUser();
  const { language } = useAppLanguage();
  const profile = React.useMemo(() => loadStoredProfile(user), [user]);
  const currentStatus = normalizeProfileStatus(typeof user?.role === 'string' ? user.role : profile.status);
  const canAccessStaffManagement = canManagePersonnel(currentStatus);

  const router = useRouter();

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        logger.error('Sign out error', error);
        return;
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router and we need to do it manually
      router.refresh();
      // After refresh, AuthGuard will handle the redirect
    } catch (error) {
      logger.error('Sign out error', error);
    }
  }, [checkSession, router]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{typeof user?.name === 'string' ? user.name : language === 'fr' ? 'Utilisateur AuditFlow' : 'AuditFlow User'}</Typography>
        <Typography color="text.secondary" variant="body2">
          {typeof user?.email === 'string' ? user.email : 'no-email@auditflow.local'}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={paths.dashboard.settings} onClick={onClose}>
          <ListItemIcon>
            <GearSixIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          {language === 'fr' ? 'Paramètres' : 'Settings'}
        </MenuItem>
        <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          {language === 'fr' ? 'Profil' : 'Profile'}
        </MenuItem>
        {canAccessStaffManagement ? (
          <MenuItem component={RouterLink} href={paths.dashboard.staffManagement} onClick={onClose}>
            <ListItemIcon>
              <UsersIcon fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            {language === 'fr' ? 'Gestion du personnel' : 'Staff management'}
          </MenuItem>
        ) : null}
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          {language === 'fr' ? 'Se déconnecter' : 'Sign out'}
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
