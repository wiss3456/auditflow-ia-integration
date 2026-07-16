'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';

import { MissionTeamMembers } from '@/components/dashboard/missions/mission-team-members';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { filterMissionsForUser } from '@/lib/missions/access';
import { getSelectedMissionIdForUser } from '@/lib/missions/selection';
import { saveWorkspaceSelectedMission } from '@/lib/workspace-storage';
import { paths } from '@/paths';

function getStatusColor(status: string): 'default' | 'error' | 'info' | 'success' | 'warning' {
  switch (status) {
    case 'Planning': {
      return 'warning';
    }
    case 'Fieldwork': {
      return 'info';
    }
    case 'Review': {
      return 'warning';
    }
    case 'Follow-up': {
      return 'default';
    }
    case 'Closed': {
      return 'success';
    }
    default: {
      return 'default';
    }
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'Planning': {
      return 'Étude';
    }
    case 'Fieldwork': {
      return 'Vérification';
    }
    case 'Review': {
      return 'Conclusion';
    }
    case 'Follow-up': {
      return 'Suivi';
    }
    case 'Closed': {
      return 'Clôturée';
    }
    default: {
      return status;
    }
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'High': {
      return 'Haute';
    }
    case 'Medium': {
      return 'Moyenne';
    }
    case 'Low': {
      return 'Faible';
    }
    default: {
      return priority;
    }
  }
}

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const selectedMissionId = React.useMemo(() => getSelectedMissionIdForUser(workspace, user?.id), [user?.id, workspace]);
  const auditMissions = React.useMemo(() => filterMissionsForUser(workspace.missions, user), [user, workspace.missions]);

  const navigateToPage = React.useCallback((href: string): void => {
    globalThis.location.assign(href);
  }, []);

  const handleSelectMission = React.useCallback(
    (missionId: string): void => {
      if (user?.id) {
        saveWorkspaceSelectedMission(user.id, missionId);
      }

      navigateToPage(paths.dashboard.overview);
    },
    [navigateToPage, user?.id]
  );

  const handleReturnToDashboard = React.useCallback((): void => {
    if (user?.id) {
      saveWorkspaceSelectedMission(user.id, null);
    }

    navigateToPage(paths.dashboard.overview);
  }, [navigateToPage, user?.id]);

  return (
    <Stack spacing={3}>
      <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={2} sx={{ alignItems: { md: 'center', xs: 'flex-start' } }}>
        <Box>
          <Typography variant="h4">Choisir une mission</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Sélectionne une mission existante pour continuer vers les pages liées aux missions, ou retourne au tableau de bord sans en choisir.
          </Typography>
        </Box>
        <Button
          onClick={handleReturnToDashboard}
          startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />}
          sx={{ borderRadius: '12px', minHeight: 42, px: 2 }}
          variant="outlined"
        >
          Retour au tableau de bord
        </Button>
      </Stack>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Référence</TableCell>
                  <TableCell>Mission</TableCell>
                  <TableCell>Entité</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Équipe</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Priorité</TableCell>
                  <TableCell>Échéance</TableCell>
                  <TableCell align="right">Sélection</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditMissions.map((mission) => (
                  <TableRow
                    hover
                    key={mission.id}
                    sx={
                      selectedMissionId === mission.id
                        ? {
                            backgroundColor: '#eef2ff',
                            '& td': { borderColor: 'rgba(99, 102, 241, 0.16)' },
                            '&:hover': { backgroundColor: '#e0e7ff' },
                          }
                        : undefined
                    }
                  >
                    <TableCell>{mission.id}</TableCell>
                    <TableCell>
                      <Stack spacing={0.6}>
                        <Typography sx={{ color: '#111827', fontWeight: 700 }} variant="subtitle2">
                          {mission.title}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {mission.scope}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">{mission.client}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {mission.site}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{mission.owner}</TableCell>
                    <TableCell>
                      <MissionTeamMembers mission={mission} />
                    </TableCell>
                    <TableCell>
                      <Chip color={getStatusColor(mission.status)} label={getStatusLabel(mission.status)} size="small" />
                    </TableCell>
                    <TableCell>{getPriorityLabel(mission.priority)}</TableCell>
                    <TableCell>{dayjs(mission.dueDate).format('DD MMM YYYY')}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label={`Selectionner ${mission.title}`}
                        onClick={(): void => {
                          handleSelectMission(mission.id);
                        }}
                        sx={{
                          backgroundColor: selectedMissionId === mission.id ? '#4f46e5' : 'transparent',
                          color: selectedMissionId === mission.id ? '#ffffff' : '#6366f1',
                          '&:hover': {
                            backgroundColor: selectedMissionId === mission.id ? '#4338ca' : '#eef2ff',
                          },
                        }}
                      >
                        <ArrowRightIcon fontSize="var(--icon-fontSize-md)" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
