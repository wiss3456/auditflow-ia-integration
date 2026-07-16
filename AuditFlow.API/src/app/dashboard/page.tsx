'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { ArrowsInSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsInSimple';
import { ArrowsOutSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import dayjs from 'dayjs';

import { MissionTeamMembers } from '@/components/dashboard/missions/mission-team-members';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { filterMissionsForUser } from '@/lib/missions/access';
import type { AuditMission } from '@/lib/missions/mock-data';
import { getSelectedMissionIdForUser } from '@/lib/missions/selection';
import { deleteWorkspaceMission, saveWorkspaceSelectedMission } from '@/lib/workspace-storage';
import { paths } from '@/paths';

const DEFAULT_VERIFICATION_VISIBLE_ROWS = 5;
const FULLSCREEN_VERIFICATION_VISIBLE_ROWS = 10;

function getPhaseConfig(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'Planning': {
      return { bg: '#ede9fe', color: '#6d28d9', label: 'ÉTUDE' };
    }
    case 'Fieldwork': {
      return { bg: '#e0e7ff', color: '#4338ca', label: 'VÉRIFICATION' };
    }
    case 'Review': {
      return { bg: '#f3e8ff', color: '#7e22ce', label: 'CONCLUSION' };
    }
    case 'Follow-up': {
      return { bg: '#e0f2fe', color: '#0369a1', label: 'SUIVI' };
    }
    default: {
      return { bg: '#e5e7eb', color: '#475569', label: 'VUE' };
    }
  }
}

function getStatusConfig(mission: AuditMission): { color: string; label: string } {
  if (dayjs(mission.dueDate).isBefore(dayjs(), 'day') && mission.status !== 'Follow-up') {
    return { color: '#ef4444', label: 'En retard' };
  }

  switch (mission.status) {
    case 'Follow-up': {
      return { color: '#10b981', label: 'Terminée' };
    }
    case 'Review': {
      return { color: '#8b5cf6', label: 'En revue' };
    }
    default: {
      return { color: '#f59e0b', label: 'En cours' };
    }
  }
}

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const verificationTableRef = React.useRef<HTMLDivElement | null>(null);
  const auditMissions = React.useMemo(() => filterMissionsForUser(workspace.missions, user), [user, workspace.missions]);
  const selectedMissionId = React.useMemo(() => getSelectedMissionIdForUser(workspace, user?.id), [user?.id, workspace]);
  const [isVerificationFullscreen, setIsVerificationFullscreen] = React.useState(false);
  const totalMissions = auditMissions.length;
  const completedMissions = auditMissions.filter((mission) => mission.status === 'Follow-up').length;
  const ongoingMissions = auditMissions.filter((mission) => mission.status === 'Planning' || mission.status === 'Fieldwork' || mission.status === 'Review').length;
  const overdueRecommendations = auditMissions.reduce((total, mission) => {
    const isLate = dayjs(mission.dueDate).isBefore(dayjs(), 'day') && mission.status !== 'Follow-up';
    return total + (isLate ? mission.openFindings : 0);
  }, 0);

  const completionRate = Math.round(auditMissions.reduce((total, mission) => total + mission.progress, 0) / Math.max(totalMissions, 1));
  const studyCount = auditMissions.filter((mission) => mission.status === 'Planning').length;
  const verificationCount = auditMissions.filter((mission) => mission.status === 'Fieldwork').length;
  const followUpCount = auditMissions.filter((mission) => mission.status === 'Follow-up').length;
  const pendingReviewCount = auditMissions.filter((mission) => mission.status === 'Review').length;

  const resolvedPercent = Math.round((followUpCount / Math.max(totalMissions, 1)) * 100);
  const ongoingPercent = Math.round(((studyCount + verificationCount) / Math.max(totalMissions, 1)) * 100);
  const pendingReviewPercent = Math.round((pendingReviewCount / Math.max(totalMissions, 1)) * 100);

  const donutGradient = `conic-gradient(#10b981 0 ${resolvedPercent}%, #4f46e5 ${resolvedPercent}% ${
    resolvedPercent + ongoingPercent
  }%, #cbd5e1 ${resolvedPercent + ongoingPercent}% 100%)`;

  const metricCards = [
    {
      accent: '#4f46e5',
      icon: <CheckCircleIcon fontSize="var(--icon-fontSize-lg)" />,
      meta: `${completionRate}% de complétion`,
      title: 'Missions terminées',
      value: completedMissions,
    },
    {
      accent: '#6366f1',
      icon: <ChartPieIcon fontSize="var(--icon-fontSize-lg)" />,
      meta: 'Total suivi',
      title: 'Total des missions',
      value: totalMissions,
    },
    {
      accent: '#8b5cf6',
      icon: <UsersIcon fontSize="var(--icon-fontSize-lg)" />,
      meta: 'En cours',
      title: 'Missions en cours',
      value: ongoingMissions,
    },
    {
      accent: '#ef4444',
      icon: <XSquare fontSize="var(--icon-fontSize-lg)" />,
      meta: 'Action requise',
      title: 'Recommandations en retard',
      value: overdueRecommendations,
    },
  ];

  const activeMissionRows = auditMissions;
  const verificationVisibleRows = activeMissionRows.slice(
    0,
    isVerificationFullscreen ? FULLSCREEN_VERIFICATION_VISIBLE_ROWS : DEFAULT_VERIFICATION_VISIBLE_ROWS
  );

  React.useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsVerificationFullscreen(document.fullscreenElement === verificationTableRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleVerificationFullscreen = async (): Promise<void> => {
    const targetElement = verificationTableRef.current;

    if (!targetElement) {
      return;
    }

    if (document.fullscreenElement === targetElement) {
      await document.exitFullscreen();
      return;
    }

    await targetElement.requestFullscreen();
  };

  const handleSelectMission = React.useCallback((missionId: string): void => {
    if (!user?.id) {
      return;
    }

    saveWorkspaceSelectedMission(user.id, missionId);
  }, [user?.id]);

  const handleDeleteMission = React.useCallback((missionId: string): void => {
    deleteWorkspaceMission(missionId);
  }, []);

  const handleOpenMission = React.useCallback(
    (missionId: string): void => {
      handleSelectMission(missionId);
      router.push(paths.dashboard.missionDetails(missionId));
    },
    [handleSelectMission, router]
  );

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ md: 'row', xs: 'column' }}
        id="overview"
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
              fontSize: { xs: '1.9rem', md: '2.2rem' },
              fontWeight: 700,
              letterSpacing: '-0.04em',
              mt: 0.75,
            }}
          >
            Performance globale
          </Typography>
        </Box>
        <Button
          endIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          href={paths.dashboard.newMission}
          sx={{ borderRadius: '12px', minHeight: 42, px: 2 }}
          variant="contained"
        >
          Nouvelle mission
        </Button>
      </Stack>

      <Grid container id="study-phase" spacing={2}>
        {metricCards.map((card) => (
          <Grid
            key={card.title}
            size={{
              lg: 3,
              md: 6,
              xs: 12,
            }}
          >
            <Card
              sx={{
                borderRadius: '18px',
                boxShadow: '0 14px 30px rgba(15, 23, 42, 0.07)',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 2.25 }}>
                <Stack spacing={2}>
                  <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
                    <Box
                      sx={{
                        alignItems: 'center',
                        backgroundColor: `${card.accent}1a`,
                        borderRadius: '12px',
                        color: card.accent,
                        display: 'flex',
                        height: 36,
                        justifyContent: 'center',
                        width: 36,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography sx={{ color: card.accent, fontSize: '0.74rem', fontWeight: 700 }}>{card.meta}</Typography>
                  </Stack>
                  <Box>
                    <Typography color="text.secondary" sx={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {card.title}
                    </Typography>
                    <Typography sx={{ color: '#111827', fontSize: '1.85rem', fontWeight: 700, mt: 0.5 }}>
                      {card.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid
          id="verification"
          size={{
            lg: 8,
            xs: 12,
          }}
        >
          <Card
            sx={{
              borderRadius: '20px',
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.07)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2} sx={{ p: 2.25 }}>
                <Typography sx={{ color: '#111827', fontSize: '1.15rem', fontWeight: 700 }}>Registre des missions ONCF</Typography>
                <Button endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />} href={paths.dashboard.missions} variant="text">
                  Voir tout
                </Button>
              </Stack>
              <Box
                ref={verificationTableRef}
                sx={{
                  overflow: 'hidden',
                  position: 'relative',
                  '&:fullscreen': {
                    backgroundColor: '#ffffff',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'auto',
                    p: 1.5,
                  },
                }}
              >
                <Box sx={{ position: 'absolute', right: 12, top: 12, zIndex: 3 }}>
                  <IconButton
                    aria-label={isVerificationFullscreen ? 'Quitter le plein écran' : 'Activer le plein écran'}
                    onClick={(): void => {
                      void toggleVerificationFullscreen();
                    }}
                    size="small"
                    sx={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(148, 163, 184, 0.24)',
                      borderRadius: '999px',
                      boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
                      color: '#475569',
                      height: 30,
                      width: 30,
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        borderColor: 'rgba(99, 102, 241, 0.28)',
                      },
                    }}
                  >
                    {isVerificationFullscreen ? <ArrowsInSimpleIcon fontSize="0.98rem" /> : <ArrowsOutSimpleIcon fontSize="0.98rem" />}
                  </IconButton>
                </Box>
                <Box sx={{ overflowX: 'auto', px: 1.25, pb: 1.5 }}>
                <Table sx={{ minWidth: 760 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Détails de mission</TableCell>
                      <TableCell>Phase</TableCell>
                      <TableCell>Responsable</TableCell>
                      <TableCell>Equipe</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {verificationVisibleRows.map((mission) => {
                      const phase = getPhaseConfig(mission.status);
                      const status = getStatusConfig(mission);

                      return (
                        <TableRow
                          hover
                          key={mission.id}
                          onClick={(): void => {
                            handleSelectMission(mission.id);
                          }}
                          sx={{
                            cursor: 'pointer',
                            transition: 'background-color 120ms ease',
                            ...(selectedMissionId === mission.id
                              ? {
                                  backgroundColor: '#eef2ff',
                                  '& td': { borderColor: 'rgba(99, 102, 241, 0.16)' },
                                  '&:hover': { backgroundColor: '#e0e7ff' },
                                }
                              : {}),
                          }}
                        >
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography sx={{ color: '#111827', fontSize: '1.02rem', fontWeight: 700 }}>{mission.title}</Typography>
                              <Typography color="text.secondary" variant="body2">
                                ID: {mission.id}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                backgroundColor: phase.bg,
                                borderRadius: '999px',
                                color: phase.color,
                                display: 'inline-flex',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                px: 1,
                                py: 0.45,
                              }}
                            >
                              {phase.label}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Stack alignItems="center" direction="row" spacing={1}>
                              <Typography variant="body2">{mission.owner}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ minWidth: 140 }}>
                            <MissionTeamMembers mission={mission} />
                          </TableCell>
                          <TableCell>
                            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1.5}>
                              <Stack alignItems="center" direction="row" spacing={1}>
                                <Box
                                  sx={{
                                    backgroundColor: status.color,
                                    borderRadius: '50%',
                                    height: 8,
                                    width: 8,
                                  }}
                                />
                                <Typography variant="body2">{status.label}</Typography>
                              </Stack>
                              <Stack alignItems="center" direction="row" spacing={0.5}>
                                <IconButton
                                  aria-label={`Consulter ${mission.title}`}
                                  href={paths.dashboard.missionDetails(mission.id)}
                                  onClick={(event): void => {
                                    event.stopPropagation();
                                  }}
                                  sx={{ color: '#64748b' }}
                                >
                                  <EyeIcon fontSize="var(--icon-fontSize-md)" />
                                </IconButton>
                                <IconButton
                                  aria-label={`Sélectionner ${mission.title}`}
                                  onClick={(event): void => {
                                    event.stopPropagation();
                                    handleOpenMission(mission.id);
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
                                <IconButton
                                  aria-label={`Supprimer ${mission.title}`}
                                  color="error"
                                  onClick={(event): void => {
                                    event.stopPropagation();
                                    handleDeleteMission(mission.id);
                                  }}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: '#fef2f2',
                                    },
                                  }}
                                >
                                  <TrashIcon fontSize="var(--icon-fontSize-md)" />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          id="conclusion"
          size={{
            lg: 4,
            xs: 12,
          }}
        >
          <Card
            sx={{
              borderRadius: '20px',
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.07)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={2.25}>
                <Typography
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  Synthese des missions
                </Typography>

                <Stack alignItems="center" spacing={2.5}>
                  <Box
                    sx={{
                      alignItems: 'center',
                      background: donutGradient,
                      borderRadius: '50%',
                      display: 'flex',
                      height: 118,
                      justifyContent: 'center',
                      position: 'relative',
                      width: 118,
                      '&::after': {
                        backgroundColor: 'common.white',
                        borderRadius: '50%',
                        content: '""',
                        height: 84,
                        position: 'absolute',
                        width: 84,
                      },
                    }}
                  >
                    <Stack spacing={0.35} sx={{ alignItems: 'center', position: 'relative', zIndex: 1 }}>
                      <Typography sx={{ color: '#111827', fontSize: '1.7rem', fontWeight: 700 }}>{completionRate}%</Typography>
                      <Typography sx={{ color: '#6b7280', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        Suivi
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Stack spacing={1.4}>
                  {[
                    { color: '#10b981', label: 'Resolues', value: resolvedPercent },
                    { color: '#4f46e5', label: 'Implementation en cours', value: ongoingPercent },
                    { color: '#94a3b8', label: 'En attente de revue', value: pendingReviewPercent },
                  ].map((item) => (
                    <Stack key={item.label} spacing={0.6}>
                      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
                        <Typography sx={{ color: '#374151', fontSize: '0.84rem', fontWeight: 600 }}>{item.label}</Typography>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.82rem', fontWeight: 600 }}>{item.value}%</Typography>
                      </Stack>
                      <Box
                        sx={{
                          backgroundColor: '#e5e7eb',
                          borderRadius: '999px',
                          height: 8,
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ backgroundColor: item.color, borderRadius: '999px', height: '100%', width: `${item.value}%` }} />
                      </Box>
                    </Stack>
                  ))}
                </Stack>

              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card
        id="follow-up"
        sx={{
          borderRadius: '20px',
          boxShadow: '0 14px 30px rgba(15, 23, 42, 0.07)',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Typography sx={{ color: '#111827', fontSize: '1.08rem', fontWeight: 700 }}>Priorites de suivi ONCF</Typography>
            <Grid container spacing={1.5}>
              {auditMissions
                .filter((mission) => mission.openFindings > 0)
                .slice(0, 3)
                .map((mission) => (
                  <Grid
                    key={mission.id}
                    size={{
                      md: 4,
                      xs: 12,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid rgba(148, 163, 184, 0.16)',
                        borderRadius: '16px',
                        p: 1.75,
                      }}
                    >
                      <Typography sx={{ color: '#111827', fontSize: '0.94rem', fontWeight: 700 }}>{mission.title}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.65, mt: 0.55 }}>
                        {mission.openFindings} recommandation(s) ouverte(s) – prochaine action : {mission.nextAction}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
