'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';

export interface MissionSelectionRow {
  badge: string;
  id: string;
  modified: string;
  title: string;
}

interface MissionSelectionPanelProps {
  missionRows: MissionSelectionRow[];
  onMissionSelect: (missionId: string) => void;
  onNewMission: () => void;
  onSkip?: () => void;
}

const modifiedLabels = ['Modifiee il y a 2 h', 'Modifiee il y a 1 j', 'Modifiee il y a 3 j'];

export function buildMissionSelectionRows(missions: Array<{ id: string; title: string }>): MissionSelectionRow[] {
  return missions.slice(0, 3).map((mission, index) => ({
    badge: `${index + 1}`.padStart(2, '0'),
    id: mission.id,
    modified: modifiedLabels[index] ?? 'Modifiee recemment',
    title: mission.title,
  }));
}

export function MissionSelectionPanel({
  missionRows,
  onMissionSelect,
  onNewMission,
  onSkip,
}: MissionSelectionPanelProps): React.JSX.Element {
  return (
    <Card
      sx={{
        borderRadius: '22px',
        boxShadow: '0 22px 50px rgba(15, 23, 42, 0.14)',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '0.92fr 1.2fr', xs: '1fr' } }}>
        <Box
          sx={{
            bgcolor: '#fbfbfd',
            borderRight: { md: '1px solid rgba(148, 163, 184, 0.16)', xs: 'none' },
            p: { xs: 2.5, sm: 3 },
          }}
        >
          <Typography
            sx={{
              color: '#6b7280',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Audit interne
          </Typography>
          <Typography sx={{ color: '#1f2937', fontSize: { xs: '1.9rem', sm: '2.2rem' }, fontWeight: 500, mt: 1.5 }}>
            Sessions actives
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.85, maxWidth: 250, mt: 2 }}>
            Selectionne une mission ONCF deja cadree pour poursuivre l&apos;audit interne ou lancer une nouvelle mission ferroviaire.
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'common.white', p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={2.2}>
            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
              <Typography
                sx={{
                  color: '#374151',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Registre des missions ONCF
              </Typography>
              <Link component="button" onClick={onNewMission} sx={{ color: '#574bff', fontSize: '0.92rem', fontWeight: 700 }} type="button" underline="none">
                + Nouvelle mission
              </Link>
            </Stack>

            <Stack spacing={1.3}>
              {missionRows.map((mission) => (
                <ButtonBase
                  key={mission.id}
                  onClick={(): void => onMissionSelect(mission.id)}
                  sx={{ borderRadius: '16px', textAlign: 'left', width: '100%' }}
                  type="button"
                >
                  <Box
                    sx={{
                      alignItems: 'center',
                      backgroundColor: '#f3f4f8',
                      borderRadius: '16px',
                      display: 'flex',
                      gap: 1.5,
                      justifyContent: 'space-between',
                      px: 1.75,
                      py: 1.45,
                      width: '100%',
                    }}
                  >
                    <Stack alignItems="center" direction="row" spacing={1.35}>
                      <Box
                        sx={{
                          alignItems: 'center',
                          backgroundColor: 'common.white',
                          borderRadius: '12px',
                          color: '#574bff',
                          display: 'flex',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          height: 42,
                          justifyContent: 'center',
                          width: 42,
                        }}
                      >
                        {mission.badge}
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#1f2937', fontSize: '1rem', fontWeight: 700 }}>{mission.title}</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.2 }}>
                          {mission.modified}
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowRightIcon color="#c0c4d0" fontSize="var(--icon-fontSize-md)" />
                  </Box>
                </ButtonBase>
              ))}
            </Stack>

            <Box
              sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                color: '#64748b',
                px: 1.75,
                py: 1.4,
              }}
            >
              <Typography sx={{ color: 'inherit', fontSize: '0.84rem', lineHeight: 1.7 }}>
                Clique sur une mission pour la selectionner et ouvrir la vue d&apos;ensemble AuditFlow.
              </Typography>
            </Box>

            {onSkip ? (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={onSkip} sx={{ borderRadius: '12px', minHeight: 40, px: 2 }} variant="outlined">
                  Ignorer
                </Button>
              </Box>
            ) : null}
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
