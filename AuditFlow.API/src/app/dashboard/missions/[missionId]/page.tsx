'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import dayjs from 'dayjs';

import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { canUserAccessMission } from '@/lib/missions/access';
import { getMissionTeamMembers } from '@/lib/missions/team';
import { paths } from '@/paths';
import { deleteWorkspaceMission } from '@/lib/workspace-storage';

function getPhaseLabel(status: string): string {
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
    default: {
      return "Vue d'ensemble";
    }
  }
}

function getPriorityColor(priority: string): 'error' | 'success' | 'warning' {
  switch (priority) {
    case 'High': {
      return 'error';
    }
    case 'Medium': {
      return 'warning';
    }
    default: {
      return 'success';
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

function getStatusLabel(status: string): string {
  switch (status) {
    case 'Planning':
    case 'Fieldwork': {
      return 'En cours';
    }
    case 'Review': {
      return 'En revue';
    }
    case 'Follow-up': {
      return 'Terminée';
    }
    default: {
      return status;
    }
  }
}

function getDisplayValue(value: string): string {
  return value.trim() || '—';
}

export default function Page(): React.JSX.Element {
  const params = useParams<{ missionId: string }>();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { isLoading, user } = useUser();
  const { workspace } = useWorkspace();
  const missionId = Array.isArray(params.missionId) ? params.missionId[0] : params.missionId;
  const mission = workspace.missions.find((item) => item.id === missionId);

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Chargement...</Typography>
        <Typography color="text.secondary">Vérification des droits d&apos;accès à la mission en cours.</Typography>
      </Stack>
    );
  }

  if (!mission) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Mission introuvable</Typography>
        <Typography color="text.secondary">Cette mission n&apos;existe plus dans le registre partagé de l&apos;application.</Typography>
        <Button href={paths.dashboard.missions} startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />} variant="outlined">
          Retour aux missions
        </Button>
      </Stack>
    );
  }

  if (!canUserAccessMission(user, mission)) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Accès restreint</Typography>
        <Typography color="text.secondary">Cette mission n&apos;est pas assignée à ton compte ou n&apos;a pas été créée par toi.</Typography>
        <Button href={paths.dashboard.missions} startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />} variant="outlined">
          Retour aux missions
        </Button>
      </Stack>
    );
  }

  const details = [
    { label: 'Responsable', value: getDisplayValue(mission.owner) },
    { label: 'Entité auditée', value: getDisplayValue(mission.client) },
    { label: 'Site', value: getDisplayValue(mission.site) },
    { label: 'Échéance', value: dayjs(mission.dueDate).format('DD MMM YYYY') },
    { label: 'Phase', value: getPhaseLabel(mission.status) },
    { label: 'Priorité', value: getPriorityLabel(mission.priority) },
  ];
  const teamMembers = getMissionTeamMembers(mission);

  return (
    <Stack spacing={3.5}>
      <Stack
        direction={{ md: 'row', xs: 'column' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ alignItems: { md: 'center', xs: 'flex-start' } }}
      >
        <Box>
          <Typography
            sx={{
              color: '#6366f1',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Audit interne ONCF
          </Typography>
          <Typography
            sx={{
              color: '#0f172a',
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontSize: { xs: '2rem', md: '2.4rem' },
              fontWeight: 700,
              letterSpacing: '-0.04em',
              mt: 0.75,
            }}
          >
            {mission.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Reference {mission.id} - {mission.client}
          </Typography>
        </Box>

        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.2}>
          <Button
            href={paths.dashboard.missions}
            startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />}
            sx={{ borderRadius: '14px', minHeight: 46 }}
            variant="outlined"
          >
            Retour aux missions
          </Button>
          <Button
            href={`${paths.dashboard.newMission}?missionId=${encodeURIComponent(mission.id)}`}
            startIcon={<PencilSimpleIcon fontSize="var(--icon-fontSize-md)" />}
            sx={{ borderRadius: '14px', minHeight: 46 }}
            variant="contained"
          >
            Modifier
          </Button>
          <Button
            color="error"
            onClick={(): void => {
              deleteWorkspaceMission(mission.id);
              addNotification({
                message: `La mission ${mission.title} a ete supprimee de l'espace partage.`,
                title: 'Mission',
              });
              router.push(paths.dashboard.missions);
            }}
            startIcon={<TrashIcon fontSize="var(--icon-fontSize-md)" />}
            sx={{ borderRadius: '14px', minHeight: 46 }}
            variant="outlined"
          >
            Supprimer la mission
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid
          size={{
            lg: 8,
            xs: 12,
          }}
        >
          <Card
            sx={{
              borderRadius: '24px',
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <Chip color={getPriorityColor(mission.priority)} label={getPriorityLabel(mission.priority)} size="small" />
                  <Chip label={getPhaseLabel(mission.status)} size="small" sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 700 }} />
                  <Chip label={getStatusLabel(mission.status)} size="small" sx={{ bgcolor: '#f8fafc', color: '#334155', fontWeight: 700 }} />
                </Stack>

                <Box>
                  <Typography sx={{ color: '#111827', fontSize: '1.12rem', fontWeight: 700 }}>Objectif de la mission</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.9, mt: 1.1 }}>
                    {getDisplayValue(mission.objective)}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {details.map((item) => (
                    <Grid
                      key={item.label}
                      size={{
                        md: 4,
                        xs: 12,
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid rgba(148, 163, 184, 0.16)',
                          borderRadius: '18px',
                          p: 2,
                        }}
                      >
                        <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ color: '#111827', fontSize: '1rem', fontWeight: 600, mt: 1 }}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box>
                  <Typography sx={{ color: '#111827', fontSize: '1.12rem', fontWeight: 700 }}>Perimetre d&apos;audit</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.9, mt: 1.1 }}>
                    {getDisplayValue(mission.scope)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            lg: 4,
            xs: 12,
          }}
        >
          <Stack spacing={3}>
            <Card
              sx={{
                borderRadius: '24px',
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Typography sx={{ color: '#111827', fontSize: '1.12rem', fontWeight: 700 }}>Equipe</Typography>
                  <Stack spacing={1.25}>
                    {teamMembers.map((member) => (
                      <Stack alignItems="center" direction="row" key={member.id} spacing={1.25}>
                        <Avatar src={member.avatar} sx={{ fontSize: '0.82rem', fontWeight: 700, height: 34, width: 34 }}>
                          {member.initials}
                        </Avatar>
                        <Typography sx={{ color: '#111827', fontWeight: 600 }}>{member.name}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: '24px',
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Typography sx={{ color: '#111827', fontSize: '1.12rem', fontWeight: 700 }}>Résumé de mission</Typography>
                  <Box>
                    <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Entité auditée
                    </Typography>
                    <Typography sx={{ color: '#111827', fontWeight: 600, mt: 0.8 }}>{getDisplayValue(mission.client)}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Site operationnel
                    </Typography>
                    <Typography sx={{ color: '#111827', fontWeight: 600, mt: 0.8 }}>{getDisplayValue(mission.site)}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Échéance
                    </Typography>
                    <Typography sx={{ color: '#111827', fontWeight: 600, mt: 0.8 }}>{dayjs(mission.dueDate).format('DD MMMM YYYY')}</Typography>
                  </Box>
                  <Button href={paths.dashboard.overview} sx={{ borderRadius: '14px', mt: 1 }} variant="contained">
                    Retour au tableau de bord
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
