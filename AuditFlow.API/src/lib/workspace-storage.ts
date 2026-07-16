import dayjs from 'dayjs';

import type { AuditMission } from '@/lib/missions/mock-data';
import { auditMissions } from '@/lib/missions/mock-data';

export type WorkspaceFollowUpStatus = 'planning' | 'in-progress' | 'not-due' | 'at-risk' | 'completed';
export type WorkspaceFollowUpEvaluation = 'Critique' | 'Modere' | 'Mineur';
export type WorkspaceRecommendationStatus = 'accepted' | 'not-accepted' | 'in-study';

export interface WorkspaceFollowUpAction {
  actionDetail: string;
  description: string;
  deadline: string;
  endDate: string;
  evaluation: WorkspaceFollowUpEvaluation;
  id: string;
  missionId: string | null;
  owner: string;
  recommendation: string;
  recommendationNumber: string;
  recommendationStatus: WorkspaceRecommendationStatus;
  remarks: string;
  startDate: string;
  status: WorkspaceFollowUpStatus;
  title: string;
}

export interface WorkspaceState {
  archives: AuditMission[];
  followUpActions: WorkspaceFollowUpAction[];
  missions: AuditMission[];
  orientationReportState: unknown | null;
  selectedMissionByUserId: Record<string, string>;
  studyPhaseState: unknown | null;
  version: number;
}

export const WORKSPACE_STORAGE_KEY = 'auditflow-workspace-state-oncf';
export const WORKSPACE_UPDATED_EVENT = 'auditflow:workspace-updated';

const LEGACY_FOLLOW_UP_STORAGE_KEY = 'auditflow-follow-up-oncf';
const LEGACY_ORIENTATION_REPORT_STORAGE_KEY = 'auditflow-orientation-report-oncf';
const LEGACY_STUDY_PHASE_STORAGE_KEY = 'auditflow-study-phase-oncf';

function cloneMission(mission: AuditMission): AuditMission {
  return { ...mission };
}

function createDefaultFollowUpActions(missions: AuditMission[]): WorkspaceFollowUpAction[] {
  return [
    {
      actionDetail: 'Clôturer les écarts sur les organes de freinage et confirmer la mise en œuvre sur le dépôt de Casablanca.',
      description: 'Coordonner le dépôt de Casablanca pour fermer les écarts critiques sur les organes de freinage.',
      deadline: dayjs().add(6, 'day').format('DD/MM/YYYY'),
      endDate: dayjs().add(6, 'day').format('YYYY-MM-DD'),
      evaluation: 'Critique',
      id: 'follow-up-1',
      missionId: missions[0]?.id ?? null,
      owner: 'Rim Diab',
      recommendation: 'Finaliser les actions correctives sur les freins et documenter les contrôles de second niveau.',
      recommendationNumber: 'R1',
      recommendationStatus: 'in-study',
      remarks: 'Suivi quotidien avec le chef de dépôt.',
      startDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      status: 'planning',
      title: 'Clôture des écarts de maintenance freinage',
    },
    {
      actionDetail: 'Régulariser les habilitations et vérifier la piste d’audit des validations GMAO.',
      description: 'Vérifier la mise à jour des habilitations GMAO et la traçabilité des validations techniques.',
      deadline: dayjs().add(3, 'day').format('DD/MM/YYYY'),
      endDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      evaluation: 'Modere',
      id: 'follow-up-2',
      missionId: missions[2]?.id ?? null,
      owner: 'Yassine Sadiki',
      recommendation: 'Mettre à jour les droits d’accès et documenter les revues d’habilitation sur GMAO.',
      recommendationNumber: 'R2',
      recommendationStatus: 'in-study',
      remarks: 'Revue conjointe DSI / maintenance.',
      startDate: dayjs().subtract(4, 'day').format('YYYY-MM-DD'),
      status: 'in-progress',
      title: 'Régularisation des accès GMAO dépôt Rabat',
    },
    {
      actionDetail: 'Préparer les pièces et les jalons du suivi avant l’ouverture du chantier de vérification.',
      description: 'Préparer le dossier de suivi des recommandations sur la supervision des circulations avant la date d’échéance prévue.',
      deadline: 'En continu',
      endDate: dayjs().add(12, 'day').format('YYYY-MM-DD'),
      evaluation: 'Mineur',
      id: 'follow-up-5',
      missionId: missions[1]?.id ?? null,
      owner: 'Nada Benassou',
      recommendation: 'Consolider les livrables de suivi sur les circulations et préparer le reporting de supervision.',
      recommendationNumber: 'R3',
      recommendationStatus: 'in-study',
      remarks: 'Action préventive avant échéance.',
      startDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
      status: 'not-due',
      title: 'Préparation du suivi circulation zone Atlantique',
    },
    {
      actionDetail: 'Suivre les actions correctives sur les passages à niveau prioritaires avec la sûreté ferroviaire.',
      description: 'Suivre les actions correctives sur les passages à niveau à priorité élevée avec la sûreté ferroviaire.',
      deadline: dayjs().subtract(1, 'day').format('DD/MM/YYYY'),
      endDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      evaluation: 'Critique',
      id: 'follow-up-3',
      missionId: missions[1]?.id ?? null,
      owner: 'Hamza Mouddine',
      recommendation: 'Traiter les anomalies de sécurisation et renforcer les contrôles de terrain sur les passages à niveau.',
      recommendationNumber: 'R4',
      recommendationStatus: 'in-study',
      remarks: 'Retard sur la coordination avec les équipes locales.',
      startDate: dayjs().subtract(8, 'day').format('YYYY-MM-DD'),
      status: 'at-risk',
      title: 'Plan d’action passages à niveau sensibles',
    },
    {
      actionDetail: 'Valider la clôture des recommandations sur les pièces critiques de bogies.',
      description: 'Confirmer la clôture des recommandations sur la disponibilité des pièces critiques de bogies.',
      deadline: dayjs().subtract(5, 'day').format('DD/MM/YYYY'),
      endDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
      evaluation: 'Modere',
      id: 'follow-up-4',
      missionId: missions[3]?.id ?? null,
      owner: 'Rim Diab',
      recommendation: 'Confirmer le stock de sécurité et la traçabilité des sorties de pièces critiques.',
      recommendationNumber: 'R5',
      recommendationStatus: 'in-study',
      remarks: 'Action clôturée après vérification physique.',
      startDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
      status: 'completed',
      title: 'Validation du stock de sécurité bogies',
    },
  ];
}

export function createDefaultWorkspaceState(): WorkspaceState {
  const missions = auditMissions.map((mission) => cloneMission(mission));

  return {
    archives: missions.filter((mission) => mission.status === 'Follow-up' || mission.status === 'Closed').map((mission) => cloneMission(mission)),
    followUpActions: createDefaultFollowUpActions(missions),
    missions,
    orientationReportState: null,
    selectedMissionByUserId: {},
    studyPhaseState: null,
    version: 2,
  };
}

function isWorkspaceFollowUpStatus(value: unknown): value is WorkspaceFollowUpStatus {
  return value === 'planning' || value === 'in-progress' || value === 'not-due' || value === 'at-risk' || value === 'completed';
}

function isWorkspaceFollowUpEvaluation(value: unknown): value is WorkspaceFollowUpEvaluation {
  return value === 'Critique' || value === 'Modere' || value === 'Mineur';
}

function isWorkspaceRecommendationStatus(value: unknown): value is WorkspaceRecommendationStatus {
  return value === 'accepted' || value === 'not-accepted' || value === 'in-study';
}

function sanitizeMission(mission: unknown, fallback: AuditMission): AuditMission {
  if (!mission || typeof mission !== 'object') {
    return fallback;
  }

  const source = mission as Partial<AuditMission>;

  return {
    client: typeof source.client === 'string' ? source.client : fallback.client,
    createdBy: typeof source.createdBy === 'string' ? source.createdBy : fallback.createdBy,
    dueDate: typeof source.dueDate === 'string' && source.dueDate ? source.dueDate : fallback.dueDate,
    id: typeof source.id === 'string' && source.id ? source.id : fallback.id,
    nextAction: typeof source.nextAction === 'string' ? source.nextAction : fallback.nextAction,
    objective: typeof source.objective === 'string' ? source.objective : fallback.objective,
    openFindings: Number.isFinite(source.openFindings) ? Number(source.openFindings) : fallback.openFindings,
    owner: typeof source.owner === 'string' ? source.owner : fallback.owner,
    phase: typeof source.phase === 'string' ? source.phase : fallback.phase,
    priority: source.priority === 'High' || source.priority === 'Medium' || source.priority === 'Low' ? source.priority : fallback.priority,
    progress: Number.isFinite(source.progress) ? Number(source.progress) : fallback.progress,
    scope: typeof source.scope === 'string' ? source.scope : fallback.scope,
    site: typeof source.site === 'string' ? source.site : fallback.site,
    status:
      source.status === 'Planning' ||
      source.status === 'Fieldwork' ||
      source.status === 'Review' ||
      source.status === 'Follow-up' ||
      source.status === 'Closed'
        ? source.status
        : fallback.status,
    title: typeof source.title === 'string' ? source.title : fallback.title,
  };
}

function sanitizeFollowUpAction(action: unknown, fallback: WorkspaceFollowUpAction): WorkspaceFollowUpAction {
  if (!action || typeof action !== 'object') {
    return fallback;
  }

  const source = action as Partial<WorkspaceFollowUpAction>;

  return {
    actionDetail: typeof source.actionDetail === 'string' && source.actionDetail.trim() ? source.actionDetail : fallback.actionDetail,
    description: typeof source.description === 'string' && source.description.trim() ? source.description : fallback.description,
    deadline: typeof source.deadline === 'string' && source.deadline.trim() ? source.deadline : fallback.deadline,
    endDate: typeof source.endDate === 'string' && source.endDate ? source.endDate : fallback.endDate,
    evaluation: isWorkspaceFollowUpEvaluation(source.evaluation) ? source.evaluation : fallback.evaluation,
    id: typeof source.id === 'string' && source.id ? source.id : fallback.id,
    missionId: typeof source.missionId === 'string' && source.missionId ? source.missionId : null,
    owner: typeof source.owner === 'string' && source.owner.trim() ? source.owner : fallback.owner,
    recommendation: typeof source.recommendation === 'string' && source.recommendation.trim() ? source.recommendation : fallback.recommendation,
    recommendationNumber:
      typeof source.recommendationNumber === 'string' && source.recommendationNumber.trim() ? source.recommendationNumber : fallback.recommendationNumber,
    recommendationStatus: isWorkspaceRecommendationStatus(source.recommendationStatus) ? source.recommendationStatus : fallback.recommendationStatus,
    remarks: typeof source.remarks === 'string' && source.remarks.trim() ? source.remarks : fallback.remarks,
    startDate: typeof source.startDate === 'string' && source.startDate ? source.startDate : fallback.startDate,
    status: isWorkspaceFollowUpStatus(source.status) ? source.status : fallback.status,
    title: typeof source.title === 'string' && source.title.trim() ? source.title : fallback.title,
  };
}

function readJsonStorage(key: string): unknown | null {
  const raw = globalThis.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function sanitizeWorkspaceState(value: unknown, fallback: WorkspaceState): WorkspaceState {
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const source = value as Partial<WorkspaceState>;
  const selectedMissionByUserId =
    source.selectedMissionByUserId && typeof source.selectedMissionByUserId === 'object'
      ? Object.fromEntries(
          Object.entries(source.selectedMissionByUserId)
            .filter(([userId, missionId]) => typeof userId === 'string' && userId.trim() && typeof missionId === 'string' && missionId.trim())
            .map(([userId, missionId]) => [userId, missionId])
        )
      : fallback.selectedMissionByUserId;

  return {
    archives: Array.isArray(source.archives)
      ? source.archives.map((mission, index) => sanitizeMission(mission, fallback.archives[index] ?? fallback.missions[0] ?? fallback.archives[0]))
      : fallback.archives,
    followUpActions: Array.isArray(source.followUpActions)
      ? source.followUpActions.map((action, index) =>
          sanitizeFollowUpAction(action, fallback.followUpActions[index] ?? fallback.followUpActions[0] ?? createDefaultFollowUpActions(fallback.missions)[0])
        )
      : fallback.followUpActions,
    missions: Array.isArray(source.missions)
      ? source.missions.map((mission, index) => sanitizeMission(mission, fallback.missions[index] ?? fallback.missions[0]))
      : fallback.missions,
    orientationReportState: source.orientationReportState ?? fallback.orientationReportState,
    selectedMissionByUserId,
    studyPhaseState: source.studyPhaseState ?? fallback.studyPhaseState,
    version: typeof source.version === 'number' ? source.version : fallback.version,
  };
}

function migrateLegacyWorkspaceState(): WorkspaceState {
  const fallback = createDefaultWorkspaceState();
  const legacyFollowUpActions = readJsonStorage(LEGACY_FOLLOW_UP_STORAGE_KEY);

  return {
    ...fallback,
    followUpActions: Array.isArray(legacyFollowUpActions)
      ? legacyFollowUpActions.map((action, index) => sanitizeFollowUpAction(action, fallback.followUpActions[index] ?? fallback.followUpActions[0]))
      : fallback.followUpActions,
    orientationReportState: readJsonStorage(LEGACY_ORIENTATION_REPORT_STORAGE_KEY),
    studyPhaseState: readJsonStorage(LEGACY_STUDY_PHASE_STORAGE_KEY),
  };
}

export function loadWorkspaceState(): WorkspaceState {
  if (globalThis.window === undefined) {
    return createDefaultWorkspaceState();
  }

  const rawState = globalThis.localStorage.getItem(WORKSPACE_STORAGE_KEY);

  if (!rawState) {
    const migratedState = migrateLegacyWorkspaceState();
    globalThis.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(migratedState));
    return migratedState;
  }

  try {
    const parsedState = JSON.parse(rawState) as unknown;
    const sanitizedState = sanitizeWorkspaceState(parsedState, createDefaultWorkspaceState());

    globalThis.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(sanitizedState));
    return sanitizedState;
  } catch {
    const fallbackState = migrateLegacyWorkspaceState();
    globalThis.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(fallbackState));
    return fallbackState;
  }
}

export function persistWorkspaceState(nextState: WorkspaceState): WorkspaceState {
  if (globalThis.window === undefined) {
    return nextState;
  }

  globalThis.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(nextState));
  globalThis.dispatchEvent(new CustomEvent<WorkspaceState>(WORKSPACE_UPDATED_EVENT, { detail: nextState }));
  return nextState;
}

export function updateWorkspaceState(updater: (currentState: WorkspaceState) => WorkspaceState): WorkspaceState {
  const currentState = loadWorkspaceState();
  const nextState = updater(currentState);
  return persistWorkspaceState(nextState);
}

function upsertMissionInList(missions: AuditMission[], mission: AuditMission): AuditMission[] {
  const missionIndex = missions.findIndex((item) => item.id === mission.id);

  if (missionIndex === -1) {
    return [cloneMission(mission), ...missions];
  }

  return missions.map((item, index) => (index === missionIndex ? cloneMission(mission) : item));
}

export function saveWorkspaceMission(mission: AuditMission): WorkspaceState {
  return updateWorkspaceState((currentState) => ({
    ...currentState,
    archives: upsertMissionInList(currentState.archives, mission),
    missions: upsertMissionInList(currentState.missions, mission),
  }));
}

export function deleteWorkspaceMission(missionId: string): WorkspaceState {
  return updateWorkspaceState((currentState) => ({
    ...currentState,
    archives: currentState.archives.filter((mission) => mission.id !== missionId),
    followUpActions: currentState.followUpActions.filter((action) => action.missionId !== missionId),
    missions: currentState.missions.filter((mission) => mission.id !== missionId),
    selectedMissionByUserId: Object.fromEntries(
      Object.entries(currentState.selectedMissionByUserId).filter(([, selectedMissionId]) => selectedMissionId !== missionId)
    ),
  }));
}

export function saveWorkspaceFollowUpActions(followUpActions: WorkspaceFollowUpAction[]): WorkspaceState {
  return updateWorkspaceState((currentState) => ({
    ...currentState,
    followUpActions,
  }));
}

export function saveWorkspaceStudyPhaseState(studyPhaseState: unknown): WorkspaceState {
  return updateWorkspaceState((currentState) => ({
    ...currentState,
    studyPhaseState,
  }));
}

export function saveWorkspaceOrientationReportState(orientationReportState: unknown): WorkspaceState {
  return updateWorkspaceState((currentState) => ({
    ...currentState,
    orientationReportState,
  }));
}

export function saveWorkspaceSelectedMission(userId: string, missionId: string | null): WorkspaceState {
  return updateWorkspaceState((currentState) => {
    const nextSelectedMissionByUserId = { ...currentState.selectedMissionByUserId };

    if (missionId) {
      nextSelectedMissionByUserId[userId] = missionId;
    } else {
      delete nextSelectedMissionByUserId[userId];
    }

    return {
      ...currentState,
      selectedMissionByUserId: nextSelectedMissionByUserId,
    };
  });
}
