'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { filterMissionsForUser } from '@/lib/missions/access';
import type { AuditMission } from '@/lib/missions/mock-data';
import type { ParsedPdfReportDocument, ReportBreakdownItem } from '@/lib/reports/report-pdf-source';
import { type WorkspaceFollowUpAction } from '@/lib/workspace-storage';

interface ReportGenerationForm {
  actionComment: string;
  endDate: string;
  footerText: string;
  missionIds: string[];
  recommendationComment: string;
  reportDescription: string;
  startDate: string;
}

interface GeneratedReportSnapshot extends ReportGenerationForm {
  generatedAt: string;
  pdfDocument: ParsedPdfReportDocument | null;
}

interface ReportGenerationPageState {
  form: ReportGenerationForm;
  generatedReport: GeneratedReportSnapshot | null;
  savedAt: string | null;
}

interface ReportContext {
  acceptedRecommendations: WorkspaceFollowUpAction[];
  actionComment: string;
  completedActions: WorkspaceFollowUpAction[];
  endDate: string;
  footerText: string;
  generatedAt: string;
  inStudyRecommendations: WorkspaceFollowUpAction[];
  missions: AuditMission[];
  recommendationComment: string;
  rejectedRecommendations: WorkspaceFollowUpAction[];
  reportDescription: string;
  startDate: string;
  totalActions: WorkspaceFollowUpAction[];
  totalRecommendations: WorkspaceFollowUpAction[];
}

interface ReportSourceResponse {
  document: ParsedPdfReportDocument;
  generatedAt: string;
  pdfPreviewUrl: string;
}

const REPORT_DESCRIPTION_MAX = 200;
const RECOMMENDATION_COMMENT_MAX = 850;
const ACTION_COMMENT_MAX = 900;
const FOOTER_TEXT_MAX = 150;

function createDefaultForm(): ReportGenerationForm {
  return {
    actionComment: '',
    endDate: dayjs().format('YYYY-MM-DD'),
    footerText: '',
    missionIds: [],
    recommendationComment: '',
    reportDescription: '',
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
  };
}

function createDefaultState(): ReportGenerationPageState {
  return {
    form: createDefaultForm(),
    generatedReport: null,
    savedAt: null,
  };
}

function sanitizeText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.slice(0, maxLength) : '';
}

function sanitizeMissionIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function sanitizeForm(value: unknown): ReportGenerationForm {
  const fallback = createDefaultForm();

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const source = value as Partial<ReportGenerationForm>;

  return {
    actionComment: sanitizeText(source.actionComment, ACTION_COMMENT_MAX),
    endDate: typeof source.endDate === 'string' && source.endDate ? source.endDate : fallback.endDate,
    footerText: sanitizeText(source.footerText, FOOTER_TEXT_MAX),
    missionIds: sanitizeMissionIds(source.missionIds),
    recommendationComment: sanitizeText(source.recommendationComment, RECOMMENDATION_COMMENT_MAX),
    reportDescription: sanitizeText(source.reportDescription, REPORT_DESCRIPTION_MAX),
    startDate: typeof source.startDate === 'string' && source.startDate ? source.startDate : fallback.startDate,
  };
}

function sanitizeBreakdownItems(value: unknown): ReportBreakdownItem[] {
  return Array.isArray(value)
    ? value.filter((item): item is ReportBreakdownItem => {
        if (!item || typeof item !== 'object') {
          return false;
        }

        const source = item as Partial<ReportBreakdownItem>;
        return typeof source.label === 'string' && typeof source.value === 'string';
      })
    : [];
}

function sanitizePdfDocument(value: unknown): ParsedPdfReportDocument | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Partial<ParsedPdfReportDocument>;

  if (
    typeof source.actionNarrative !== 'string' ||
    typeof source.criticalActionImplementationRate !== 'string' ||
    typeof source.department !== 'string' ||
    typeof source.extractedAt !== 'string' ||
    typeof source.footer !== 'string' ||
    typeof source.implementationRate !== 'string' ||
    typeof source.organization !== 'string' ||
    typeof source.recommendationAcceptanceRate !== 'string' ||
    typeof source.recommendationNarrative !== 'string' ||
    typeof source.reportDate !== 'string' ||
    typeof source.sourceFileName !== 'string' ||
    typeof source.subtitle !== 'string' ||
    typeof source.title !== 'string' ||
    typeof source.totalAcceptedRecommendations !== 'number' ||
    typeof source.totalActions !== 'number' ||
    typeof source.totalInStudyRecommendations !== 'number' ||
    typeof source.totalRecommendations !== 'number' ||
    typeof source.totalRejectedRecommendations !== 'number'
  ) {
    return null;
  }

  return {
    actionCriticalityBreakdown: sanitizeBreakdownItems(source.actionCriticalityBreakdown),
    actionNarrative: source.actionNarrative,
    actionStatusBreakdown: sanitizeBreakdownItems(source.actionStatusBreakdown),
    criticalActionImplementationRate: source.criticalActionImplementationRate,
    department: source.department,
    extractedAt: source.extractedAt,
    footer: source.footer,
    implementationRate: source.implementationRate,
    organization: source.organization,
    recommendationAcceptanceRate: source.recommendationAcceptanceRate,
    recommendationBreakdown: sanitizeBreakdownItems(source.recommendationBreakdown),
    recommendationNarrative: source.recommendationNarrative,
    reportDate: source.reportDate,
    sourceFileName: source.sourceFileName,
    subtitle: source.subtitle,
    title: source.title,
    totalAcceptedRecommendations: source.totalAcceptedRecommendations,
    totalActions: source.totalActions,
    totalInStudyRecommendations: source.totalInStudyRecommendations,
    totalRecommendations: source.totalRecommendations,
    totalRejectedRecommendations: source.totalRejectedRecommendations,
  };
}

function sanitizeGeneratedReport(value: unknown): GeneratedReportSnapshot | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Partial<GeneratedReportSnapshot>;
  const sanitizedForm = sanitizeForm(source);

  if (typeof source.generatedAt !== 'string' || !source.generatedAt) {
    return null;
  }

  return {
    ...sanitizedForm,
    generatedAt: source.generatedAt,
    pdfDocument: sanitizePdfDocument(source.pdfDocument),
  };
}

function createFormFromPdfDocument(document: ParsedPdfReportDocument, missionIds: string[]): ReportGenerationForm {
  const reportDate = dayjs(document.reportDate).isValid() ? dayjs(document.reportDate) : dayjs('2026-06-02');
  const inferredStartDate =
    document.subtitle.includes('2025') || document.recommendationNarrative.includes('2025')
      ? dayjs('2025-01-01')
      : reportDate.startOf('year');

  return {
    actionComment: document.actionNarrative.slice(0, ACTION_COMMENT_MAX),
    endDate: reportDate.format('YYYY-MM-DD'),
    footerText: document.footer.slice(0, FOOTER_TEXT_MAX),
    missionIds,
    recommendationComment: document.recommendationNarrative.slice(0, RECOMMENDATION_COMMENT_MAX),
    reportDescription: `${document.title} - ${document.subtitle}`.slice(0, REPORT_DESCRIPTION_MAX),
    startDate: inferredStartDate.format('YYYY-MM-DD'),
  };
}

function sanitizePageState(value: unknown): ReportGenerationPageState {
  const fallback = createDefaultState();

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const source = value as Partial<ReportGenerationPageState>;

  return {
    form: sanitizeForm(source.form),
    generatedReport: sanitizeGeneratedReport(source.generatedReport),
    savedAt: typeof source.savedAt === 'string' ? source.savedAt : null,
  };
}

function normalizeText(value: string): string {
  return value.normalize('NFD').replaceAll(/\p{Diacritic}/gu, '');
}

function formatDate(value: string): string {
  return dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY') : value;
}

function buildCharacterCounter(currentLength: number, maxLength: number): string {
  return `${currentLength}/${maxLength}`;
}

function overlapsSelectedPeriod(action: WorkspaceFollowUpAction, startDate: string, endDate: string): boolean {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const actionStart = dayjs(action.startDate);
  const actionEnd = dayjs(action.endDate);

  return actionStart.isValid() && actionEnd.isValid() && !actionEnd.isBefore(start, 'day') && !actionStart.isAfter(end, 'day');
}

function buildReportContext(
  snapshot: GeneratedReportSnapshot,
  missions: AuditMission[],
  followUpActions: WorkspaceFollowUpAction[]
): ReportContext {
  const selectedMissions = missions.filter((mission) => snapshot.missionIds.includes(mission.id));
  const selectedMissionIds = new Set(selectedMissions.map((mission) => mission.id));
  const relevantRecommendations = followUpActions.filter(
    (action) => action.missionId && selectedMissionIds.has(action.missionId) && overlapsSelectedPeriod(action, snapshot.startDate, snapshot.endDate)
  );
  const acceptedRecommendations = relevantRecommendations.filter((action) => action.recommendationStatus === 'accepted');
  const rejectedRecommendations = relevantRecommendations.filter((action) => action.recommendationStatus === 'not-accepted');
  const inStudyRecommendations = relevantRecommendations.filter((action) => action.recommendationStatus === 'in-study');
  const totalActions = acceptedRecommendations;
  const completedActions = totalActions.filter((action) => action.status === 'completed');

  return {
    acceptedRecommendations,
    actionComment: snapshot.actionComment,
    completedActions,
    endDate: snapshot.endDate,
    footerText: snapshot.footerText,
    generatedAt: snapshot.generatedAt,
    inStudyRecommendations,
    missions: selectedMissions,
    recommendationComment: snapshot.recommendationComment,
    rejectedRecommendations,
    reportDescription: snapshot.reportDescription,
    startDate: snapshot.startDate,
    totalActions,
    totalRecommendations: relevantRecommendations,
  };
}

function escapePdfText(value: string): string {
  return normalizeText(value).replaceAll('\\', String.raw`\\`).replaceAll('(', String.raw`\(`).replaceAll(')', String.raw`\)`);
}

function wrapPdfText(value: string, maxLength = 88): string[] {
  const normalized = normalizeText(value).replaceAll(/\s+/g, ' ').trim();

  if (!normalized) {
    return [''];
  }

  const words = normalized.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
      continue;
    }

    if (`${currentLine} ${word}`.length <= maxLength) {
      currentLine = `${currentLine} ${word}`;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function buildPdfLines(context: ReportContext, author: string): string[] {
  return [
    'RAPPORT DE SYNTHESE AUDITFLOW',
    `Genere le : ${formatDate(context.generatedAt)}`,
    `Auteur : ${author}`,
    `Periode : ${formatDate(context.startDate)} au ${formatDate(context.endDate)}`,
    '',
    'MISSIONS SELECTIONNEES',
    ...context.missions.flatMap((mission) => [`- ${mission.title}`, `  Site : ${mission.site} | Responsable : ${mission.owner}`]),
    '',
    'INDICATEURS CLES',
    `- Total missions : ${context.missions.length}`,
    `- Recommandations acceptees : ${context.acceptedRecommendations.length}`,
    `- Recommandations non acceptees : ${context.rejectedRecommendations.length}`,
    `- Recommandations a l'etude : ${context.inStudyRecommendations.length}`,
    `- Total des actions : ${context.totalActions.length}`,
    `- Actions terminees : ${context.completedActions.length}`,
    '',
    'DESCRIPTION DU RAPPORT',
    ...wrapPdfText(context.reportDescription),
    '',
    'COMMENTAIRE DES RECOMMANDATIONS',
    ...wrapPdfText(context.recommendationComment),
    '',
    'COMMENTAIRE DES ACTIONS',
    ...wrapPdfText(context.actionComment),
    '',
    'PIED DE PAGE',
    ...wrapPdfText(context.footerText),
  ];
}

function formatPercentage(value: number, total: number): string {
  if (total <= 0) {
    return '0%';
  }

  return `${Math.round((value / total) * 100)}%`;
}

function formatShare(value: number, total: number): string {
  if (total <= 0) {
    return '0%';
  }

  const percentage = (value / total) * 100;
  const formatted = Number.isInteger(percentage) ? percentage.toFixed(0) : percentage.toFixed(1);

  return `${formatted.replace('.', ',')}%`;
}

function countByEvaluation(actions: WorkspaceFollowUpAction[], evaluation: WorkspaceFollowUpAction['evaluation']): number {
  return actions.filter((action) => action.evaluation === evaluation).length;
}

function countByStatus(actions: WorkspaceFollowUpAction[], status: WorkspaceFollowUpAction['status']): number {
  return actions.filter((action) => action.status === status).length;
}

function buildRecommendationBreakdown(actions: WorkspaceFollowUpAction[]): ReportBreakdownItem[] {
  return [
    { label: 'Critique', value: `${countByEvaluation(actions, 'Critique')}` },
    { label: 'Modere', value: `${countByEvaluation(actions, 'Modere')}` },
    { label: 'Mineur', value: `${countByEvaluation(actions, 'Mineur')}` },
  ];
}

function buildActionStatusBreakdown(actions: WorkspaceFollowUpAction[]): ReportBreakdownItem[] {
  return [
    { label: 'Non echues', value: `${countByStatus(actions, 'not-due')}` },
    { label: 'Planifiees', value: `${countByStatus(actions, 'planning')}` },
    { label: 'En cours', value: `${countByStatus(actions, 'in-progress')}` },
    { label: 'Cloturees', value: `${countByStatus(actions, 'completed')}` },
    { label: 'En retard', value: `${countByStatus(actions, 'at-risk')}` },
  ];
}

function buildActionCriticalityBreakdown(actions: WorkspaceFollowUpAction[]): ReportBreakdownItem[] {
  const total = actions.length;

  return [
    { label: 'Critique', value: formatShare(countByEvaluation(actions, 'Critique'), total) },
    { label: 'Modere', value: formatShare(countByEvaluation(actions, 'Modere'), total) },
    { label: 'Mineur', value: formatShare(countByEvaluation(actions, 'Mineur'), total) },
  ];
}

function joinBreakdownItems(items: ReportBreakdownItem[]): string {
  return items.map((item) => `${item.label}: ${item.value}`).join(' | ');
}

function buildGeneratedPdfLines(referenceDocument: ParsedPdfReportDocument, context: ReportContext, author: string): string[] {
  const recommendationBreakdown = buildRecommendationBreakdown(context.acceptedRecommendations);
  const actionStatusBreakdown = buildActionStatusBreakdown(context.totalActions);
  const actionCriticalityBreakdown = buildActionCriticalityBreakdown(context.totalActions);
  const completedCriticalActions = context.totalActions.filter((action) => action.evaluation === 'Critique' && action.status === 'completed').length;
  const totalCriticalActions = countByEvaluation(context.totalActions, 'Critique');
  const recommendationNarrative = context.recommendationComment || referenceDocument.recommendationNarrative;
  const actionNarrative = context.actionComment || referenceDocument.actionNarrative;
  const footerText = context.footerText || referenceDocument.footer;
  const reportDescription =
    context.reportDescription ||
    `Synthese de suivi sur ${context.missions.length} mission(s) entre le ${formatDate(context.startDate)} et le ${formatDate(context.endDate)}.`;

  return [
    referenceDocument.title || 'Rapport de synthese AuditFlow',
    referenceDocument.subtitle || 'Rapport de suivi des plans d actions',
    referenceDocument.department,
    referenceDocument.organization,
    '',
    `Date du rapport : ${formatDate(context.generatedAt)}`,
    `Auteur : ${author}`,
    `Periode analysee : du ${formatDate(context.startDate)} au ${formatDate(context.endDate)}`,
    '',
    'DESCRIPTION',
    ...wrapPdfText(reportDescription),
    '',
    'MISSIONS SELECTIONNEES',
    ...context.missions.flatMap((mission) => [`- ${mission.title}`, `  Site : ${mission.site} | Responsable : ${mission.owner}`]),
    '',
    '01 INDICATEURS DE SUIVI DES RECOMMANDATIONS',
    `- Nombre total des recommandations : ${context.totalRecommendations.length}`,
    `- Recommandations acceptees : ${context.acceptedRecommendations.length} (${formatPercentage(context.acceptedRecommendations.length, context.totalRecommendations.length)})`,
    `- Recommandations non acceptees : ${context.rejectedRecommendations.length} (${formatPercentage(context.rejectedRecommendations.length, context.totalRecommendations.length)})`,
    `- Recommandations a l etude : ${context.inStudyRecommendations.length} (${formatPercentage(context.inStudyRecommendations.length, context.totalRecommendations.length)})`,
    `- Taux d acceptation : ${formatPercentage(context.acceptedRecommendations.length, context.totalRecommendations.length)}`,
    `- Repartition des recommandations acceptees : ${joinBreakdownItems(recommendationBreakdown)}`,
    '',
    'ANALYSE DES RECOMMANDATIONS',
    ...wrapPdfText(recommendationNarrative),
    '',
    '02 INDICATEURS DE SUIVI DES PLANS D ACTIONS',
    `- Nombre total des actions : ${context.totalActions.length}`,
    `- Actions cloturees : ${context.completedActions.length} (${formatPercentage(context.completedActions.length, context.totalActions.length)})`,
    `- Taux de mise en oeuvre : ${formatPercentage(context.completedActions.length, context.totalActions.length)}`,
    `- Taux de mise en oeuvre des actions critiques : ${formatPercentage(completedCriticalActions, totalCriticalActions)}`,
    `- Repartition des actions par statut : ${joinBreakdownItems(actionStatusBreakdown)}`,
    `- Repartition des actions par criticite : ${joinBreakdownItems(actionCriticalityBreakdown)}`,
    '',
    'ANALYSE DES ACTIONS',
    ...wrapPdfText(actionNarrative),
    '',
    'PIED DE PAGE',
    ...wrapPdfText(footerText),
  ];
}

function createPdfBlob(lines: string[]): Blob {
  const pageLineLimit = 42;
  const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / pageLineLimit)) }, (_, index) =>
    lines.slice(index * pageLineLimit, (index + 1) * pageLineLimit)
  );
  const pageObjectIds = pages.map((_, index) => 3 + index * 2);
  const contentObjectIds = pages.map((_, index) => 4 + index * 2);
  const fontObjectId = 3 + pages.length * 2;
  const objects: string[] = [];

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] >>`;

  for (const [index, pageLines] of pages.entries()) {
    const pageId = pageObjectIds[index];
    const contentId = contentObjectIds[index];
    let y = 790;
    let stream = 'BT\n/F1 11 Tf\n';

    for (const line of pageLines) {
      stream += `1 0 0 1 48 ${y} Tm (${escapePdfText(line)}) Tj\n`;
      y -= 17;
    }

    stream += 'ET';
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  objects[fontObjectId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function ParameterCard(props: React.PropsWithChildren<{ eyebrow: string; title: string; description: string }>): React.JSX.Element {
  const { children, description, eyebrow, title } = props;

  return (
    <Card
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(148, 163, 184, 0.14)',
        borderRadius: '26px',
        boxShadow: '0 18px 36px rgba(15, 23, 42, 0.05)',
      }}
    >
      <CardContent sx={{ p: { xs: 2.3, md: 2.8 } }}>
        <Stack spacing={2.2}>
          <Box>
            <Typography sx={{ color: '#4f46e5', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              {eyebrow}
            </Typography>
            <Typography sx={{ color: '#0f172a', fontSize: '1.16rem', fontWeight: 700, mt: 0.75 }}>{title}</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.87rem', lineHeight: 1.7, mt: 0.55 }}>{description}</Typography>
          </Box>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PreviewMetric(props: { label: string; value: React.ReactNode }): React.JSX.Element {
  const { label, value } = props;

  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(148, 163, 184, 0.14)',
        borderRadius: '18px',
        p: 1.6,
      }}
    >
      <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ color: '#0f172a', fontSize: '1.55rem', fontWeight: 800, mt: 0.45 }}>{value}</Typography>
    </Box>
  );
}

function PreviewTextBlock(props: { description: string; title: string }): React.JSX.Element {
  const { description, title } = props;

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(148, 163, 184, 0.14)',
        borderRadius: '18px',
        p: 2,
      }}
    >
      <Typography sx={{ color: '#111827', fontSize: '0.95rem', fontWeight: 700 }}>{title}</Typography>
      <Typography sx={{ color: '#475569', fontSize: '0.84rem', lineHeight: 1.75, mt: 0.85 }}>{description}</Typography>
    </Box>
  );
}

function PreviewBreakdownCard(props: { items: ReportBreakdownItem[]; title: string }): React.JSX.Element {
  const { items, title } = props;

  return (
    <Box
      sx={{
        backgroundColor: '#f8fafc',
        border: '1px solid rgba(148, 163, 184, 0.14)',
        borderRadius: '20px',
        height: '100%',
        p: 2,
      }}
    >
      <Typography sx={{ color: '#111827', fontSize: '0.97rem', fontWeight: 700 }}>{title}</Typography>
      <Stack spacing={0.9} sx={{ mt: 1.25 }}>
        {items.map((item) => (
          <Box key={`${title}-${item.label}`} sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '0.84rem', fontWeight: 600 }}>{item.label}</Typography>
            <Chip label={item.value} size="small" sx={{ fontWeight: 700 }} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default function Page(): React.JSX.Element {
  const { addNotification } = useNotifications();
  const { user } = useUser();
  const { isReady, workspace } = useWorkspace();
  const hasHydratedRef = React.useRef(false);
  const [state, setState] = React.useState<ReportGenerationPageState>(createDefaultState);
  const [error, setError] = React.useState<string | null>(null);
  const [isGenerating, startGenerationTransition] = React.useTransition();
  const hasLoadedPdfReferenceRef = React.useRef(false);

  React.useEffect(() => {
    if (!isReady || hasHydratedRef.current) {
      return;
    }

    hasHydratedRef.current = true;
  }, [isReady]);

  const author = user?.name ?? user?.email ?? 'Utilisateur connecte';
  const missionOptions = React.useMemo(() => filterMissionsForUser(workspace.missions, user), [user, workspace.missions]);
  const selectedMissionLabels = state.form.missionIds.reduce<string[]>((accumulator, missionId) => {
    const title = missionOptions.find((mission) => mission.id === missionId)?.title;

    if (title) {
      accumulator.push(title);
    }

    return accumulator;
  }, []);
  const selectedPeriodDays = Math.max(1, dayjs(state.form.endDate).diff(dayjs(state.form.startDate), 'day') + 1);

  const generatedContext = React.useMemo(
    () => (state.generatedReport ? buildReportContext(state.generatedReport, missionOptions, workspace.followUpActions) : null),
    [missionOptions, state.generatedReport, workspace.followUpActions]
  );
  const generatedPdfDocument = state.generatedReport?.pdfDocument ?? null;
  const generatedPdfPreviewUrl = state.generatedReport ? `/api/report-source/pdf?generatedAt=${encodeURIComponent(state.generatedReport.generatedAt)}` : null;
  const totalMissionOpenFindings = generatedContext?.missions.reduce((sum, mission) => sum + mission.openFindings, 0) ?? 0;
  const totalMissionProgress =
    generatedContext && generatedContext.missions.length > 0
      ? Math.round(generatedContext.missions.reduce((sum, mission) => sum + mission.progress, 0) / generatedContext.missions.length)
      : 0;

  React.useEffect(() => {
    if (!isReady || !hasHydratedRef.current || hasLoadedPdfReferenceRef.current || missionOptions.length === 0) {
      return;
    }

    hasLoadedPdfReferenceRef.current = true;

    void (async (): Promise<void> => {
      try {
        const response = await fetch('/api/report-source', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Le fichier PDF de reference n a pas pu etre charge.');
        }

        const payload = (await response.json()) as ReportSourceResponse;

        setState((current) => ({
          ...current,
          form: createFormFromPdfDocument(
            payload.document,
            current.form.missionIds.length > 0 ? current.form.missionIds : missionOptions.map((mission) => mission.id)
          ),
        }));
      } catch (loadingError) {
        setError(loadingError instanceof Error ? loadingError.message : 'Chargement du PDF de reference impossible.');
      }
    })();
  }, [isReady, missionOptions]);

  const updateForm = <Field extends keyof ReportGenerationForm>(field: Field, value: ReportGenerationForm[Field]): void => {
    setState((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: value,
      },
    }));
  };

  const persistState = (nextState: ReportGenerationPageState): void => {
    setState(nextState);
  };

  const handleMissionChange = (event: SelectChangeEvent<string[]>): void => {
    const value = event.target.value;
    updateForm('missionIds', typeof value === 'string' ? value.split(',') : value);
  };

  const handleGenerateReport = (): void => {
    startGenerationTransition(() => {
      void (async (): Promise<void> => {
        try {
          const response = await fetch('/api/report-source', { cache: 'no-store' });

          if (!response.ok) {
            throw new Error('Le PDF source n a pas pu etre charge pour generer le rapport.');
          }

          const payload = (await response.json()) as ReportSourceResponse;
          const nextState: ReportGenerationPageState = {
            form: state.form,
            generatedReport: {
              ...state.form,
              generatedAt: payload.generatedAt,
              pdfDocument: payload.document,
            },
            savedAt: new Date().toISOString(),
          };

          persistState(nextState);
          setError(null);
          addNotification({
            message: 'Le rapport PDF de démonstration est prêt.',
            title: 'Rapport',
          });
        } catch (generationError) {
          setError(generationError instanceof Error ? generationError.message : 'Génération du rapport impossible pour le moment.');
        }
      })();
    });
  };

  const handleDownloadPdf = async (): Promise<void> => {
    if (!state.generatedReport) {
      setError('Génère d’abord le rapport avant de télécharger le PDF.');
      return;
    }

    try {
      const response = await fetch('/api/report-source/pdf?download=1', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Le PDF de démonstration n’a pas pu être téléchargé.');
      }

      const pdfBlob = await response.blob();
      downloadBlob(pdfBlob, generatedPdfDocument?.sourceFileName ?? 'report_2026-06-02.pdf');
      setError(null);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Téléchargement du PDF impossible.');
    }
  };

  const handleDownloadExcel = (): void => {
    if (!generatedContext) {
      setError('Génère d’abord le rapport avant de télécharger les données.');
      return;
    }

    const workbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet([
      {
        Auteur: author,
        'Date de génération': formatDate(generatedContext.generatedAt),
        'Date de début': formatDate(generatedContext.startDate),
        'Date de fin': formatDate(generatedContext.endDate),
        'Missions sélectionnées': generatedContext.missions.length,
        'Recommandations acceptées': generatedContext.acceptedRecommendations.length,
        'Recommandations non acceptées': generatedContext.rejectedRecommendations.length,
        'Recommandations à l’étude': generatedContext.inStudyRecommendations.length,
        'Actions terminées': generatedContext.completedActions.length,
        'Total des actions': generatedContext.totalActions.length,
      },
    ]);
    const missionSheet = XLSX.utils.json_to_sheet(
      generatedContext.missions.map((mission) => ({
        Client: mission.client,
        'Date d’échéance': mission.dueDate,
        Mission: mission.title,
        Objectif: mission.objective,
        Priorite: mission.priority,
        Responsable: mission.owner,
        Site: mission.site,
        Statut: mission.status,
      }))
    );
    const recommendationSheet = XLSX.utils.json_to_sheet(
      generatedContext.totalRecommendations.map((recommendation) => ({
        'Détail de l’action': recommendation.actionDetail,
        'Date de début': recommendation.startDate,
        'Date de fin': recommendation.endDate,
        'Évaluation': recommendation.evaluation,
        'N° recommandation': recommendation.recommendationNumber,
        Recommandation: recommendation.recommendation,
        Responsable: recommendation.owner,
        'Statut action': recommendation.status,
        'Statut recommandation': recommendation.recommendationStatus,
      }))
    );
    const actionsSheet = XLSX.utils.json_to_sheet(
      generatedContext.totalActions.map((action) => ({
        'Détail de l’action': action.actionDetail,
        'Date de début': action.startDate,
        'Date de fin': action.endDate,
        'Évaluation': action.evaluation,
        Mission: generatedContext.missions.find((mission) => mission.id === action.missionId)?.title ?? 'Sans mission',
        Recommandation: action.recommendation,
        Responsable: action.owner,
        Statut: action.status,
      }))
    );

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Synthese');
    XLSX.utils.book_append_sheet(workbook, missionSheet, 'Missions');
    XLSX.utils.book_append_sheet(workbook, recommendationSheet, 'Recommandations');
    XLSX.utils.book_append_sheet(workbook, actionsSheet, 'Actions');

    XLSX.writeFile(workbook, `rapport-auditflow-${dayjs(generatedContext.generatedAt).format('YYYYMMDD-HHmm')}.xlsx`);
    setError(null);
  };

  return (
    <Stack spacing={3.25}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(14, 165, 233, 0.05) 48%, rgba(255, 255, 255, 0.94) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          borderRadius: '30px',
          boxShadow: '0 28px 52px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            background: 'radial-gradient(circle at top right, rgba(129, 140, 248, 0.2) 0%, rgba(129, 140, 248, 0) 45%)',
            inset: 0,
            pointerEvents: 'none',
            position: 'absolute',
          }}
        />
        <CardContent sx={{ p: { xs: 2.4, md: 3 } }}>
          <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={2.2}>
            <Box sx={{ maxWidth: 880, position: 'relative' }}>
              <Typography sx={{ color: '#4f46e5', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Rapport
              </Typography>
              <Typography
                sx={{
                  color: '#0f172a',
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  fontWeight: 700,
                  letterSpacing: '-0.05em',
                  mt: 0.8,
                }}
              >
                Génération de rapport
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.97rem', lineHeight: 1.75, maxWidth: 860, mt: 1.1 }}>
                Crée un rapport dynamique AuditFlow à partir des missions ONCF, de la période analysée et des commentaires
                de supervision, puis vérifie l’aperçu avant export PDF ou Excel.
              </Typography>
            </Box>

            <Stack alignItems={{ md: 'flex-end', xs: 'flex-start' }} spacing={1} sx={{ position: 'relative' }}>
              <Chip label={`${missionOptions.length} missions disponibles`} sx={{ backgroundColor: '#ffffff', fontWeight: 700 }} />
              <Chip label={state.savedAt ? `Dernière génération : ${formatDate(state.savedAt)}` : 'Aucune génération enregistrée'} sx={{ backgroundColor: '#ffffff', fontWeight: 700 }} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ lg: 5, xs: 12 }}>
          <Stack spacing={2.5}>
            <ParameterCard
              description=""
              eyebrow="Configuration"
              title="Paramètres du rapport"
            >
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ color: '#0f172a', fontSize: '0.92rem', fontWeight: 700, mb: 0.9 }}>Missions</Typography>
                  <FormControl fullWidth>
                    <Select
                      displayEmpty
                      input={<OutlinedInput />}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                      multiple
                      onChange={handleMissionChange}
                      renderValue={(selected): React.ReactNode => {
                        const values = selected as string[];

                        if (values.length === 0) {
                          return <Typography sx={{ color: '#94a3b8' }}>Choisir une ou plusieurs missions</Typography>;
                        }

                        return values
                          .reduce<string[]>((accumulator, missionId) => {
                            const title = missionOptions.find((mission) => mission.id === missionId)?.title;

                            if (title) {
                              accumulator.push(title);
                            }

                            return accumulator;
                          }, [])
                          .join(', ');
                      }}
                      value={state.form.missionIds}
                    >
                      {missionOptions.map((mission) => (
                        <MenuItem key={mission.id} value={mission.id}>
                          <Checkbox checked={state.form.missionIds.includes(mission.id)} />
                          <ListItemText primary={mission.title} secondary={`${mission.site} | ${mission.owner}`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', mt: 0.75 }}>
                    {selectedMissionLabels.length > 0 ? `${selectedMissionLabels.length} mission(s) sélectionnée(s)` : 'Aucune mission sélectionnée'}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ color: '#0f172a', fontSize: '0.92rem', fontWeight: 700, mb: 0.9 }}>Période</Typography>
                  <Grid container spacing={1.25}>
                    <Grid size={{ sm: 6, xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Date de début"
                        onChange={(event): void => {
                          updateForm('startDate', event.target.value);
                        }}
                        type="date"
                        value={state.form.startDate}
                      />
                    </Grid>
                    <Grid size={{ sm: 6, xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Date de fin"
                        onChange={(event): void => {
                          updateForm('endDate', event.target.value);
                        }}
                        type="date"
                        value={state.form.endDate}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: { sm: 'repeat(3, minmax(0, 1fr))', xs: 'repeat(2, minmax(0, 1fr))' },
                  }}
                >
                  <PreviewMetric label="Période" value={`${selectedPeriodDays} j`} />
                  <PreviewMetric label="Recommandations suivies" value={workspace.followUpActions.length} />
                  <PreviewMetric label="Auteur" value={author.split(' ')[0] ?? author} />
                </Box>

                <Button
                  onClick={handleGenerateReport}
                  sx={{
                    alignSelf: { md: 'flex-start', xs: 'stretch' },
                    borderRadius: '16px',
                    boxShadow: '0 16px 34px rgba(79, 70, 229, 0.2)',
                    minHeight: 48,
                    px: 2.8,
                  }}
                  variant="contained"
                >
                  {isGenerating ? 'Génération...' : 'Générer le rapport'}
                </Button>

                {error ? <Typography sx={{ color: '#dc2626', fontSize: '0.87rem', fontWeight: 600 }}>{error}</Typography> : null}
              </Stack>
            </ParameterCard>

            <ParameterCard
              description="Structure le ton du rapport, les recommandations et la narration opérationnelle avant l’export."
              eyebrow="Narration"
              title="Commentaires et contenu"
            >
              <Stack spacing={1.4}>
                <TextField
                  fullWidth
                  helperText={buildCharacterCounter(state.form.reportDescription.length, REPORT_DESCRIPTION_MAX)}
                  inputProps={{ maxLength: REPORT_DESCRIPTION_MAX }}
                  label="Description du rapport"
                  minRows={4}
                  multiline
                  onChange={(event): void => {
                    updateForm('reportDescription', event.target.value);
                  }}
                  value={state.form.reportDescription}
                />

                <TextField
                  fullWidth
                  helperText={buildCharacterCounter(state.form.recommendationComment.length, RECOMMENDATION_COMMENT_MAX)}
                  inputProps={{ maxLength: RECOMMENDATION_COMMENT_MAX }}
                  label="Commentaire des recommandations"
                  minRows={5}
                  multiline
                  onChange={(event): void => {
                    updateForm('recommendationComment', event.target.value);
                  }}
                  value={state.form.recommendationComment}
                />

                <TextField
                  fullWidth
                  helperText={buildCharacterCounter(state.form.actionComment.length, ACTION_COMMENT_MAX)}
                  inputProps={{ maxLength: ACTION_COMMENT_MAX }}
                  label="Commentaire des actions"
                  minRows={5}
                  multiline
                  onChange={(event): void => {
                    updateForm('actionComment', event.target.value);
                  }}
                  value={state.form.actionComment}
                />

                <TextField
                  fullWidth
                  helperText={buildCharacterCounter(state.form.footerText.length, FOOTER_TEXT_MAX)}
                  inputProps={{ maxLength: FOOTER_TEXT_MAX }}
                  label="Texte du pied de page"
                  minRows={2}
                  multiline
                  onChange={(event): void => {
                    updateForm('footerText', event.target.value);
                  }}
                  value={state.form.footerText}
                />
              </Stack>
            </ParameterCard>
          </Stack>
        </Grid>

        <Grid size={{ lg: 7, xs: 12 }}>
          <Card
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(148, 163, 184, 0.14)',
              borderRadius: '30px',
              boxShadow: '0 22px 40px rgba(15, 23, 42, 0.06)',
              minHeight: '100%',
              overflow: 'hidden',
            }}
          >
            {!generatedPdfDocument ? (
              <Box
                sx={{
                  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.82) 100%)',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                  px: { xs: 2.2, md: 2.8 },
                  py: 2.15,
                }}
              >
                <Typography sx={{ color: '#111827', fontSize: '1.1rem', fontWeight: 700 }}>Aperçu du rapport</Typography>
              </Box>
            ) : null}

            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 840,
                p: generatedPdfDocument ? 0 : { xs: 2.2, md: 2.8 },
              }}
            >
              <Stack spacing={2.2} sx={{ flex: 1 }}>
                {generatedContext ? (
                  generatedPdfDocument ? (
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          height: '100%',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          alt="Aperçu fixe du rapport PDF"
                          component="img"
                          src={generatedPdfPreviewUrl ? `/api/report-source/preview?generatedAt=${encodeURIComponent(state.generatedReport?.generatedAt ?? '')}` : undefined}
                          sx={{
                            display: 'block',
                            height: { md: 'auto', xs: 'auto' },
                            maxWidth: '100%',
                            objectFit: 'contain',
                            width: { md: 760, xs: '100%' },
                          }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Stack spacing={2.2}>
                      <Box
                        sx={{
                          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                          border: '1px solid rgba(148, 163, 184, 0.14)',
                          borderRadius: '24px',
                          p: { xs: 2.1, md: 2.5 },
                        }}
                      >
                        <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={1.4}>
                          <Box>
                            <Typography sx={{ color: '#4f46e5', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                              Rapport dynamique
                            </Typography>
                            <Typography sx={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 800, mt: 0.75 }}>
                              Rapport de synthèse AuditFlow
                            </Typography>
                            <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.7 }}>
                              Période analysée : du {formatDate(generatedContext.startDate)} au {formatDate(generatedContext.endDate)}
                            </Typography>
                          </Box>

                          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1}>
                            <Chip label={`${generatedContext.missions.length} mission(s)`} sx={{ fontWeight: 700 }} />
                            <Chip label={`${generatedContext.totalRecommendations.length} recommandations`} sx={{ fontWeight: 700 }} />
                            <Chip label={`${generatedContext.completedActions.length}/${generatedContext.totalActions.length} actions terminées`} sx={{ fontWeight: 700 }} />
                          </Stack>
                        </Stack>
                      </Box>

                      <Box
                        sx={{
                          display: 'grid',
                          gap: 1.1,
                          gridTemplateColumns: { md: 'repeat(4, minmax(0, 1fr))', xs: 'repeat(2, minmax(0, 1fr))' },
                        }}
                      >
                        <PreviewMetric label="Missions" value={generatedContext.missions.length} />
                        <PreviewMetric label="Progression moyenne" value={`${totalMissionProgress}%`} />
                        <PreviewMetric label="Constats ouverts" value={totalMissionOpenFindings} />
                        <PreviewMetric label="Actions terminées" value={generatedContext.completedActions.length} />
                      </Box>

                      <Grid container spacing={1.2}>
                        <Grid size={{ md: 6, xs: 12 }}>
                          <Box
                            sx={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid rgba(148, 163, 184, 0.14)',
                              borderRadius: '20px',
                              height: '100%',
                              p: 2,
                            }}
                          >
                            <Typography sx={{ color: '#111827', fontSize: '0.97rem', fontWeight: 700 }}>Périmètre et missions</Typography>
                            <Typography sx={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.65, mt: 0.65 }}>
                              Missions retenues pour la génération du rapport, avec leur site, leur responsable et leur statut.
                            </Typography>
                            <Stack spacing={0.85} sx={{ mt: 1.3 }}>
                              {generatedContext.missions.map((mission) => (
                                <Box
                                  key={mission.id}
                                  sx={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid rgba(148, 163, 184, 0.12)',
                                    borderRadius: '16px',
                                    px: 1.35,
                                    py: 1.05,
                                  }}
                                >
                                  <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                                    <Typography sx={{ color: '#111827', fontSize: '0.87rem', fontWeight: 700 }}>{mission.title}</Typography>
                                    <Chip label={mission.status} size="small" sx={{ fontWeight: 700 }} />
                                  </Stack>
                                  <Typography sx={{ color: '#64748b', fontSize: '0.78rem', mt: 0.35 }}>
                                    {mission.site} | Responsable : {mission.owner}
                                  </Typography>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', lineHeight: 1.6, mt: 0.45 }}>
                                    {mission.objective}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        </Grid>

                        <Grid size={{ md: 6, xs: 12 }}>
                          <Box
                            sx={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid rgba(148, 163, 184, 0.14)',
                              borderRadius: '20px',
                              height: '100%',
                              p: 2,
                            }}
                          >
                            <Typography sx={{ color: '#111827', fontSize: '0.97rem', fontWeight: 700 }}>État des recommandations</Typography>
                            <Typography sx={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.65, mt: 0.65 }}>
                              Distribution des recommandations et des actions prises sur la période sélectionnée.
                            </Typography>
                            <Box
                              sx={{
                                display: 'grid',
                                gap: 1,
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                mt: 1.35,
                              }}
                            >
                              <PreviewMetric label="Acceptées" value={generatedContext.acceptedRecommendations.length} />
                              <PreviewMetric label="Non acceptées" value={generatedContext.rejectedRecommendations.length} />
                              <PreviewMetric label="À l’étude" value={generatedContext.inStudyRecommendations.length} />
                              <PreviewMetric label="Total actions" value={generatedContext.totalActions.length} />
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box
                        sx={{
                          display: 'grid',
                          gap: 1.15,
                          gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
                        }}
                      >
                        <PreviewTextBlock
                          description={generatedContext.reportDescription || 'Aucune description renseignee pour ce rapport.'}
                          title="Description du rapport"
                        />
                        <PreviewTextBlock
                          description={generatedContext.recommendationComment || 'Aucun commentaire saisi sur les recommandations.'}
                          title="Commentaire des recommandations"
                        />
                        <PreviewTextBlock
                          description={generatedContext.actionComment || 'Aucun commentaire saisi sur les actions.'}
                          title="Commentaire des actions"
                        />
                        <PreviewTextBlock
                          description={generatedContext.footerText || 'Aucun texte de pied de page ajoute.'}
                          title="Texte du pied de page"
                        />
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid rgba(148, 163, 184, 0.14)',
                          borderRadius: '20px',
                          p: 2,
                        }}
                      >
                        <Typography sx={{ color: '#111827', fontSize: '0.97rem', fontWeight: 700 }}>Lecture rapide</Typography>
                        <Typography sx={{ color: '#475569', fontSize: '0.84rem', lineHeight: 1.75, mt: 0.8 }}>
                          {generatedContext.missions.length} mission(s) couvrent {generatedContext.totalRecommendations.length} recommandation(s) sur la
                          période choisie. {generatedContext.acceptedRecommendations.length} recommandation(s) ont déjà été acceptées et{' '}
                          {generatedContext.completedActions.length} action(s) sont terminées.
                        </Typography>
                      </Box>
                    </Stack>
                  )
                ) : (
                  <Box
                    sx={{
                      alignItems: 'center',
                      background: 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.08) 0%, rgba(248, 250, 252, 0.96) 60%)',
                      border: '1px dashed rgba(148, 163, 184, 0.34)',
                      borderRadius: '26px',
                      color: '#64748b',
                      display: 'flex',
                      flex: 1,
                      justifyContent: 'center',
                      px: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Stack spacing={1.1} sx={{ maxWidth: 480 }}>
                      <Typography sx={{ color: '#111827', fontSize: '1.06rem', fontWeight: 700 }}>Aperçu en attente de génération</Typography>
                      <Typography sx={{ color: 'inherit', fontSize: '0.92rem', lineHeight: 1.8 }}>
                        Configure la sélection des missions, la période d’analyse et les commentaires dans la colonne de gauche,
                        puis clique sur <strong>Générer le rapport</strong> pour afficher ici le rendu complet avant export.
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>

              <Stack direction={{ sm: 'row', xs: 'column' }} justifyContent="flex-end" spacing={1.25} sx={{ mt: 2.5 }}>
                <Button
                  disabled={!generatedContext}
                  onClick={(): void => {
                    void handleDownloadPdf();
                  }}
                  sx={{ borderRadius: '16px', minHeight: 46, px: 2.5 }}
                  variant="outlined"
                >
                  Télécharger le rapport en PDF
                </Button>
                <Button
                  disabled={!generatedContext}
                  onClick={handleDownloadExcel}
                  sx={{ borderRadius: '16px', minHeight: 46, px: 2.5 }}
                  variant="contained"
                >
                  Télécharger les données en Excel
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
