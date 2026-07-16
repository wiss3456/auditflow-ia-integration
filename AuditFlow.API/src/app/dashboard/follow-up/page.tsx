'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/ssr/UploadSimple';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

import { MissionRequiredAccess } from '@/components/dashboard/mission-required-access';
import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import {
  createFollowUpAction,
  deleteFollowUpAction,
  fetchFollowUpActions,
  updateFollowUpBoardStatus,
  updateFollowUpRecommendationStatus,
} from '@/lib/follow-up/api';
import type { AuditMission } from '@/lib/missions/mock-data';
import { getSelectedMissionIdForUser } from '@/lib/missions/selection';
import {
  type WorkspaceFollowUpAction as FollowUpAction,
  type WorkspaceFollowUpEvaluation as FollowUpEvaluation,
  type WorkspaceRecommendationStatus,
  type WorkspaceFollowUpStatus as FollowUpStatus,
  updateWorkspaceState,
} from '@/lib/workspace-storage';

interface FollowUpDraft {
  actionDetail: string;
  endDate: string;
  evaluation: FollowUpEvaluation;
  missionId: string | null;
  owner: string;
  recommendation: string;
  recommendationNumber: string;
  recommendationStatus: WorkspaceRecommendationStatus;
  remarks: string;
  startDate: string;
  status: FollowUpStatus;
}

interface DonutSegment {
  color: string;
  count: number;
  label: string;
}

interface RecommendationRowView {
  auditableObject: string;
  auditableSubObject: string;
  canDelete: boolean;
  code: string;
  controlMeasure: string;
  decisionStatus: 'Accepte' | 'Brouillon' | 'Refuse';
  evaluation: FollowUpEvaluation;
  id: string;
  mission: AuditMission | null;
  operationalControlObjective: string;
  risk: string;
  source: 'action' | 'risk-listing';
}

const statusColumns = [
  { accent: '#0f766e', background: '#ecfeff', status: 'not-due', title: 'Non échu' },
  { accent: '#6366f1', background: '#eef2ff', status: 'planning', title: 'Planifié' },
  { accent: '#2563eb', background: '#eff6ff', status: 'in-progress', title: 'En cours' },
  { accent: '#ea580c', background: '#fff7ed', status: 'at-risk', title: 'À risque' },
  { accent: '#16a34a', background: '#f0fdf4', status: 'completed', title: 'Terminé' },
] as const satisfies Array<{ accent: string; background: string; status: FollowUpStatus; title: string }>;

const followUpStatusProgressWeights: Record<FollowUpStatus, number> = {
  'at-risk': 45,
  completed: 100,
  'in-progress': 65,
  'not-due': 10,
  planning: 25,
};

const defaultDraft: FollowUpDraft = {
  actionDetail: '',
  endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
  evaluation: 'Modere',
  missionId: null,
  owner: '',
  recommendation: '',
  recommendationNumber: '',
  recommendationStatus: 'in-study',
  remarks: '',
  startDate: dayjs().format('YYYY-MM-DD'),
  status: 'planning',
};

const evaluationOptions: FollowUpEvaluation[] = ['Critique', 'Modere', 'Mineur'];
const ownerOptions = ['Rim Diab', 'Yassine Sadiki', 'Hamza Mouddine', 'Nada Ben Assou'] as const;
const recommendationStatusOptions = [
  { label: 'Acceptée', value: 'accepted' },
  { label: 'Non acceptée', value: 'not-accepted' },
  { label: 'À l’étude', value: 'in-study' },
] as const satisfies Array<{ label: string; value: WorkspaceRecommendationStatus }>;
const recommendationStatusConfig = {
  accepted: { accent: '#22c55e', border: '#dcfce7', decisionStatus: 'Accepte', label: 'Acceptées' },
  'in-study': { accent: '#94a3b8', border: '#e2e8f0', decisionStatus: 'Brouillon', label: 'À l’étude' },
  refused: { accent: '#ef4444', border: '#fee2e2', decisionStatus: 'Refuse', label: 'Non accepté' },
} as const;

type FollowUpBoardMode = 'actions' | 'recommendations';
type RecommendationBoardMode = keyof typeof recommendationStatusConfig;

function recommendationStatusToDecisionStatus(status: WorkspaceRecommendationStatus): RecommendationRowView['decisionStatus'] {
  if (status === 'accepted') {
    return 'Accepte';
  }

  if (status === 'not-accepted') {
    return 'Refuse';
  }

  return 'Brouillon';
}

function decisionStatusToRecommendationStatus(status: RecommendationRowView['decisionStatus']): WorkspaceRecommendationStatus {
  if (status === 'Accepte') {
    return 'accepted';
  }

  if (status === 'Refuse') {
    return 'not-accepted';
  }

  return 'in-study';
}

function getRecommendationStatusLabel(status: WorkspaceRecommendationStatus): string {
  if (status === 'accepted') {
    return 'Acceptée';
  }

  if (status === 'not-accepted') {
    return 'Non accepté';
  }

  return 'À l’étude';
}

function getRecommendationColumnLabel(status: RecommendationBoardMode): string {
  if (status === 'accepted') {
    return 'Acceptées';
  }

  if (status === 'refused') {
    return 'Non accepté';
  }

  return 'À l’étude';
}

function getRecommendationDecisionLabel(status: RecommendationRowView['decisionStatus']): string {
  if (status === 'Accepte') {
    return 'Acceptées';
  }

  if (status === 'Refuse') {
    return 'Non accepté';
  }

  return 'À l’étude';
}

function mapRecommendationDecisionToBoardStatus(status: RecommendationRowView['decisionStatus']): FollowUpStatus {
  return status === 'Accepte' ? 'not-due' : 'planning';
}

function getRecommendationLinkKey(code: string, risk: string, missionId?: string | null): string {
  const normalizedCode = normalizeText(code);
  const normalizedRisk = normalizeText(risk);
  const normalizedMissionId = normalizeText(missionId ?? '');
  const recommendationSignature = normalizedCode ? `${normalizedCode}::${normalizedRisk}` : normalizedRisk;

  return normalizedMissionId ? `${normalizedMissionId}::${recommendationSignature}` : recommendationSignature;
}

function createActionId(): string {
  return `follow-up-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDateRange(startDate: string, endDate: string): string {
  return `${new Date(startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${new Date(endDate).toLocaleDateString(
    'fr-FR',
    { day: '2-digit', month: 'short' }
  )}`;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

function pickImportedValue(row: Record<string, unknown>, aliases: string[]): string {
  const entries = Object.entries(row);

  for (const alias of aliases) {
    const normalizedAlias = normalizeText(alias);
    const matchingEntry = entries.find(([key]) => normalizeText(key) === normalizedAlias);

    if (matchingEntry) {
      const value = matchingEntry[1];

      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        return `${value}`;
      }
    }
  }

  return '';
}

function normalizeImportedDate(value: string, fallback: string): string {
  if (!value.trim()) {
    return fallback;
  }

  const normalized = value.trim();
  const normalizedWithSlashes = normalized.replaceAll('.', '/').replaceAll('-', '/');
  const dayMonthYearMatch = normalizedWithSlashes.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/u);

  if (dayMonthYearMatch) {
    const [, day, month, year] = dayMonthYearMatch;
    return dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).format('YYYY-MM-DD');
  }

  const parsedDate = dayjs(normalized);

  return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : fallback;
}

function normalizeImportedStatus(value: string): FollowUpStatus {
  const normalized = normalizeText(value);

  if (normalized.includes('non echu') || normalized.includes('non-expire')) {
    return 'not-due';
  }

  if (normalized.includes('cours') || normalized.includes('progress')) {
    return 'in-progress';
  }

  if (normalized.includes('risque') || normalized.includes('risk')) {
    return 'at-risk';
  }

  if (normalized.includes('complete') || normalized.includes('cloture') || normalized.includes('termine')) {
    return 'completed';
  }

  return 'planning';
}

function normalizeImportedRecommendationStatus(value: string): WorkspaceRecommendationStatus {
  const normalized = normalizeText(value);

  if (normalized.includes('non accepte') || normalized.includes('refuse')) {
    return 'not-accepted';
  }

  if (normalized.includes('accepte')) {
    return 'accepted';
  }

  return 'in-study';
}

function resolveMissionId(missions: AuditMission[], missionValue: string): string | null {
  if (!missionValue.trim()) {
    return null;
  }

  const normalizedMissionValue = normalizeText(missionValue);
  const matchingMission = missions.find(
    (mission) => mission.id === missionValue || normalizeText(mission.title) === normalizedMissionValue || normalizeText(mission.site) === normalizedMissionValue
  );

  return matchingMission?.id ?? null;
}

function createImportedFollowUpAction(row: Record<string, unknown>, missions: AuditMission[]): FollowUpAction | null {
  const title = pickImportedValue(row, ['Titre', 'Titre de l action', 'Titre de l’action', 'Action', 'Title']);
  const description = pickImportedValue(row, ['Description', 'Details', 'Detail', 'Commentaire', 'Commentaires']);

  if (!title) {
    return null;
  }

  const startDate = normalizeImportedDate(
    pickImportedValue(row, ['Date de debut', 'Debut', 'Start date', 'StartDate']),
    dayjs().format('YYYY-MM-DD')
  );
  const normalizedEndDate = normalizeImportedDate(
    pickImportedValue(row, ['Date de fin', 'Fin', 'End date', 'EndDate']),
    dayjs(startDate).add(7, 'day').format('YYYY-MM-DD')
  );
  const endDate = dayjs(normalizedEndDate).isBefore(dayjs(startDate), 'day') ? startDate : normalizedEndDate;
  const missionId = resolveMissionId(missions, pickImportedValue(row, ['Mission', 'Mission associee', 'Mission associée', 'Mission ID', 'MissionId']));

  return {
    actionDetail: title,
    deadline: endDate,
    description: description || `Action importee pour ${title}.`,
    endDate,
    evaluation: 'Modere',
    id: createActionId(),
    missionId,
    owner: '',
    recommendation: description || title,
    recommendationNumber: `R-${Date.now().toString().slice(-3)}`,
    recommendationStatus: 'in-study',
    remarks: '',
    startDate,
    status: normalizeImportedStatus(pickImportedValue(row, ['Statut', 'Status', 'Colonne'])),
    title,
  };
}

function createStructuredImportedFollowUpAction(row: Record<string, unknown>, missions: AuditMission[]): FollowUpAction | null {
  const recommendationNumber = pickImportedValue(row, ['N Recommandation', 'No Recommandation', 'Numero recommandation', 'Recommendation number']);
  const recommendation = pickImportedValue(row, ['Recommandation', 'Recommendation']);
  const actionDetail = pickImportedValue(row, ['Action', 'Action detail', 'Action a realiser']);
  const remarks = pickImportedValue(row, ['Remarques', 'Commentaires', 'Commentaire', 'Remarks']);

  if (!recommendationNumber && !recommendation && !actionDetail) {
    return createImportedFollowUpAction(row, missions);
  }

  const startDate = normalizeImportedDate(
    pickImportedValue(row, ['Date de debut', 'Debut', 'Start date', 'StartDate']),
    dayjs().format('YYYY-MM-DD')
  );
  const normalizedEndDate = normalizeImportedDate(
    pickImportedValue(row, ['Date de fin', 'Fin', 'End date', 'EndDate']),
    dayjs(startDate).add(7, 'day').format('YYYY-MM-DD')
  );
  const endDate = dayjs(normalizedEndDate).isBefore(dayjs(startDate), 'day') ? startDate : normalizedEndDate;
  const missionId = resolveMissionId(missions, pickImportedValue(row, ['Mission', 'Mission associee', 'Mission associée', 'Mission ID', 'MissionId']));
  const owner = pickImportedValue(row, ['Responsable', 'Owner', 'Pilote']);
  const deadline = pickImportedValue(row, ['Echeance', 'Deadline', 'Due']) || normalizedEndDate;
  const normalizedEvaluation = normalizeText(pickImportedValue(row, ['Evaluation', 'Criticite', 'Evaluation du risque']));
  const evaluation: FollowUpEvaluation =
    normalizedEvaluation.includes('crit') ? 'Critique' : normalizedEvaluation.includes('mineur') ? 'Mineur' : 'Modere';
  const recommendationStatus = normalizeImportedRecommendationStatus(
    pickImportedValue(row, ['Statut de recommandation', 'Recommendation status', 'Decision', 'Etat recommandation'])
  );
  const generatedTitle = actionDetail || recommendation || recommendationNumber || 'Nouvelle action de suivi';
  const generatedDescription = recommendation || remarks || `Action importee pour ${generatedTitle}.`;

  return {
    actionDetail: actionDetail || generatedTitle,
    deadline,
    description: generatedDescription,
    endDate,
    evaluation,
    id: createActionId(),
    missionId,
    owner,
    recommendation: recommendation || generatedTitle,
    recommendationNumber: recommendationNumber || `R-${Date.now().toString().slice(-3)}`,
    recommendationStatus,
    remarks,
    startDate,
    status: normalizeImportedStatus(pickImportedValue(row, ['Statut', 'Status', 'Colonne'])),
    title: generatedTitle,
  };
}

function isOverdue(action: FollowUpAction): boolean {
  return dayjs(action.endDate).isBefore(dayjs(), 'day') && action.status !== 'completed';
}

function getStatusTransitionMessage(actionTitle: string, status: FollowUpStatus): { message: string; title: string } | null {
  if (status === 'completed') {
    return {
      message: `L’action "${actionTitle}" a été marquée comme terminée.`,
      title: 'Suivi',
    };
  }

  if (status === 'at-risk') {
    return {
      message: `L’action "${actionTitle}" a été signalée à risque.`,
      title: 'Suivi',
    };
  }

  return null;
}

function getActionSummary(action: FollowUpAction): string {
  return action.recommendation || action.description || action.actionDetail || 'Aucune description disponible.';
}

function getMissionPhaseLabel(status: AuditMission['status']): string {
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

function getMissionPriorityLabel(priority: AuditMission['priority']): string {
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

function buildChartGradient(segments: DonutSegment[], emptyColor = '#e5e7eb'): string {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);

  if (total === 0) {
    return `conic-gradient(${emptyColor} 0 100%)`;
  }

  const separatorDegrees = 2;
  const gradientStops: string[] = [];
  let cursor = 0;

  for (const segment of segments) {
    const angle = (segment.count / total) * 360;
    const start = cursor;
    const end = cursor + angle;
    const separatorStart = angle > separatorDegrees ? end - separatorDegrees : end;

    gradientStops.push(`${segment.color} ${start}deg ${separatorStart}deg`);

    if (separatorStart < end) {
      gradientStops.push(`#ffffff ${separatorStart}deg ${end}deg`);
    }

    cursor = end;
  }

  return `conic-gradient(${gradientStops.join(', ')})`;
}

function SummaryCircularChart({
  helper,
  progressLabel,
  progressPercent,
  remainingLabel,
  remainingPercent,
  segments,
  title,
  totalLabel,
}: {
  helper: string;
  progressLabel: string;
  progressPercent: number;
  remainingLabel: string;
  remainingPercent: number;
  segments: DonutSegment[];
  title: string;
  totalLabel: string;
}): React.JSX.Element {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const chartGradient = buildChartGradient(segments);
  const highlightedSegment = segments.reduce<DonutSegment | null>((currentLargest, segment) => {
    if (!currentLargest || segment.count > currentLargest.count) {
      return segment;
    }

    return currentLargest;
  }, null);
  const highlightedSegmentPercent = total > 0 && highlightedSegment ? Math.round((highlightedSegment.count / total) * 100) : 0;

  return (
    <Box
      sx={{
        background: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.95)',
        borderRadius: '20px',
        boxShadow: '0 18px 36px rgba(148, 163, 184, 0.12)',
        minHeight: 318,
        p: { xs: 1.6, md: 1.9 },
      }}
    >
      <Stack spacing={1.7}>
        <Stack alignItems={{ sm: 'center', xs: 'flex-start' }} direction={{ sm: 'row', xs: 'column' }} justifyContent="space-between" spacing={1}>
          <Box>
            <Typography
              sx={{
                color: '#111827',
                fontSize: '0.88rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.5, mt: 0.35 }}>{helper}</Typography>
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={1.2} justifyContent="flex-end">
            {segments.map((segment) => (
              <Stack alignItems="center" direction="row" key={segment.label} spacing={0.45}>
                <Box sx={{ backgroundColor: segment.color, borderRadius: '999px', flexShrink: 0, height: 7, width: 7 }} />
                <Typography sx={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 700 }}>{segment.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, minHeight: 228, position: 'relative' }}>
          <Box
            sx={{
              alignItems: 'center',
              background: chartGradient,
              borderRadius: '50%',
              display: 'flex',
              flexShrink: 0,
              height: { md: 198, xs: 176 },
              justifyContent: 'center',
              position: 'relative',
              width: { md: 198, xs: 176 },
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                height: '56%',
                justifyContent: 'center',
                width: '56%',
              }}
            >
              <Typography sx={{ color: '#0f172a', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{progressPercent}%</Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', fontWeight: 700, mt: 0.4, textAlign: 'center' }}>{progressLabel}</Typography>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.64rem', fontWeight: 700, mt: 0.3, textAlign: 'center' }}>{remainingLabel} {remainingPercent}%</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              boxShadow: '0 10px 20px rgba(148, 163, 184, 0.22)',
              color: '#475569',
              left: { md: '10%', xs: '4%' },
              minWidth: 74,
              px: 1,
              py: 0.7,
              position: 'absolute',
              textAlign: 'center',
              top: { md: '43%', xs: '42%' },
              transform: 'translateY(-50%)',
              '&::after': {
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '8px solid #ffffff',
                content: '""',
                left: '50%',
                position: 'absolute',
                top: '100%',
                transform: 'translateX(-50%)',
              },
            }}
          >
            <Typography sx={{ color: '#334155', fontSize: '1.12rem', fontWeight: 800, lineHeight: 1 }}>
              {highlightedSegmentPercent}%
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.25, mt: 0.22 }}>
              {highlightedSegment?.label ?? totalLabel}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 0.35 }}>
          <Box
            sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              borderRadius: '999px',
              px: 1.15,
              py: 0.55,
            }}
          >
            <Typography sx={{ color: '#334155', fontSize: '0.68rem', fontWeight: 700 }}>
              {progressLabel}: {progressPercent}%
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              borderRadius: '999px',
              px: 1.15,
              py: 0.55,
            }}
          >
            <Typography sx={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 700 }}>
              {remainingLabel}: {remainingPercent}%
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function Page(): React.JSX.Element {
  const { addNotification } = useNotifications();
  const { workspace } = useWorkspace();
  const { user } = useUser();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeBoardMode, setActiveBoardMode] = React.useState<FollowUpBoardMode>('recommendations');
  const [draggedActionId, setDraggedActionId] = React.useState<string | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = React.useState<FollowUpStatus | null>(null);
  const [draggedRecommendationId, setDraggedRecommendationId] = React.useState<string | null>(null);
  const [dropTargetRecommendationStatus, setDropTargetRecommendationStatus] = React.useState<RecommendationRowView['decisionStatus'] | null>(null);
  const [draft, setDraft] = React.useState<FollowUpDraft>(defaultDraft);
  const [draftError, setDraftError] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const [selectedMission, setSelectedMission] = React.useState<AuditMission | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [expandedActionId, setExpandedActionId] = React.useState<string | null>(null);
  const [actions, setActions] = React.useState<FollowUpAction[]>([]);
  const [isLoadingActions, setIsLoadingActions] = React.useState(true);
  const missions = workspace.missions;
  const selectedMissionId = React.useMemo(() => getSelectedMissionIdForUser(workspace, user?.id), [user?.id, workspace]);
  const visibleActions = actions.filter((action) => action.recommendationStatus === 'accepted');
  const selectedMissionForUser = React.useMemo(
    () => (selectedMissionId ? missions.find((mission) => mission.id === selectedMissionId) ?? null : null),
    [missions, selectedMissionId]
  );
  const rawStudyPhaseState = workspace.studyPhaseState;

  const reloadActions = React.useCallback(async (): Promise<void> => {
    if (!user) {
      setActions([]);
      setIsLoadingActions(false);
      return;
    }

    setIsLoadingActions(true);

    try {
      const nextActions = await fetchFollowUpActions();
      setActions(nextActions);
      updateWorkspaceState((currentState) => ({
        ...currentState,
        followUpActions: nextActions,
      }));
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Synchronisation du suivi impossible.');
    } finally {
      setIsLoadingActions(false);
    }
  }, [user]);

  React.useEffect(() => {
    void reloadActions();
  }, [reloadActions]);

  const notDueCount = visibleActions.filter((action) => action.status === 'not-due').length;
  const planningCount = visibleActions.filter((action) => action.status === 'planning').length;
  const inProgressCount = visibleActions.filter((action) => action.status === 'in-progress').length;
  const atRiskCount = visibleActions.filter((action) => action.status === 'at-risk').length;
  const completedCount = visibleActions.filter((action) => action.status === 'completed').length;
  const completionRate = Math.round((completedCount / Math.max(visibleActions.length, 1)) * 100);
  const overdueCount = visibleActions.filter((action) => isOverdue(action)).length;
  const totalCount = visibleActions.length;
  const statusProgressPercent =
    totalCount > 0
      ? Math.round(
          visibleActions.reduce((sum, action) => sum + followUpStatusProgressWeights[action.status], 0) / totalCount
        )
      : 0;
  const remainingStatusPercent = totalCount > 0 ? Math.max(0, 100 - statusProgressPercent) : 0;

  const statusCountLookup: Record<FollowUpStatus, number> = {
    'at-risk': atRiskCount,
    completed: completedCount,
    'in-progress': inProgressCount,
    'not-due': notDueCount,
    planning: planningCount,
  };

  const statusSummaryCards = statusColumns.map((column) => {
    const count = statusCountLookup[column.status];
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

    return {
      ...column,
      count,
      percentage,
    };
  });

  const riskListingRows =
    rawStudyPhaseState &&
    typeof rawStudyPhaseState === 'object' &&
    'risk-listing' in rawStudyPhaseState &&
    rawStudyPhaseState['risk-listing'] &&
    typeof rawStudyPhaseState['risk-listing'] === 'object' &&
    'riskRows' in rawStudyPhaseState['risk-listing'] &&
    Array.isArray(rawStudyPhaseState['risk-listing'].riskRows)
      ? rawStudyPhaseState['risk-listing'].riskRows
      : [];

  const linkedRecommendationKeys = React.useMemo(
    () =>
      new Set(
        actions.map((action) =>
          getRecommendationLinkKey(action.recommendationNumber || '', action.recommendation || action.title || action.id, action.missionId)
        )
      ),
    [actions]
  );

  const recommendationRowsFromRiskListing: RecommendationRowView[] = riskListingRows
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
    .filter((row) => {
      const code = typeof row.code === 'string' && row.code.trim() ? row.code : '';
      const risk = typeof row.risk === 'string' && row.risk.trim() ? row.risk : '';
      const missionId = selectedMissionForUser?.id ?? selectedMissionId ?? null;

      return !linkedRecommendationKeys.has(getRecommendationLinkKey(code, risk, missionId));
    })
    .map((row, index) => ({
      auditableObject: typeof row.auditableObject === 'string' && row.auditableObject.trim() ? row.auditableObject : 'Périmètre global',
      auditableSubObject:
        typeof row.auditableSubObject === 'string' && row.auditableSubObject.trim() ? row.auditableSubObject : 'Composante spécifique',
      canDelete: false,
      code: typeof row.code === 'string' && row.code.trim() ? row.code : `REC-${index + 1}`,
      controlMeasure: typeof row.controlMeasure === 'string' && row.controlMeasure.trim() ? row.controlMeasure : 'Bonnes pratiques à renseigner',
      decisionStatus: row.decisionStatus === 'Accepte' || row.decisionStatus === 'Refuse' || row.decisionStatus === 'Brouillon' ? row.decisionStatus : 'Brouillon',
      evaluation: row.riskAssessment === 'Critique' || row.riskAssessment === 'Mineure' ? (row.riskAssessment === 'Mineure' ? 'Mineur' : 'Critique') : 'Modere',
      id: typeof row.id === 'string' && row.id ? row.id : `risk-row-${index + 1}`,
      mission: selectedMissionForUser,
      operationalControlObjective:
        typeof row.operationalControlObjective === 'string' && row.operationalControlObjective.trim()
          ? row.operationalControlObjective
          : 'Objectif de contrôle à renseigner',
      risk: typeof row.risk === 'string' && row.risk.trim() ? row.risk : 'Risque à renseigner',
      source: 'risk-listing' as const,
    }));

  const recommendationRows: RecommendationRowView[] = [
    ...actions.map((action) => {
      const relatedMission = action.missionId ? missions.find((mission) => mission.id === action.missionId) ?? null : null;

      return {
        auditableObject: relatedMission?.title ?? relatedMission?.site ?? 'Recommandation de suivi',
        auditableSubObject: action.owner || 'Responsable a definir',
        canDelete: true,
        code: action.recommendationNumber || `REC-${action.id}`,
        controlMeasure: action.actionDetail || action.remarks || 'Action a renseigner',
        decisionStatus: recommendationStatusToDecisionStatus(action.recommendationStatus),
        evaluation: action.evaluation,
        id: action.id,
        mission: relatedMission,
        operationalControlObjective: action.recommendation || action.description || 'Objectif a renseigner',
        risk: action.recommendation || action.title || 'Recommandation a renseigner',
        source: 'action' as const,
      };
    }),
    ...recommendationRowsFromRiskListing,
  ];

  const acceptedRecommendationsCount = recommendationRows.filter((row) => row.decisionStatus === 'Accepte').length;
  const refusedRecommendationsCount = recommendationRows.filter((row) => row.decisionStatus === 'Refuse').length;
  const inStudyRecommendationsCount = recommendationRows.filter((row) => row.decisionStatus === 'Brouillon').length;
  const recommendationTotal = acceptedRecommendationsCount + refusedRecommendationsCount + inStudyRecommendationsCount;
  const handledRecommendationsCount = acceptedRecommendationsCount + refusedRecommendationsCount;
  const handledRecommendationsPercent = recommendationTotal > 0 ? Math.round((handledRecommendationsCount / recommendationTotal) * 100) : 0;
  const pendingRecommendationsPercent = recommendationTotal > 0 ? 100 - handledRecommendationsPercent : 0;
  const recommendationCounts: Record<RecommendationBoardMode, number> = {
    accepted: acceptedRecommendationsCount,
    'in-study': inStudyRecommendationsCount,
    refused: refusedRecommendationsCount,
  };
  const recommendationColumns = (Object.keys(recommendationStatusConfig) as RecommendationBoardMode[]).map((key) => ({
    key,
    ...recommendationStatusConfig[key],
    label: getRecommendationColumnLabel(key),
    rows: recommendationRows.filter((row) => row.decisionStatus === recommendationStatusConfig[key].decisionStatus),
  }));

  const actionStatusSegments: DonutSegment[] = statusSummaryCards.map((card) => ({
    color: card.accent,
    count: card.count,
    label: card.title,
  }));

  const recommendationStateSegments: DonutSegment[] = [
    { color: '#4ade80', count: acceptedRecommendationsCount, label: 'Acceptée' },
    { color: '#f87171', count: refusedRecommendationsCount, label: 'Non acceptée' },
    { color: '#94a3b8', count: inStudyRecommendationsCount, label: 'À l’étude' },
  ];

  const summaryCards = [
    {
      accent: '#16a34a',
      helper: 'Recommandations actuellement validées.',
      title: 'Non échu',
      value: acceptedRecommendationsCount,
    },
    {
      accent: '#7c3aed',
      helper: 'Niveau global d avancement',
      icon: <ChartPieIcon fontSize="var(--icon-fontSize-lg)" />,
      title: 'Taux de complétion',
      value: `${completionRate}%`,
    },
    {
      accent: '#2563eb',
      helper: 'Actions clôturées avec succès',
      icon: <CheckCircleIcon fontSize="var(--icon-fontSize-lg)" />,
      title: 'Actions terminées',
      value: completedCount,
    },
    {
      accent: '#ea580c',
      helper: 'Actions à traiter en priorité',
      icon: <ClockIcon fontSize="var(--icon-fontSize-lg)" />,
      title: 'Actions en retard',
      value: overdueCount,
    },
    {
      accent: '#22c55e',
      helper: 'Portefeuille total du suivi',
      icon: <ArrowClockwiseIcon fontSize="var(--icon-fontSize-lg)" />,
      title: 'Total des actions',
      value: totalCount,
    },
  ];

  const indicatorCards = summaryCards ? [
    {
      accent: '#16a34a',
      helper: 'Recommandations actuellement validées.',
      title: 'Recommandations acceptées',
      value: acceptedRecommendationsCount,
    },
    {
      accent: '#4338ca',
      helper: 'Volume global des recommandations suivies.',
      title: 'Total général',
      value: recommendationTotal,
    },
    {
      accent: '#2563eb',
      helper: 'Actions passées au statut terminé.',
      title: 'Actions terminées',
      value: completedCount,
    },
    {
      accent: '#0f766e',
      helper: 'Total général des actions visibles dans le suivi.',
      title: 'Total général des actions',
      value: totalCount,
    },
  ] : [];

  const moveActionToStatus = React.useCallback(
    (actionId: string, nextStatus: FollowUpStatus): void => {
      const currentAction = actions.find((action) => action.id === actionId);

      if (!currentAction || currentAction.status === nextStatus) {
        return;
      }

      void (async (): Promise<void> => {
        try {
          const updatedAction = await updateFollowUpBoardStatus(actionId, nextStatus);
          setActions((currentActions) => currentActions.map((action) => (action.id === actionId ? updatedAction : action)));

          const transitionMessage = getStatusTransitionMessage(currentAction.title, updatedAction.status);

          if (transitionMessage) {
            addNotification(transitionMessage);
          }
        } catch (error) {
          addNotification({
            message: error instanceof Error ? error.message : 'Mise a jour du statut impossible.',
            title: 'Suivi',
          });
        }
      })();
    },
    [actions, addNotification]
  );

  const moveRecommendationToStatus = React.useCallback(
    (recommendationId: string, nextStatus: RecommendationRowView['decisionStatus']): void => {
      const currentAction = actions.find((action) => action.id === recommendationId);
      const currentRecommendationRow = recommendationRows.find((row) => row.id === recommendationId) ?? null;

      void (async (): Promise<void> => {
        try {
          let updatedAction = currentAction ?? null;
          let actionWasCreated = false;

          if (currentAction) {
            const nextUpdatedAction = await updateFollowUpRecommendationStatus(
              recommendationId,
              decisionStatusToRecommendationStatus(nextStatus)
            );
            updatedAction = nextUpdatedAction;
            setActions((currentActions) => currentActions.map((action) => (action.id === recommendationId ? nextUpdatedAction : action)));
          } else if (currentRecommendationRow && currentRecommendationRow.source === 'risk-listing' && nextStatus === 'Accepte') {
            const missionId = currentRecommendationRow.mission?.id ?? selectedMissionId ?? missions[0]?.id;

            if (!missionId) {
              throw new Error('Associe une mission avant de valider cette recommandation dans le suivi.');
            }

            const fallbackEndDate = dayjs().add(7, 'day').format('YYYY-MM-DD');
            const createdAction = await createFollowUpAction({
              actionDetail: currentRecommendationRow.controlMeasure,
              boardStatus: mapRecommendationDecisionToBoardStatus(nextStatus),
              deadlineLabel: currentRecommendationRow.mission?.dueDate ?? fallbackEndDate,
              description: currentRecommendationRow.auditableObject,
              endDate: currentRecommendationRow.mission?.dueDate ?? fallbackEndDate,
              evaluation: currentRecommendationRow.evaluation,
              missionId,
              ownerDisplayName: currentRecommendationRow.mission?.owner ?? '',
              recommendation: currentRecommendationRow.risk,
              recommendationNumber: currentRecommendationRow.code,
              recommendationStatus: decisionStatusToRecommendationStatus(nextStatus),
              remarks: currentRecommendationRow.operationalControlObjective,
              startDate: dayjs().format('YYYY-MM-DD'),
              title: currentRecommendationRow.operationalControlObjective || currentRecommendationRow.risk,
            });
            updatedAction = createdAction;
            actionWasCreated = true;
            setActions((currentActions) => [createdAction, ...currentActions]);
          }

          let notificationAlreadySent = false;

          updateWorkspaceState((currentState) => {
            let hasStatusChanged = false;
            let movedRiskTitle = currentAction?.recommendation || currentAction?.title || 'la recommandation';
            const currentStudyPhaseState = currentState.studyPhaseState;
            let nextStudyPhaseState = currentState.studyPhaseState;

            if (currentStudyPhaseState && typeof currentStudyPhaseState === 'object') {
              const studyPhaseStateRecord = currentStudyPhaseState as Record<string, unknown>;
              const riskListingState = studyPhaseStateRecord['risk-listing'];

              if (riskListingState && typeof riskListingState === 'object') {
                const riskListingStateRecord = riskListingState as Record<string, unknown>;
                const currentRiskRows = riskListingStateRecord.riskRows;

                if (Array.isArray(currentRiskRows)) {
                  const nextRiskRows = currentRiskRows.map((row) => {
                    if (!row || typeof row !== 'object') {
                      return row;
                    }

                    const riskRow = row as Record<string, unknown>;

                    if (riskRow.id !== recommendationId) {
                      return row;
                    }

                    const currentStatus =
                      riskRow.decisionStatus === 'Accepte' || riskRow.decisionStatus === 'Refuse' || riskRow.decisionStatus === 'Brouillon'
                        ? riskRow.decisionStatus
                        : 'Brouillon';

                    if (currentStatus === nextStatus) {
                      return row;
                    }

                    hasStatusChanged = true;
                    movedRiskTitle = typeof riskRow.risk === 'string' && riskRow.risk.trim() ? riskRow.risk : movedRiskTitle;

                    return {
                      ...riskRow,
                      decisionStatus: nextStatus,
                    };
                  });

                  nextStudyPhaseState = {
                    ...studyPhaseStateRecord,
                    'risk-listing': {
                      ...riskListingStateRecord,
                      riskRows: nextRiskRows,
                    },
                  };
                }
              }
            }

            if (hasStatusChanged) {
              addNotification({
                message: `La recommandation ${movedRiskTitle} a ete deplacee vers ${getRecommendationDecisionLabel(nextStatus)}.`,
                title: 'Suivi',
              });
              notificationAlreadySent = true;
            }

            return {
              ...currentState,
              followUpActions:
                updatedAction && currentAction
                  ? currentState.followUpActions.map((action) => (action.id === recommendationId ? updatedAction ?? action : action))
                  : updatedAction && actionWasCreated
                    ? [updatedAction, ...currentState.followUpActions]
                    : currentState.followUpActions,
              studyPhaseState: nextStudyPhaseState,
            };
          });

          if (actionWasCreated && updatedAction && !notificationAlreadySent) {
            addNotification({
              message: `La recommandation ${updatedAction.recommendation || updatedAction.title} a ete acceptee et transferee vers Non echue.`,
              title: 'Suivi',
            });
          } else if (currentAction && !notificationAlreadySent && recommendationStatusToDecisionStatus(currentAction.recommendationStatus) !== nextStatus) {
            addNotification({
              message: `La recommandation ${currentAction.recommendation || currentAction.title} a ete deplacee vers ${getRecommendationDecisionLabel(nextStatus)}.`,
              title: 'Suivi',
            });
          }
        } catch (error) {
          addNotification({
            message: error instanceof Error ? error.message : 'Mise a jour de la recommandation impossible.',
            title: 'Suivi',
          });
        }
      })();
    },
    [actions, addNotification, missions, recommendationRows, selectedMissionId]
  );

  const handleDeleteRecommendation = React.useCallback(
    (recommendationId: string): void => {
      const targetAction = actions.find((action) => action.id === recommendationId);

      if (!targetAction) {
        return;
      }

      void (async (): Promise<void> => {
        try {
          await deleteFollowUpAction(recommendationId);
          setActions((currentActions) => currentActions.filter((action) => action.id !== recommendationId));
          updateWorkspaceState((currentState) => ({
            ...currentState,
            followUpActions: currentState.followUpActions.filter((action) => action.id !== recommendationId),
          }));

          addNotification({
            message: `La recommandation ${targetAction.recommendation || targetAction.title} a ete supprimee definitivement.`,
            title: 'Suivi',
          });
        } catch (error) {
          addNotification({
            message: error instanceof Error ? error.message : 'Suppression de la recommandation impossible.',
            title: 'Suivi',
          });
        }
      })();
    },
    [actions, addNotification]
  );

  const handleCreateAction = (): void => {
    if (!draft.recommendationNumber.trim() || !draft.recommendation.trim() || !draft.actionDetail.trim() || !draft.startDate || !draft.endDate) {
      setDraftError('Renseigne le numéro, la recommandation, l’action et les dates avant de créer une action.');
      return;
    }

    if (dayjs(draft.endDate).isBefore(dayjs(draft.startDate), 'day')) {
      setDraftError('La date de fin doit etre posterieure ou egale a la date de debut.');
      return;
    }

    const generatedTitle = `${draft.recommendationNumber.trim()} - ${draft.actionDetail.trim()}`;
    const generatedDescription = draft.recommendation.trim();

    void (async (): Promise<void> => {
      try {
        const missionId = draft.missionId || missions[0]?.id;

        if (!missionId) {
          setDraftError('Associe la recommandation a une mission avant de l’enregistrer.');
          return;
        }

        const createdAction = await createFollowUpAction({
          actionDetail: draft.actionDetail.trim(),
          boardStatus: draft.recommendationStatus === 'accepted' ? 'not-due' : draft.status,
          deadlineLabel: draft.endDate,
          description: generatedDescription,
          endDate: draft.endDate,
          evaluation: draft.evaluation,
          missionId,
          ownerDisplayName: draft.owner.trim(),
          recommendation: draft.recommendation.trim(),
          recommendationNumber: draft.recommendationNumber.trim(),
          recommendationStatus: draft.recommendationStatus,
          remarks: draft.remarks.trim(),
          startDate: draft.startDate,
          title: generatedTitle,
        });

        setActions((currentActions) => [createdAction, ...currentActions]);
        addNotification({ message: `Une nouvelle recommandation de suivi a ete ajoutee : ${createdAction.title}.`, title: 'Suivi' });
        setDraft(defaultDraft);
        setDraftError(null);
        setIsDialogOpen(false);
      } catch (error) {
        setDraftError(error instanceof Error ? error.message : 'Creation de la recommandation impossible.');
      }
    })();
    const legacyCreationSyncDisabled = globalThis.location.hash === '#legacy-creation-sync';
    if (legacyCreationSyncDisabled) {

    const nextAction: FollowUpAction = {
      actionDetail: draft.actionDetail.trim(),
      deadline: draft.endDate,
      description: generatedDescription,
      endDate: draft.endDate,
      evaluation: draft.evaluation,
      id: createActionId(),
      missionId: draft.missionId,
      owner: draft.owner.trim(),
      recommendation: draft.recommendation.trim(),
      recommendationNumber: draft.recommendationNumber.trim(),
      recommendationStatus: draft.recommendationStatus,
      remarks: draft.remarks.trim(),
      startDate: draft.startDate,
      status: draft.recommendationStatus === 'accepted' ? 'not-due' : draft.status,
      title: generatedTitle,
    };

    updateWorkspaceState((currentState) => ({
      ...currentState,
      followUpActions: [nextAction, ...currentState.followUpActions],
    }));
    addNotification({ message: `Une nouvelle recommandation de suivi a été ajoutée : ${nextAction.title}.`, title: 'Suivi' });
    setDraft(defaultDraft);
    setDraftError(null);
    setIsDialogOpen(false);
    }
  };

  const handleImportActions = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setImportError(null);
    setIsImporting(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { cellDates: true, type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error('Aucune feuille exploitable n’a été trouvée dans ce fichier.');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const importedRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '', raw: false });
      const importedActions = importedRows
        .map((row) => createStructuredImportedFollowUpAction(row, missions))
        .filter((action): action is FollowUpAction => action !== null);

      if (importedActions.length === 0) {
        throw new Error('Le fichier ne contient aucune ligne exploitable pour le suivi.');
      }

      const createdActions = await Promise.all(
        importedActions.map(async (action) => {
          const missionId = action.missionId || missions[0]?.id;

          if (!missionId) {
            throw new Error('Impossible d’importer une action sans mission disponible.');
          }

          return createFollowUpAction({
            actionDetail: action.actionDetail,
            boardStatus: action.status,
            deadlineLabel: action.deadline,
            description: action.description,
            endDate: action.endDate,
            evaluation: action.evaluation,
            missionId,
            ownerDisplayName: action.owner,
            recommendation: action.recommendation,
            recommendationNumber: action.recommendationNumber,
            recommendationStatus: action.recommendationStatus,
            remarks: action.remarks,
            startDate: action.startDate,
            title: action.title,
          });
        })
      );

      setActions((currentActions) => [...createdActions, ...currentActions]);

      addNotification({
      message: `${createdActions.length} action(s) de suivi ont ete importee(s) depuis ${file.name}.`,
      title: 'Suivi',
      });
      const legacyImportSyncDisabled = globalThis.location.hash === '#legacy-import-sync';
      if (legacyImportSyncDisabled) {
      updateWorkspaceState((currentState) => ({
        ...currentState,
        followUpActions: [...importedActions, ...currentState.followUpActions],
      }));

      addNotification({
      message: `${importedActions.length} action(s) de suivi ont ete importee(s) depuis ${file.name}.`,
      title: 'Suivi',
      });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import impossible pour ce fichier.';
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  if (!selectedMissionId) {
    return <MissionRequiredAccess />;
  }

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
            Suivi
          </Typography>
          <Typography
            sx={{
              color: '#0f172a',
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontSize: { xs: '1.9rem', md: '2.1rem' },
              fontWeight: 700,
              letterSpacing: '-0.04em',
              mt: 0.75,
            }}
          >
            Suivi des actions d’audit
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
          <input
            accept=".csv,.xls,.xlsx"
            hidden
            onChange={(event): void => {
              void handleImportActions(event);
            }}
            ref={fileInputRef}
            type="file"
          />
          <Button
            disabled={isImporting}
            onClick={(): void => {
              fileInputRef.current?.click();
            }}
            startIcon={<UploadSimpleIcon fontSize="var(--icon-fontSize-md)" />}
            sx={{ borderRadius: '12px', minHeight: 42, px: 2 }}
            variant="outlined"
          >
            {isImporting ? 'Import en cours...' : 'Importer'}
          </Button>
          <Button
            onClick={(): void => {
              setDraft(defaultDraft);
              setDraftError(null);
              setIsDialogOpen(true);
            }}
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            sx={{ borderRadius: '12px', minHeight: 42, px: 2 }}
            variant="contained"
          >
            Nouvelle recommandation
          </Button>
        </Stack>
      </Stack>

      {importError ? (
        <Typography sx={{ color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>{importError}</Typography>
      ) : null}
      {syncError ? (
        <Typography sx={{ color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>{syncError}</Typography>
      ) : null}
      {isLoadingActions ? (
        <Typography sx={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600 }}>Chargement des actions de suivi...</Typography>
      ) : null}

      <Card
        sx={{
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '24px',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.6 } }}>
          <Stack spacing={2.2}>
            <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={1.2}>
              <Box>
                <Typography sx={{ color: '#0f172a', fontSize: '1rem', fontWeight: 800 }}>Vue globale du suivi</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.6, mt: 0.4 }}>
                  Le diagramme et les indicateurs suivent en direct l evolution des actions ONCF. Les valeurs se reequilibrent automatiquement selon les changements de statut.
                </Typography>
              </Box>
              <Chip label={`${totalCount} action(s) suivie(s)`} sx={{ alignSelf: 'flex-start', backgroundColor: '#eef2ff', color: '#4338ca', fontWeight: 700 }} />
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  lg: 'minmax(560px, 1.5fr) minmax(310px, 0.9fr)',
                  md: 'minmax(420px, 1.2fr) minmax(280px, 0.9fr)',
                  xs: '1fr',
                },
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.4,
                  gridTemplateColumns: { xl: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
                }}
              >
                <SummaryCircularChart
                  helper="Repartition des actions ONCF selon leur statut actuel."
                  progressLabel="Avancement"
                  progressPercent={statusProgressPercent}
                  remainingLabel="Reste"
                  remainingPercent={remainingStatusPercent}
                  segments={actionStatusSegments}
                  title="Statut"
                  totalLabel="Actions"
                />
                <SummaryCircularChart
                  helper="État de traitement des recommandations issues du listing des risques."
                  progressLabel="Traitees"
                  progressPercent={handledRecommendationsPercent}
                  remainingLabel="À l’étude"
                  remainingPercent={pendingRecommendationsPercent}
                  segments={recommendationStateSegments}
                  title="Recommandations"
                  totalLabel="Recommandations"
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
                  gridTemplateRows: { md: 'repeat(2, minmax(124px, auto))', xs: 'auto' },
                }}
              >
                {indicatorCards.map((card) => (
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
                        minHeight: 124,
                        p: 1.35,
                      }}
                    >
                      <Typography sx={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.25 }}>{card.title}</Typography>
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                          flex: 1,
                          justifyContent: 'flex-start',
                          mt: 0.15,
                          pl: 1.1,
                          textAlign: 'left',
                        }}
                      >
                        <Typography
                          sx={{
                            color: card.accent,
                            fontSize: '2.35rem',
                            fontWeight: 800,
                            letterSpacing: '-0.03em',
                            lineHeight: 1,
                          }}
                        >
                          {card.value}
                        </Typography>
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
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        {[
          { key: 'recommendations', label: 'Recommandations' },
          { key: 'actions', label: 'Actions' },
        ].map((item) => {
          const isActive = activeBoardMode === item.key;

          return (
            <Button
              key={item.key}
              onClick={(): void => {
                setActiveBoardMode(item.key as FollowUpBoardMode);
              }}
              sx={{
                borderRadius: '999px',
                minHeight: 40,
                px: 2.2,
              }}
              variant={isActive ? 'contained' : 'outlined'}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>

      {activeBoardMode === 'actions' ? (
        <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            lg: 'repeat(5, minmax(0, 1fr))',
            md: 'repeat(2, minmax(0, 1fr))',
            xs: '1fr',
          },
        }}
      >
        {statusColumns.map((column) => {
          const columnActions = visibleActions.filter((action) => action.status === column.status);
          const isActiveDropZone = dropTargetStatus === column.status;

          return (
            <Card
              key={column.status}
              onDragOver={(event): void => {
                event.preventDefault();
                setDropTargetStatus(column.status);
              }}
              onDrop={(event): void => {
                event.preventDefault();

                if (draggedActionId) {
                  moveActionToStatus(draggedActionId, column.status);
                }

                setDraggedActionId(null);
                setDropTargetStatus(null);
              }}
              sx={{
                backgroundColor: isActiveDropZone ? `${column.accent}10` : '#ffffff',
                border: isActiveDropZone ? `1px solid ${column.accent}` : '1px solid rgba(148, 163, 184, 0.16)',
                borderRadius: '20px',
                boxShadow: '0 14px 30px rgba(15, 23, 42, 0.07)',
                minHeight: 390,
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
            >
              <CardContent sx={{ p: 1.75 }}>
                <Stack spacing={1.5}>
                  <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1.5}>
                    <Box
                      sx={{
                        backgroundColor: column.background,
                        borderRadius: '999px',
                        color: column.accent,
                        px: 1.2,
                        py: 0.55,
                      }}
                    >
                      <Typography sx={{ color: 'inherit', fontSize: '0.78rem', fontWeight: 700 }}>{column.title}</Typography>
                    </Box>
                    <Chip
                      label={columnActions.length}
                      size="small"
                      sx={{ backgroundColor: `${column.accent}14`, color: column.accent, fontWeight: 700 }}
                    />
                  </Stack>

                  <Stack spacing={1.15}>
                    {columnActions.length > 0 ? (
                      columnActions.map((action) => {
                        const relatedMission = action.missionId ? missions.find((mission) => mission.id === action.missionId) ?? null : null;
                        const isExpanded = expandedActionId === action.id;

                        return (
                          <Box
                          draggable
                          key={action.id}
                          onDragEnd={(): void => {
                            setDraggedActionId(null);
                            setDropTargetStatus(null);
                          }}
                          onDragStart={(event): void => {
                            event.dataTransfer.effectAllowed = 'move';
                            setDraggedActionId(action.id);
                          }}
                          sx={{
                            backgroundColor: '#ffffff',
                            border: isExpanded ? `1px solid ${column.accent}` : '1px solid rgba(148, 163, 184, 0.14)',
                            borderRadius: '16px',
                            cursor: 'grab',
                            p: 1.5,
                            transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                            '&:hover': {
                              boxShadow: '0 16px 34px rgba(15, 23, 42, 0.10)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1.5}>
                              <Stack spacing={0.45} sx={{ minWidth: 0 }}>
                                <Typography sx={{ color: '#111827', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.45 }}>
                                  {action.title}
                                </Typography>
                                <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                  {action.recommendationNumber ? (
                                    <Chip label={action.recommendationNumber} size="small" sx={{ backgroundColor: '#eef2ff', color: '#4338ca', fontWeight: 700 }} />
                                  ) : null}
                                  <Chip label={action.evaluation} size="small" sx={{ backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700 }} />
                                </Stack>
                              </Stack>
                              <Stack alignItems="flex-end" spacing={0.75}>
                                {isOverdue(action) ? (
                                  <Chip label="En retard" size="small" sx={{ backgroundColor: '#fff7ed', color: '#c2410c', fontWeight: 700 }} />
                                ) : null}
                                <Button
                                  onClick={(): void => {
                                    setExpandedActionId((currentExpandedActionId) => (currentExpandedActionId === action.id ? null : action.id));
                                  }}
                                  disabled={!relatedMission}
                                  size="small"
                                  sx={{ minWidth: 0, px: 1 }}
                                  variant="text"
                                >
                                  Detail mission
                                </Button>
                                <IconButton
                                  aria-label={`Supprimer ${action.title}`}
                                  color="error"
                                  sx={{ display: 'none' }}
                                  onClick={(): void => {
                                    void (async (): Promise<void> => {
                                      try {
                                        await deleteFollowUpAction(action.id);
                                        setActions((currentActions) => currentActions.filter((item) => item.id !== action.id));
                                        setExpandedActionId((currentExpandedActionId) =>
                                          currentExpandedActionId === action.id ? null : currentExpandedActionId
                                        );
                                        addNotification({
                                          message: `L’action ${action.title} a ete supprimee du suivi.`,
                                          title: 'Suivi',
                                        });
                                      } catch (error) {
                                        addNotification({
                                          message: error instanceof Error ? error.message : 'Suppression de l’action impossible.',
                                          title: 'Suivi',
                                        });
                                      }
                                    })();
                                  }}
                                  size="small"
                                >
                                  <TrashIcon fontSize="var(--icon-fontSize-md)" />
                                </IconButton>
                              </Stack>
                            </Stack>

                            <Typography color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                              {getActionSummary(action)}
                            </Typography>

                            <Stack spacing={0.35}>
                              <Typography sx={{ color: '#475569', fontSize: '0.76rem', fontWeight: 700 }}>
                                {formatDateRange(action.startDate, action.endDate)}
                              </Typography>
                              <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                                Responsable : {action.owner || 'Non affecté'} | Échéance : {action.deadline || action.endDate}
                              </Typography>
                              {relatedMission ? (
                                <Button
                                  onClick={(): void => {
                                    setExpandedActionId((currentExpandedActionId) => (currentExpandedActionId === action.id ? null : action.id));
                                  }}
                                  size="small"
                                  sx={{ alignSelf: 'flex-start', minWidth: 0, px: 0, textTransform: 'none' }}
                                  variant="text"
                                >
                                  {relatedMission.title}
                                </Button>
                              ) : null}
                            </Stack>

                            {isExpanded && relatedMission ? (
                              <Box
                                sx={{
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid rgba(148, 163, 184, 0.16)',
                                  borderRadius: '14px',
                                  mt: 0.4,
                                  p: 1.35,
                                }}
                              >
                                <Stack spacing={1.2}>
                                  <Typography sx={{ color: '#0f172a', fontSize: '0.84rem', fontWeight: 800 }}>
                                    Detail complet de la mission
                                  </Typography>

                                  <Box
                                    sx={{
                                      display: 'grid',
                                      gap: 1,
                                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                                    }}
                                  >
                                    <Box>
                                      <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Reference
                                      </Typography>
                                      <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                        {relatedMission.id}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Mission
                                      </Typography>
                                      <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                        {relatedMission.title}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Entite
                                      </Typography>
                                      <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                        {relatedMission.client}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Site
                                      </Typography>
                                      <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                        {relatedMission.site}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Responsable
                                      </Typography>
                                      <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                        {relatedMission.owner}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Echeance
                                      </Typography>
                                      <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                        {dayjs(relatedMission.dueDate).format('DD MMM YYYY')}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Phase
                                      </Typography>
                                      <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                        {getMissionPhaseLabel(relatedMission.status)}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Priorite
                                      </Typography>
                                      <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                        {getMissionPriorityLabel(relatedMission.priority)}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box>
                                    <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                      Objectif
                                    </Typography>
                                    <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                      {relatedMission.objective}
                                    </Typography>
                                  </Box>

                                  <Box>
                                    <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                      Perimetre
                                    </Typography>
                                    <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                      {relatedMission.scope}
                                    </Typography>
                                  </Box>

                                  <Box>
                                    <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                      Prochaine action
                                    </Typography>
                                    <Typography sx={{ color: '#111827', fontSize: '0.8rem', lineHeight: 1.6, mt: 0.35 }}>
                                      {relatedMission.nextAction}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Box>
                            ) : null}

                          </Stack>
                        </Box>
                        );
                      })
                    ) : (
                      <Box
                        sx={{
                          alignItems: 'center',
                          backgroundColor: '#f8fafc',
                          border: '1px dashed rgba(148, 163, 184, 0.36)',
                          borderRadius: '16px',
                          color: '#64748b',
                          display: 'flex',
                          justifyContent: 'center',
                          minHeight: 98,
                          px: 2,
                          textAlign: 'center',
                        }}
                      >
                        <Typography sx={{ color: 'inherit', fontSize: '0.84rem', lineHeight: 1.6 }}>
                          Glisse une action ici pour mettre a jour son avancement.
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(3, minmax(320px, 1fr))',
              minWidth: 1030,
            }}
          >
            {recommendationColumns.map((column) => {
              const isActiveDropZone = dropTargetRecommendationStatus === column.decisionStatus;

              return (
                <Card
                  key={column.key}
                  onDragOver={(event): void => {
                    event.preventDefault();
                    setDropTargetRecommendationStatus(column.decisionStatus);
                  }}
                  onDrop={(event): void => {
                    event.preventDefault();

                    if (draggedRecommendationId) {
                      moveRecommendationToStatus(draggedRecommendationId, column.decisionStatus);
                    }

                    setDraggedRecommendationId(null);
                    setDropTargetRecommendationStatus(null);
                  }}
                  sx={{
                    backgroundColor: isActiveDropZone ? `${column.accent}10` : '#ffffff',
                    border: isActiveDropZone ? `1px solid ${column.accent}` : `1px solid ${column.border}`,
                    borderRadius: '20px',
                    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.07)',
                    minHeight: 390,
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  }}
                >
                  <CardContent sx={{ p: 1.75 }}>
                    <Stack spacing={1.5}>
                      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1.5}>
                        <Box
                          sx={{
                            backgroundColor: `${column.accent}12`,
                            borderRadius: '999px',
                            color: column.accent,
                            px: 1.2,
                            py: 0.55,
                          }}
                        >
                          <Typography sx={{ color: 'inherit', fontSize: '0.78rem', fontWeight: 700 }}>{column.label}</Typography>
                        </Box>
                        <Chip
                          label={recommendationCounts[column.key]}
                          size="small"
                          sx={{ backgroundColor: `${column.accent}14`, color: column.accent, fontWeight: 700 }}
                        />
                      </Stack>

                      <Stack spacing={1.15}>
                        {column.rows.length > 0 ? (
                          column.rows.map((row) => (
                            <Box
                              draggable
                              key={row.id}
                              onDragEnd={(): void => {
                                setDraggedRecommendationId(null);
                                setDropTargetRecommendationStatus(null);
                              }}
                              onDragStart={(event): void => {
                                event.dataTransfer.effectAllowed = 'move';
                                setDraggedRecommendationId(row.id);
                              }}
                              sx={{
                                backgroundColor: '#ffffff',
                                border: '1px solid rgba(148, 163, 184, 0.14)',
                                borderRadius: '16px',
                                cursor: 'grab',
                                p: 1.45,
                                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                                '&:hover': {
                                  boxShadow: '0 16px 34px rgba(15, 23, 42, 0.10)',
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              <Stack spacing={0.8}>
                                <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1.25}>
                                  <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                                    <Typography sx={{ color: '#111827', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.45 }}>
                                      {row.risk}
                                    </Typography>
                                    <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                      <Chip label={row.code} size="small" sx={{ backgroundColor: '#eef2ff', color: '#4338ca', fontWeight: 700 }} />
                                      <Chip label={row.auditableObject} size="small" sx={{ backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700 }} />
                                    </Stack>
                                  </Stack>
                                  {row.canDelete ? (
                                    <IconButton
                                      aria-label={`Supprimer ${row.risk}`}
                                      color="error"
                                      onClick={(): void => {
                                        handleDeleteRecommendation(row.id);
                                      }}
                                      size="small"
                                    >
                                      <TrashIcon fontSize="var(--icon-fontSize-md)" />
                                    </IconButton>
                                  ) : null}
                                </Stack>

                                {row.mission ? (
                                  <Button
                                    onClick={(): void => {
                                      setSelectedMission(row.mission);
                                    }}
                                    size="small"
                                    sx={{ alignSelf: 'flex-start', minWidth: 0, px: 0, textTransform: 'none' }}
                                    variant="text"
                                  >
                                    {row.mission.title}
                                  </Button>
                                ) : null}
                                <Typography color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.58 }}>
                                  {row.operationalControlObjective}
                                </Typography>
                                <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.55 }}>
                                  {row.auditableSubObject} | {row.controlMeasure}
                                </Typography>
                              </Stack>
                            </Box>
                          ))
                        ) : (
                          <Box
                            sx={{
                              alignItems: 'center',
                              backgroundColor: '#f8fafc',
                              border: '1px dashed rgba(148, 163, 184, 0.36)',
                              borderRadius: '16px',
                              color: '#64748b',
                              display: 'flex',
                              justifyContent: 'center',
                              minHeight: 98,
                              px: 2,
                              textAlign: 'center',
                            }}
                          >
                            <Typography sx={{ color: 'inherit', fontSize: '0.84rem', lineHeight: 1.6 }}>
                              Glisse une recommandation ici pour mettre à jour son état.
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      


      <Dialog fullWidth maxWidth="md" onClose={(): void => setSelectedMission(null)} open={Boolean(selectedMission)}>
        <DialogTitle>Detail complet de la mission</DialogTitle>
        <DialogContent dividers>
          {selectedMission ? (
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: '32%' }}>Reference</TableCell>
                  <TableCell>{selectedMission.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Mission</TableCell>
                  <TableCell>{selectedMission.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Entite</TableCell>
                  <TableCell>{selectedMission.client}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Site</TableCell>
                  <TableCell>{selectedMission.site}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Responsable</TableCell>
                  <TableCell>{selectedMission.owner}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Échéance</TableCell>
                  <TableCell>{dayjs(selectedMission.dueDate).format('DD MMM YYYY')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Phase</TableCell>
                  <TableCell>{getMissionPhaseLabel(selectedMission.status)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Priorité</TableCell>
                  <TableCell>{getMissionPriorityLabel(selectedMission.priority)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Progression</TableCell>
                  <TableCell>{selectedMission.progress}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Constats ouverts</TableCell>
                  <TableCell>{selectedMission.openFindings}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Objectif</TableCell>
                  <TableCell>{selectedMission.objective}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Perimetre</TableCell>
                  <TableCell>{selectedMission.scope}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Prochaine action</TableCell>
                  <TableCell>{selectedMission.nextAction}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={(): void => setSelectedMission(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="md" onClose={(): void => setIsDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>Nouvelle recommandation</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Box
              sx={{
                border: '1px solid rgba(148, 163, 184, 0.16)',
                borderRadius: '20px',
                p: { xs: 1.5, md: 2 },
              }}
            >
              <Stack spacing={1.5}>
                <Typography sx={{ color: '#0f172a', fontSize: '0.94rem', fontWeight: 800 }}>Fiche de création de recommandation</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6 }}>
                  Renseigne chaque information dans ce formulaire vertical. Tous les champs restent visibles sans défilement horizontal.
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: { md: 'minmax(0, 1fr) minmax(0, 1fr)', xs: '1fr' },
                  }}
                >
                  <TextField
                    fullWidth
                    label="N° recommandation"
                    onChange={(event): void => {
                      setDraft((currentDraft) => ({ ...currentDraft, recommendationNumber: event.target.value }));
                    }}
                    placeholder="R1"
                    size="small"
                    value={draft.recommendationNumber}
                  />

                  <TextField
                    fullWidth
                    label="Évaluation"
                    onChange={(event): void => {
                      setDraft((currentDraft) => ({ ...currentDraft, evaluation: event.target.value as FollowUpEvaluation }));
                    }}
                    select
                    size="small"
                    value={draft.evaluation}
                  >
                    {evaluationOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <TextField
                  fullWidth
                  label="Recommandation"
                  minRows={3}
                  multiline
                  onChange={(event): void => {
                    setDraft((currentDraft) => ({ ...currentDraft, recommendation: event.target.value }));
                  }}
                  placeholder="Décrire la recommandation"
                  size="small"
                  value={draft.recommendation}
                />

                <TextField
                  fullWidth
                  label="Action"
                  minRows={3}
                  multiline
                  onChange={(event): void => {
                    setDraft((currentDraft) => ({ ...currentDraft, actionDetail: event.target.value }));
                  }}
                  placeholder="Décrire l’action à réaliser"
                  size="small"
                  value={draft.actionDetail}
                />

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: { md: 'minmax(0, 1fr) minmax(0, 1fr)', xs: '1fr' },
                  }}
                >
                  <TextField
                    fullWidth
                    label="Date de début"
                    onChange={(event): void => {
                      setDraft((currentDraft) => ({ ...currentDraft, startDate: event.target.value }));
                    }}
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    type="date"
                    value={draft.startDate}
                  />

                  <TextField
                    fullWidth
                    label="Date de fin"
                    onChange={(event): void => {
                      setDraft((currentDraft) => ({ ...currentDraft, endDate: event.target.value }));
                    }}
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    type="date"
                    value={draft.endDate}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Responsable"
                  onChange={(event): void => {
                    setDraft((currentDraft) => ({ ...currentDraft, owner: event.target.value }));
                  }}
                  select
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: { maxHeight: 220 },
                      },
                    },
                  }}
                  size="small"
                  value={draft.owner}
                >
                  {ownerOptions.map((ownerOption) => (
                    <MenuItem key={ownerOption} value={ownerOption}>
                      {ownerOption}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Remarques"
                  minRows={3}
                  multiline
                  onChange={(event): void => {
                    setDraft((currentDraft) => ({ ...currentDraft, remarks: event.target.value }));
                  }}
                  placeholder="Commentaires complémentaires"
                  size="small"
                  value={draft.remarks}
                />

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: { md: 'minmax(0, 1fr) minmax(0, 1fr)', xs: '1fr' },
                  }}
                >
                  <TextField
                    fullWidth
                    label="Statut de recommandation"
                    onChange={(event): void => {
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        recommendationStatus: event.target.value as WorkspaceRecommendationStatus,
                      }));
                    }}
                    select
                    size="small"
                    value={draft.recommendationStatus}
                  >
                    {recommendationStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {getRecommendationStatusLabel(option.value)}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Statut d'action"
                    onChange={(event): void => {
                      setDraft((currentDraft) => ({ ...currentDraft, status: event.target.value as FollowUpStatus }));
                    }}
                    select
                    size="small"
                    value={draft.status}
                  >
                    {statusColumns.map((column) => (
                      <MenuItem key={column.status} value={column.status}>
                        {column.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <TextField
                  fullWidth
                  label="Mission associée"
                  onChange={(event): void => {
                    setDraft((currentDraft) => ({ ...currentDraft, missionId: event.target.value || null }));
                  }}
                  select
                  size="small"
                  value={draft.missionId ?? ''}
                >
                  <MenuItem value="">Aucune mission associée</MenuItem>
                  {missions.map((mission) => (
                    <MenuItem key={mission.id} value={mission.id}>
                      {mission.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Box>
            {draftError ? <Typography sx={{ color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>{draftError}</Typography> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={(): void => {
              setDraft(defaultDraft);
              setDraftError(null);
              setIsDialogOpen(false);
            }}
            variant="text"
          >
            Annuler
          </Button>
          <Button onClick={handleCreateAction} startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
