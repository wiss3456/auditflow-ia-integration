'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
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
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import dayjs from 'dayjs';

import { MissionTeamMembers } from '@/components/dashboard/missions/mission-team-members';
import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { filterMissionsForUser } from '@/lib/missions/access';
import { deleteWorkspaceMission } from '@/lib/workspace-storage';
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
  const { addNotification } = useNotifications();
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const auditMissions = React.useMemo(() => filterMissionsForUser(workspace.missions, user), [user, workspace.missions]);

  const handleDeleteMission = (missionId: string, missionTitle: string): void => {
    deleteWorkspaceMission(missionId);
    addNotification({
      message: `La mission ${missionTitle} a été supprimée des missions et du suivi associé.`,
      title: 'Mission',
    });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Missions ONCF</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Registre des missions d’audit interne ONCF avec entité auditée, responsable, statut, échéance et prochaine action.
        </Typography>
      </Box>
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
                  <TableCell>Equipe</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Priorité</TableCell>
                  <TableCell>Échéance</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditMissions.map((mission) => (
                  <TableRow hover key={mission.id}>
                    <TableCell>{mission.id}</TableCell>
                    <TableCell>
                      <Stack spacing={0.6}>
                        <Typography
                          component="a"
                          href={paths.dashboard.missionDetails(mission.id)}
                          sx={{
                            color: '#111827',
                            textDecoration: 'none',
                            '&:hover': { color: '#4f46e5' },
                          }}
                          variant="subtitle2"
                        >
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
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <IconButton aria-label={`Ouvrir ${mission.title}`} href={paths.dashboard.missionDetails(mission.id)} sx={{ color: '#6366f1' }}>
                          <ArrowRightIcon fontSize="var(--icon-fontSize-md)" />
                        </IconButton>
                        <IconButton
                          aria-label={`Supprimer ${mission.title}`}
                          color="error"
                          onClick={(): void => {
                            handleDeleteMission(mission.id, mission.title);
                          }}
                        >
                          <TrashIcon fontSize="var(--icon-fontSize-md)" />
                        </IconButton>
                      </Stack>
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
