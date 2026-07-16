'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ArrowsInSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsInSimple';
import { ArrowsOutSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple';
import dayjs from 'dayjs';

import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { fetchMissionLookupItems, type MissionLookupItem } from '@/lib/missions/api';
import { getSelectedMissionIdForUser } from '@/lib/missions/selection';

type RiskImpact = 'Low' | 'Medium' | 'High';
type FinalRiskAssessment = 'Critique' | 'Moderee' | 'Mineure';
type RiskDecisionStatus = 'Brouillon' | 'Accepte' | 'Refuse';
type SearchFilter = 'mission-id' | 'mission-subject' | 'date';

interface RiskBaseRow {
  auditableObject: string;
  auditableSubObject: string;
  controlMeasure: string;
  decisionStatus: RiskDecisionStatus;
  id: string;
  impact: RiskImpact;
  operationalControlObjective: string;
  risk: string;
  riskAssessment: FinalRiskAssessment;
}

const searchFilterOptions = [
  { label: 'Identifiant de mission', value: 'mission-id' },
  { label: 'Sujet de la mission', value: 'mission-subject' },
  { label: 'Date', value: 'date' },
] as const satisfies Array<{ label: string; value: SearchFilter }>;

const impactTextColor = {
  High: '#CE2626',
  Low: '#438A70',
  Medium: '#D97A2B',
} satisfies Record<RiskImpact, string>;

const impactFieldBackground = {
  High: '#FCA5A5',
  Low: '#86EFAC',
  Medium: '#FFC570',
} satisfies Record<RiskImpact, string>;

function isRiskImpact(value: unknown): value is RiskImpact {
  return value === 'Low' || value === 'Medium' || value === 'High';
}

function isFinalRiskAssessment(value: unknown): value is FinalRiskAssessment {
  return value === 'Critique' || value === 'Moderee' || value === 'Mineure';
}

function getImpactLabel(impact: RiskImpact): string {
  if (impact === 'High') {
    return 'Elevee';
  }

  if (impact === 'Low') {
    return 'Faible';
  }

  return 'Moyenne';
}

function deriveImpactFromAssessment(riskAssessment: FinalRiskAssessment): RiskImpact {
  if (riskAssessment === 'Critique') {
    return 'High';
  }

  if (riskAssessment === 'Mineure') {
    return 'Low';
  }

  return 'Medium';
}

function normalizeSearchValue(value: string): string {
  return value.normalize('NFD').replaceAll(/\p{Diacritic}/gu, '').trim().toLowerCase();
}

function getAllRiskBaseRows(studyPhaseState: unknown): RiskBaseRow[] {
  if (!studyPhaseState || typeof studyPhaseState !== 'object') {
    return [];
  }

  const studyPhaseRecord = studyPhaseState as Record<string, unknown>;
  const riskListingState = studyPhaseRecord['risk-listing'];

  if (!riskListingState || typeof riskListingState !== 'object') {
    return [];
  }

  const riskRows = (riskListingState as Record<string, unknown>).riskRows;

  if (!Array.isArray(riskRows)) {
    return [];
  }

  return riskRows
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
    .map((row) => {
      const riskAssessment = isFinalRiskAssessment(row.riskAssessment) ? row.riskAssessment : 'Moderee';
      const impact = isRiskImpact(row.impact) ? row.impact : deriveImpactFromAssessment(riskAssessment);
      const decisionStatus: RiskDecisionStatus =
        row.decisionStatus === 'Accepte' || row.decisionStatus === 'Refuse' || row.decisionStatus === 'Brouillon'
          ? row.decisionStatus
          : 'Brouillon';

      return {
        auditableObject:
          typeof row.auditableObject === 'string' && row.auditableObject.trim() ? row.auditableObject : 'Perimetre global',
        auditableSubObject:
          typeof row.auditableSubObject === 'string' && row.auditableSubObject.trim() ? row.auditableSubObject : 'Composante specifique',
        controlMeasure:
          typeof row.controlMeasure === 'string' && row.controlMeasure.trim() ? row.controlMeasure : 'Bonnes pratiques a renseigner',
        decisionStatus,
        id: typeof row.id === 'string' && row.id ? row.id : `risk-base-${Math.random().toString(36).slice(2, 8)}`,
        impact,
        operationalControlObjective:
          typeof row.operationalControlObjective === 'string' && row.operationalControlObjective.trim()
            ? row.operationalControlObjective
            : 'Objectif de controle a renseigner',
        risk: typeof row.risk === 'string' && row.risk.trim() ? row.risk : 'Risque a renseigner',
        riskAssessment,
      };
    });
}

function getStudyMissionReference(studyPhaseState: unknown): string | null {
  if (!studyPhaseState || typeof studyPhaseState !== 'object') {
    return null;
  }

  const studyPhaseRecord = studyPhaseState as Record<string, unknown>;
  const orientationState = studyPhaseRecord['orientation-report'];

  if (orientationState && typeof orientationState === 'object') {
    const orientationReport = (orientationState as Record<string, unknown>).orientationReport;

    if (orientationReport && typeof orientationReport === 'object') {
      const missionReference = (orientationReport as Record<string, unknown>).missionReference;

      if (typeof missionReference === 'string' && missionReference.trim()) {
        return missionReference.trim();
      }
    }
  }

  return null;
}

function missionMatchesSearch(mission: MissionLookupItem, query: string, filter: SearchFilter): boolean {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = normalizeSearchValue(query);

  if (filter === 'mission-id') {
    return normalizeSearchValue(mission.missionId).includes(normalizedQuery);
  }

  if (filter === 'date') {
    const isoDate = dayjs(mission.date).format('YYYY-MM-DD');
    const frenchDate = dayjs(mission.date).format('DD/MM/YYYY');
    return normalizeSearchValue(isoDate).includes(normalizedQuery) || normalizeSearchValue(frenchDate).includes(normalizedQuery);
  }

  return normalizeSearchValue(mission.subject).includes(normalizedQuery);
}

function buildRiskAssessmentSummary(rows: RiskBaseRow[]): string {
  const critical = rows.filter((row) => row.riskAssessment === 'Critique').length;
  const moderate = rows.filter((row) => row.riskAssessment === 'Moderee').length;
  const minor = rows.filter((row) => row.riskAssessment === 'Mineure').length;

  return `Critique ${critical} | Modérée ${moderate} | Mineure ${minor}`;
}

function buildRiskStatusSummary(rows: RiskBaseRow[]): string {
  const draft = rows.filter((row) => row.decisionStatus === 'Brouillon').length;
  const accepted = rows.filter((row) => row.decisionStatus === 'Accepte').length;
  const refused = rows.filter((row) => row.decisionStatus === 'Refuse').length;

  return `Brouillon ${draft} | Accepte ${accepted} | Refuse ${refused}`;
}

function buildFallbackMission(workspaceMissionId: string | null, studyMissionReference: string | null): MissionLookupItem | null {
  const missionId = workspaceMissionId || studyMissionReference;

  if (!missionId) {
    return null;
  }

  return {
    databaseId: missionId,
    date: dayjs().format('YYYY-MM-DD'),
    missionId,
    subject: 'Mission en attente de synchronisation base de donnees',
  };
}

function getRiskAssessmentTone(riskAssessment: FinalRiskAssessment): { background: string; color: string } {
  if (riskAssessment === 'Critique') {
    return { background: impactFieldBackground.High, color: impactTextColor.High };
  }

  if (riskAssessment === 'Mineure') {
    return { background: impactFieldBackground.Low, color: impactTextColor.Low };
  }

  return { background: impactFieldBackground.Medium, color: impactTextColor.Medium };
}

interface FullscreenToggleButtonProps {
  isFullscreen: boolean;
  onClick: () => void;
}

function FullscreenToggleButton({ isFullscreen, onClick }: FullscreenToggleButtonProps): React.JSX.Element {
  return (
    <IconButton
      aria-label={isFullscreen ? 'Quitter le plein ecran' : 'Activer le plein ecran'}
      onClick={onClick}
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
      {isFullscreen ? <ArrowsInSimpleIcon fontSize="0.98rem" /> : <ArrowsOutSimpleIcon fontSize="0.98rem" />}
    </IconButton>
  );
}

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const { isReady, workspace } = useWorkspace();
  const riskTableRef = React.useRef<HTMLDivElement | null>(null);
  const [missionLookupItems, setMissionLookupItems] = React.useState<MissionLookupItem[]>([]);
  const [missionLookupError, setMissionLookupError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFilter, setSearchFilter] = React.useState<SearchFilter>('mission-subject');
  const [selectedMissionId, setSelectedMissionId] = React.useState<string | null>(null);
  const [isTableFullscreen, setIsTableFullscreen] = React.useState(false);

  const allRiskRows = React.useMemo(() => getAllRiskBaseRows(workspace.studyPhaseState), [workspace.studyPhaseState]);
  const pendingRows = React.useMemo(() => allRiskRows.filter((row) => row.decisionStatus === 'Brouillon'), [allRiskRows]);
  const workspaceMissionId = React.useMemo(() => getSelectedMissionIdForUser(workspace, user?.id), [user?.id, workspace]);
  const studyMissionReference = React.useMemo(() => getStudyMissionReference(workspace.studyPhaseState), [workspace.studyPhaseState]);

  React.useEffect(() => {
    let isMounted = true;

    void (async (): Promise<void> => {
      try {
        const nextItems = await fetchMissionLookupItems();

        if (!isMounted) {
          return;
        }

        setMissionLookupItems(nextItems);
        setMissionLookupError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMissionLookupItems([]);
        setMissionLookupError(error instanceof Error ? error.message : 'Chargement des missions depuis la base impossible.');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const matchedMissions = React.useMemo(
    () => missionLookupItems.filter((mission) => missionMatchesSearch(mission, searchQuery, searchFilter)),
    [missionLookupItems, searchFilter, searchQuery]
  );

  const linkedMission = React.useMemo(() => {
    const preferredMissionId = selectedMissionId || workspaceMissionId || studyMissionReference;

    if (preferredMissionId) {
      const exactMatch = missionLookupItems.find((mission) => mission.missionId === preferredMissionId);

      if (exactMatch) {
        return exactMatch;
      }
    }

    if (searchQuery.trim() && matchedMissions.length > 0) {
      return matchedMissions[0];
    }

    if (missionLookupItems.length > 0) {
      return missionLookupItems[0];
    }

    return buildFallbackMission(workspaceMissionId, studyMissionReference);
  }, [matchedMissions, missionLookupItems, searchQuery, selectedMissionId, studyMissionReference, workspaceMissionId]);

  const searchHidesMission = React.useMemo(() => {
    if (!linkedMission || !searchQuery.trim()) {
      return false;
    }

    return !missionMatchesSearch(linkedMission, searchQuery, searchFilter);
  }, [linkedMission, searchFilter, searchQuery]);

  const visiblePendingRows = searchHidesMission ? [] : pendingRows;
  const totalRiskCount = searchHidesMission ? 0 : allRiskRows.length;
  const riskAssessmentSummary = searchHidesMission ? 'Aucun resultat' : buildRiskAssessmentSummary(allRiskRows);
  const riskStatusSummary = searchHidesMission ? 'Aucun resultat' : buildRiskStatusSummary(allRiskRows);
  const riskAssessmentCounts = {
    Critique: searchHidesMission ? 0 : allRiskRows.filter((row) => row.riskAssessment === 'Critique').length,
    Mineure: searchHidesMission ? 0 : allRiskRows.filter((row) => row.riskAssessment === 'Mineure').length,
    Moderee: searchHidesMission ? 0 : allRiskRows.filter((row) => row.riskAssessment === 'Moderee').length,
  } satisfies Record<FinalRiskAssessment, number>;
  const impactCounts = {
    High: searchHidesMission ? 0 : allRiskRows.filter((row) => row.impact === 'High').length,
    Low: searchHidesMission ? 0 : allRiskRows.filter((row) => row.impact === 'Low').length,
    Medium: searchHidesMission ? 0 : allRiskRows.filter((row) => row.impact === 'Medium').length,
  } satisfies Record<RiskImpact, number>;
  const totalMissionCount = missionLookupItems.length > 0 ? missionLookupItems.length : workspace.missions.length;
  const kpiCards = [
    {
      accent: '#4338ca',
      column: 'left',
      helper: 'Volume global du registre pour la mission rattachee.',
      kind: 'metric',
      minHeight: 96,
      title: 'Total des risques',
      value: totalRiskCount,
    },
    {
      accent: '#0f766e',
      column: 'left',
      helper: 'Repartition des impacts avec les couleurs du tableau.',
      kind: 'list-impact',
      minHeight: 148,
      title: 'Impact',
      value: riskStatusSummary,
    },
    {
      accent: '#ea580c',
      column: 'right',
      helper: 'Lecture par niveau d evaluation du risque.',
      kind: 'list-assessment',
      minHeight: 158,
      title: 'Risques par evolution',
      value: riskAssessmentSummary,
    },
    {
      accent: '#2563eb',
      column: 'right',
      helper: 'Nombre total de missions remontees depuis la base.',
      kind: 'metric',
      minHeight: 96,
      title: 'Total des missions',
      value: totalMissionCount,
    },
  ] as const;
  const leftKpiCards = kpiCards.filter((card) => card.column === 'left');
  const rightKpiCards = kpiCards.filter((card) => card.column === 'right');

  React.useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsTableFullscreen(document.fullscreenElement === riskTableRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleTableFullscreen = async (): Promise<void> => {
    const targetElement = riskTableRef.current;

    if (!targetElement) {
      return;
    }

    if (document.fullscreenElement === targetElement) {
      await document.exitFullscreen();
      return;
    }

    await targetElement.requestFullscreen();
  };

  return (
    <Stack spacing={3}>
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
            Registre dynamique
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
            Base des risques
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 820, mt: 1.25 }}>
            Le tableau reprend les risques en attente de la phase d’étude, enrichis par les informations de mission issues de la base de données.
          </Typography>
        </Box>
        {linkedMission ? (
          <Chip
            label={`${linkedMission.missionId} | ${linkedMission.subject}`}
            size="small"
            sx={{ backgroundColor: '#eef2ff', color: '#4338ca', fontWeight: 700 }}
          />
        ) : null}
      </Stack>

      <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ lg: 6, xs: 12 }}>
          <Card sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '22px', boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ color: '#111827', fontSize: '1.02rem', fontWeight: 700 }}>Recherche mission</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.65 }}>
                    Recherche par identifiant de mission, sujet de mission ou date pour retrouver rapidement la mission rattachée au registre.
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  onChange={(event): void => {
                    setSearchQuery(event.target.value);
                  }}
                  placeholder={
                    searchFilter === 'mission-id'
                      ? 'Ex. : ONCF-AI-2026-001'
                      : searchFilter === 'date'
                        ? 'Ex: 2026-04-24 ou 24/04/2026'
                        : 'Ex: maintenance materiel roulant'
                  }
                  size="medium"
                  value={searchQuery}
                />

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {searchFilterOptions.map((option) => (
                    <Button
                      key={option.value}
                      onClick={(): void => {
                        setSearchFilter(option.value);
                      }}
                      sx={{ borderRadius: '999px', px: 1.5 }}
                      variant={searchFilter === option.value ? 'contained' : 'outlined'}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Stack>

                {matchedMissions.length > 0 ? (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {matchedMissions.slice(0, 4).map((mission) => (
                      <Chip
                        key={mission.databaseId}
                        label={`${mission.missionId} | ${mission.subject}`}
                        onClick={(): void => {
                          setSelectedMissionId(mission.missionId);
                        }}
                        sx={{
                          backgroundColor: selectedMissionId === mission.missionId ? '#dbeafe' : '#f8fafc',
                          color: selectedMissionId === mission.missionId ? '#1d4ed8' : '#475569',
                          fontWeight: 700,
                        }}
                      />
                    ))}
                  </Stack>
                ) : null}

                {missionLookupError ? (
                  <Typography sx={{ color: '#c2410c', fontSize: '0.82rem', fontWeight: 600 }}>
                    {missionLookupError}
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ lg: 6, xs: 12 }}>
          <Box
            sx={{
              display: 'grid',
              gap: 1.25,
              gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
            }}
          >
            {[leftKpiCards, rightKpiCards].map((columnCards, columnIndex) => (
              <Stack key={columnIndex} spacing={1.25}>
                {columnCards.map((card) => (
                  <Card
                    key={card.title}
                    sx={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(148, 163, 184, 0.18)',
                      borderRadius: '20px',
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.55,
                        height: '100%',
                        justifyContent: 'flex-start',
                        minHeight: card.minHeight,
                        p: 1.35,
                      }}
                    >
                      <Typography sx={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.25 }}>{card.title}</Typography>
                      <Box
                        sx={{
                          alignItems: card.kind === 'metric' ? 'center' : 'flex-start',
                          borderRadius: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          justifyContent: 'center',
                          mt: 0.15,
                          px: 1.1,
                          py: 0.9,
                          textAlign: 'left',
                        }}
                      >
                        {card.kind === 'metric' ? (
                          <Typography
                            sx={{
                              color: card.accent,
                              fontSize: '2.1rem',
                              fontWeight: 800,
                              letterSpacing: '-0.03em',
                              lineHeight: 1.15,
                            }}
                          >
                            {card.value}
                          </Typography>
                        ) : null}
                        {card.kind === 'list-assessment' ? (
                          <Stack spacing={0.7} sx={{ width: '100%' }}>
                            {(['Critique', 'Moderee', 'Mineure'] as FinalRiskAssessment[]).map((level) => {
                              const tone = getRiskAssessmentTone(level);

                              return (
                                <Box
                                  key={level}
                                  sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <Chip
                                    label={level === 'Moderee' ? 'Modérée' : level}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'transparent',
                                      color: tone.color,
                                      fontWeight: 700,
                                    }}
                                  />
                                  <Typography sx={{ color: tone.color, fontSize: '0.92rem', fontWeight: 800 }}>
                                    {riskAssessmentCounts[level]}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Stack>
                        ) : null}
                        {card.kind === 'list-impact' ? (
                          <Stack spacing={0.7} sx={{ width: '100%' }}>
                            {(['Low', 'Medium', 'High'] as RiskImpact[]).map((level) => (
                              <Box
                                key={level}
                                sx={{
                                  alignItems: 'center',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Chip
                                  label={getImpactLabel(level)}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: impactTextColor[level],
                                    fontWeight: 700,
                                  }}
                                />
                                <Typography sx={{ color: impactTextColor[level], fontSize: '0.92rem', fontWeight: 800 }}>
                                  {impactCounts[level]}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        ) : null}
                      </Box>
                      <Typography
                        sx={{
                          color: '#64748b',
                          fontSize: '0.67rem',
                          lineHeight: 1.5,
                          mt: 'auto',
                        }}
                      >
                        {card.helper}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Card
        sx={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '22px',
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Stack direction={{ sm: 'row', xs: 'column' }} justifyContent="space-between" spacing={2} sx={{ alignItems: { sm: 'center', xs: 'flex-start' } }}>
              <Box>
                <Typography sx={{ color: '#111827', fontSize: '1.15rem', fontWeight: 700 }}>Tableau des risques</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  Les colonnes mission sont alimentées depuis la base, tandis que les lignes de risque proviennent de la phase d’étude en attente de décision.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {linkedMission ? <Chip label={`Identifiant de mission : ${linkedMission.missionId}`} size="small" /> : null}
                {linkedMission ? <Chip label={`Date : ${dayjs(linkedMission.date).format('DD/MM/YYYY')}`} size="small" /> : null}
                <Chip label={`${visiblePendingRows.length} risque(s)`} size="small" />
              </Stack>
            </Stack>

            <Box
              ref={riskTableRef}
              sx={{
                border: '1px solid rgba(148, 163, 184, 0.14)',
                borderRadius: '22px',
                overflow: 'hidden',
                position: 'relative',
                '&:fullscreen': {
                  backgroundColor: '#ffffff',
                  borderRadius: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  overflow: 'auto',
                  pb: 1.5,
                  pt: 6,
                  px: 1.5,
                },
              }}
            >
              <Box sx={{ position: 'absolute', right: 12, top: 12, zIndex: 3 }}>
                <FullscreenToggleButton isFullscreen={isTableFullscreen} onClick={(): void => void toggleTableFullscreen()} />
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 1880 }}>
                  <Box
                    sx={{
                      backgroundColor: '#f8fafc',
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns:
                        '160px minmax(240px, 1.35fr) minmax(170px, 1.05fr) minmax(170px, 1.05fr) minmax(220px, 1.35fr) minmax(240px, 1.55fr) 160px 130px minmax(220px, 1.35fr)',
                      px: 2,
                      py: 1.6,
                    }}
                  >
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Identifiant de mission</Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Sujet de la mission</Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Objet auditable</Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Sous-objet auditable</Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Intitule du risque</Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Objectif operationnel de controle
                    </Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Evaluation du risque</Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Impact</Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Bonnes pratiques</Typography>
                  </Box>
                  <Divider />

                  {visiblePendingRows.length > 0 && linkedMission ? (
                    visiblePendingRows.map((row) => (
                      <React.Fragment key={row.id}>
                        <Box
                          sx={{
                            alignItems: 'start',
                            display: 'grid',
                            gap: 1.5,
                            gridTemplateColumns:
                              '160px minmax(240px, 1.35fr) minmax(170px, 1.05fr) minmax(170px, 1.05fr) minmax(220px, 1.35fr) minmax(240px, 1.55fr) 160px 130px minmax(220px, 1.35fr)',
                            px: 2,
                            py: 1.7,
                          }}
                        >
                          <Typography sx={{ color: '#4f46e5', fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {linkedMission.missionId}
                          </Typography>
                          <Typography sx={{ color: '#111827', fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {linkedMission.subject}
                          </Typography>
                          <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {row.auditableObject}
                          </Typography>
                          <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {row.auditableSubObject}
                          </Typography>
                          <Typography sx={{ color: '#111827', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {row.risk}
                          </Typography>
                          <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {row.operationalControlObjective}
                          </Typography>
                          <Chip
                            label={row.riskAssessment}
                            size="small"
                            sx={{
                              alignSelf: 'flex-start',
                              backgroundColor: impactFieldBackground[row.impact],
                              color: impactTextColor[row.impact],
                              fontWeight: 700,
                              justifyContent: 'center',
                              minWidth: 112,
                            }}
                          />
                          <Chip
                            label={getImpactLabel(row.impact)}
                            size="small"
                            sx={{
                              alignSelf: 'flex-start',
                              backgroundColor: impactFieldBackground[row.impact],
                              color: impactTextColor[row.impact],
                              fontWeight: 700,
                              justifyContent: 'center',
                              minWidth: 92,
                            }}
                          />
                          <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {row.controlMeasure}
                          </Typography>
                        </Box>
                        <Divider />
                      </React.Fragment>
                    ))
                  ) : (
                    <Box sx={{ px: 2.5, py: 4 }}>
                      <Typography sx={{ color: '#111827', fontSize: '0.98rem', fontWeight: 600 }}>
                        {!isReady
                          ? 'Chargement de la base des risques...'
                          : searchHidesMission
                            ? 'Aucune mission ne correspond a la recherche.'
                            : 'Aucun risque en attente pour le moment.'}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                        {!linkedMission
                          ? 'La mission liee au registre n a pas encore ete resolue depuis la base de donnees.'
                          : 'Ajuste la recherche ou attends qu un risque reste au statut Brouillon pour le voir ici.'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
