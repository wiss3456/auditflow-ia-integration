'use client';

import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';

import { useAppLanguage } from '@/hooks/use-app-language';
import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { getSelectedMissionForUser } from '@/lib/missions/selection';
import { usePopover } from '@/hooks/use-popover';
import { paths } from '@/paths';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

function formatNotificationDate(value: string, language: 'en' | 'fr'): string {
  return new Date(value).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [openNotifications, setOpenNotifications] = React.useState<boolean>(false);
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const { language } = useAppLanguage();
  const { clearNotifications, notifications } = useNotifications();
  const pathname = usePathname();

  const userPopover = usePopover<HTMLDivElement>();
  const selectedMission = React.useMemo(() => getSelectedMissionForUser(workspace, user), [user, workspace]);
  const shouldShowSelectedMissionBadge = pathname === paths.dashboard.studyPhase || pathname === paths.dashboard.followUp;

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          backgroundColor: 'var(--mui-palette-background-paper)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '68px', px: { xs: 2, md: 3 } }}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>

          <Stack alignItems="center" direction="row" spacing={1}>
            <Tooltip title={language === 'fr' ? 'Notifications' : 'Notifications'}>
              <IconButton
                onClick={(): void => {
                  setOpenNotifications(true);
                }}
              >
                <Badge badgeContent={notifications.length} color="error" max={99}>
                  <BellIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={language === 'fr' ? 'Paramètres' : 'Settings'}>
              <IconButton component={RouterLink} href={paths.dashboard.settings}>
                <GearSixIcon />
              </IconButton>
            </Tooltip>

            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={typeof user?.avatar === 'string' ? user.avatar : '/assets/avatar.png'}
              sx={{ cursor: 'pointer', height: 36, width: 36 }}
            >
              {typeof user?.name === 'string' ? user.name.charAt(0).toUpperCase() : 'A'}
            </Avatar>
          </Stack>
        </Stack>
        {shouldShowSelectedMissionBadge && selectedMission ? (
          <Box sx={{ px: { xs: 2, md: 3 }, pb: 1.75 }}>
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: '#eef2ff',
                border: '1px solid rgba(99, 102, 241, 0.18)',
                borderRadius: '999px',
                color: '#4338ca',
                display: 'inline-flex',
                maxWidth: '100%',
                px: 1.6,
                py: 0.7,
              }}
            >
              <Typography
                sx={{
                  color: 'inherit',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Mission sélectionnée : {selectedMission.title || selectedMission.id}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </Box>

      <Drawer
        PaperProps={{ sx: { maxWidth: '100%', width: 360 } }}
        anchor="right"
        onClose={(): void => {
          setOpenNotifications(false);
        }}
        open={openNotifications}
      >
        <Stack spacing={0} sx={{ height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ alignItems: 'center', p: 2.5 }}>
            <div>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {language === 'fr' ? 'Notifications' : 'Notifications'}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {language === 'fr'
                  ? 'Tous les changements importants restent enregistrés ici.'
                  : 'All important changes remain stored here.'}
              </Typography>
            </div>
            <Button
              onClick={clearNotifications}
              size="small"
              sx={{ whiteSpace: 'nowrap' }}
              variant="text"
            >
              {language === 'fr' ? 'Tout effacer' : 'Clear all'}
            </Button>
          </Stack>
          <Divider />
          <Stack spacing={0} sx={{ flex: '1 1 auto', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Box key={notification.id} sx={{ p: 2.5 }}>
                  <Typography sx={{ color: '#111827', fontSize: '0.95rem', fontWeight: 700 }}>{notification.title}</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7, mt: 0.75 }}>
                    {notification.message}
                  </Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', mt: 1.2 }}>
                    {formatNotificationDate(notification.createdAt, language)}
                  </Typography>
                  <Divider sx={{ mt: 2.2 }} />
                </Box>
              ))
            ) : (
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: 220, p: 3, textAlign: 'center' }}>
                <Typography sx={{ color: '#111827', fontSize: '1rem', fontWeight: 700 }}>
                  {language === 'fr' ? 'Aucune notification pour le moment' : 'No notifications yet'}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {language === 'fr'
                    ? 'Les actions effectuées dans l’application apparaîtront ici automatiquement.'
                    : 'Actions performed in the application will appear here automatically.'}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              component={RouterLink}
              fullWidth
              href={paths.dashboard.notifications}
              onClick={(): void => {
                setOpenNotifications(false);
              }}
              variant="outlined"
            >
              {language === 'fr' ? 'Voir tout l’historique' : 'View full history'}
            </Button>
          </Box>
        </Stack>
      </Drawer>

      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
