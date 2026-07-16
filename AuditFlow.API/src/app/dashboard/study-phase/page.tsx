'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ArrowsInSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsInSimple';
import { ArrowsOutSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { DotsThreeOutlineVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeOutlineVertical';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { FloppyDiskIcon } from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';

import { MissionRequiredAccess } from '@/components/dashboard/mission-required-access';
import { useNotifications } from '@/hooks/use-notifications';
import { KnowledgeReferencePanel } from '@/components/dashboard/study-phase/knowledge-reference-panel';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { getSelectedMissionIdForUser } from '@/lib/missions/selection';
import { loadWorkspaceState, saveWorkspaceStudyPhaseState } from '@/lib/workspace-storage';
import verificationProgramRaw from '../../../../programme de verification.json';

type TabKey = 'knowledge' | 'risk-listing' | 'final-talk' | 'audit-planning' | 'orientation-report';
type RiskImpact = 'Low' | 'Medium' | 'High';
type RiskPriority = 'Medium' | 'High' | 'Critical';
type FinalRiskAssessment = 'Critique' | 'Moderee' | 'Mineure';
type RiskDecisionStatus = 'Brouillon' | 'Accepte' | 'Refuse';
type FullscreenSection = 'audit-planning' | 'final-talk' | 'risk-listing' | null;
type OrientationUrgency = 'Faible' | 'Moyenne' | 'Elevee';
type TestStatus = 'Ouvert' | 'En cours' | 'Cloture';
type AuditAuditor = 'Rim Diab' | 'Yassine Sadiki' | 'Nada Benassou' | 'Hamza Mouddine';

interface CardDef {
  category: string;
  detail: string;
  id: string;
  summary: string;
  title: string;
}

interface DocItem {
  addedAt: string;
  id: string;
  name: string;
  size: number;
}

interface NoteItem {
  author: string;
  content: string;
  createdAt: string;
  id: string;
}

interface OrientationReportData {
  auditeeConcerns: string;
  characteristics: string;
  entity: string;
  exclusions: string;
  expectedBenefits: string;
  metrics: string;
  missionLabel: string;
  missionLead: string;
  missionReference: string;
  missionSupervisor: string;
  objective: string;
  objectiveRows: OrientationObjectiveRow[];
  reportDate: string;
  scope: string[];
  startedAt: string;
  urgency: OrientationUrgency | '';
  version: string;
  writer: string;
}

interface OrientationObjectiveRow {
  controlCriteria: string;
  domain: string;
  id: string;
  objective: string;
  risk: string;
}

interface FinalTalkRow {
  auditableObject: string;
  auditableSubObject: string;
  code: string;
  controlMeasure: string;
  id: string;
  impact: RiskImpact;
  operationalControlObjective: string;
  probability: number;
  riskAssessment: FinalRiskAssessment;
  title: string;
}

interface FinalTalkDraft {
  auditableObject: string;
  auditableSubObject: string;
  code: string;
  controlMeasure: string;
  impact: RiskImpact | '';
  operationalControlObjective: string;
  riskAssessment: FinalRiskAssessment | '';
  title: string;
}

interface RiskDraft {
  auditableObject: string;
  auditableSubObject: string;
  code: string;
  controlMeasure: string;
  impact: RiskImpact | '';
  operationalControlObjective: string;
  risk: string;
  riskAssessment: FinalRiskAssessment | '';
}

interface AuditTestRow {
  action: string;
  auditor: AuditAuditor;
  comments: string;
  controlDescription: string;
  endDate: string;
  id: string;
  isNonConformity: boolean;
  methodology: string;
  objective: string;
  startDate: string;
  status: TestStatus;
  testNumber: string;
}

interface AuditTestDraft {
  action: string;
  auditor: AuditAuditor | '';
  comments: string;
  controlDescription: string;
  endDate: string;
  isNonConformity: boolean;
  methodology: string;
  objective: string;
  startDate: string;
  status: TestStatus | '';
  testNumber: string;
}

interface VerificationProgramItem {
  methodologie: string;
  mission_id: string;
  objectif: string;
  risque: string;
  tache: string;
}

interface RiskRow {
  auditableObject: string;
  auditableSubObject: string;
  code: string;
  controlMeasure: string;
  decisionStatus: RiskDecisionStatus;
  id: string;
  impact: RiskImpact;
  operationalControlObjective: string;
  priority: RiskPriority;
  probability: number;
  risk: string;
  riskAssessment: FinalRiskAssessment;
}

interface TabDef {
  cards: CardDef[];
  description: string;
  documents: Omit<DocItem, 'id'>[];
  key: TabKey;
  label: string;
}

interface TabState {
  auditTests: AuditTestRow[];
  documents: DocItem[];
  finalTalkRows: FinalTalkRow[];
  isGenerated: boolean;
  isValidated: boolean;
  notes: NoteItem[];
  orientationReport: OrientationReportData;
  riskRows: RiskRow[];
  savedAt: string | null;
  validatedAt: string | null;
  validatedBy: string | null;
}

const DEFAULT_TABLE_PAGE_SIZE = 5;
const FULLSCREEN_TABLE_PAGE_SIZE = 10;

type StudyState = Record<TabKey, TabState>;

const aiLabel = 'Généré par IA';
const probabilityLevels = [1, 2, 3, 4, 5] as const;
const impactLevels = ['Low', 'Medium', 'High'] as const;
const matrixImpactLevels = ['High', 'Medium', 'Low'] as const;
const finalRiskAssessments = ['Critique', 'Moderee', 'Mineure'] as const;
const testStatuses = ['Ouvert', 'En cours', 'Cloture'] as const;
const auditAuditors = ['Rim Diab', 'Yassine Sadiki', 'Nada Benassou', 'Hamza Mouddine'] as const;
const orientationEntities = [
  'Direction Materiel',
  'Direction Infrastructure',
  'Pole Voyageurs',
  'Direction Securite & Surete',
  'Direction Systemes d Information',
] as const;
const orientationUrgencyOptions = ['Faible', 'Moyenne', 'Elevee'] as const;
const orientationScopeOptions = [
  'Depots et ateliers',
  'Maintenance preventive',
  'Pièces de sécurité',
  'Planification des immobilisations',
  'GMAO et données techniques',
] as const;

const impactTextColor = {
  High: '#CE2626',
  Low: '#438A70',
  Medium: '#D97A2B',
} satisfies Record<RiskImpact, string>;

const priorityTextColor = {
  Critical: '#438A70',
  High: '#CE2626',
  Medium: '#D97A2B',
} satisfies Record<RiskPriority, string>;

const priorityTone = {
  Critical: { background: '#86EFAC', text: priorityTextColor.Critical },
  High: { background: '#FCA5A5', text: priorityTextColor.High },
  Medium: { background: '#FFC570', text: priorityTextColor.Medium },
} satisfies Record<RiskPriority, { background: string; text: string }>;

const impactFieldBackground = {
  High: '#FCA5A5',
  Low: '#86EFAC',
  Medium: '#FFC570',
} satisfies Record<RiskImpact, string>;

const c = (id: string, title: string, category: string, summary: string, detail: string): CardDef => ({
  category,
  detail,
  id,
  summary,
  title,
});

const d = (addedAt: string, name: string, size: number) => ({ addedAt, name, size });
const verificationProgram = verificationProgramRaw as VerificationProgramItem[];

const createOrientationObjectiveRow = (
  id: string,
  domain: string,
  objective: string,
  controlCriteria: string,
  risk: string
): OrientationObjectiveRow => ({ controlCriteria, domain, id, objective, risk });

const createAuditTestRow = (
  id: string,
  testNumber: string,
  controlDescription: string,
  objective: string,
  methodology: string,
  auditor: AuditAuditor,
  status: TestStatus,
  startDate: string,
  endDate: string,
  comments: string,
  action: string,
  isNonConformity = false
): AuditTestRow => ({
  action,
  auditor,
  comments,
  controlDescription,
  endDate,
  id,
  isNonConformity,
  methodology,
  objective,
  startDate,
  status,
  testNumber,
});

function formatAuditDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addProgramDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function normalizeVerificationText(value: string | undefined, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized || fallback;
}

function getVerificationTestStatus(index: number): TestStatus {
  if (index < 5) {
    return 'Cloture';
  }

  if (index < 11) {
    return 'En cours';
  }

  return 'Ouvert';
}

function getVerificationTestStartDate(index: number, status: TestStatus): Date {
  if (status === 'Cloture') {
    return addProgramDays(new Date('2026-05-05T00:00:00'), index * 2);
  }

  if (status === 'En cours') {
    return addProgramDays(new Date('2026-06-02T00:00:00'), (index - 5) * 2);
  }

  return addProgramDays(new Date('2026-06-16T00:00:00'), (index - 11) * 2);
}

function createVerificationProgramAuditTests(): AuditTestRow[] {
  return verificationProgram.map((item, index) => {
    const status = getVerificationTestStatus(index);
    const startDate = getVerificationTestStartDate(index, status);
    const endDate = addProgramDays(startDate, status === 'Ouvert' ? 5 : 4);
    const missionReference = normalizeVerificationText(item.mission_id, 'MISSION-RECLAM-2026-001');
    const riskSummary = normalizeVerificationText(item.risque, 'Risque a preciser');

    return createAuditTestRow(
      `test-${index + 1}`,
      `TV-${String(index + 1).padStart(3, '0')}`,
      normalizeVerificationText(item.tache, 'Tache a documenter'),
      normalizeVerificationText(item.objectif, 'Objectif a completer'),
      normalizeVerificationText(item.methodologie, 'Methodologie a completer'),
      auditAuditors[index % auditAuditors.length],
      status,
      formatAuditDateValue(startDate),
      formatAuditDateValue(endDate),
      `${riskSummary} | Mission : ${missionReference}`,
      `Tracer le resultat du test et formaliser les suites de controle pour ${missionReference}.`,
      status !== 'Cloture'
    );
  });
}

const createRiskRow = (
  id: string,
  code: string,
  auditableObject: string,
  auditableSubObject: string,
  risk: string,
  operationalControlObjective: string,
  riskAssessment: FinalRiskAssessment,
  controlMeasure: string,
  decisionStatus: RiskDecisionStatus = 'Brouillon'
): RiskRow => {
  const { impact, probability } = getFinalRiskAssessmentProfile(riskAssessment);

  return {
    auditableObject,
    auditableSubObject,
    code,
    controlMeasure,
    decisionStatus,
    id,
    impact,
    operationalControlObjective,
    priority: derivePriority(impact, probability),
    probability,
    risk,
    riskAssessment,
  };
};
const defaultRiskRows = [
  createRiskRow(
    'risk-1',
    'LR-101',
    'Maintenance preventive',
    'Rames a forte rotation',
    'Retard de maintenance preventive sur les rames a forte rotation',
    'Verifier que les visites preventives critiques sont planifiees et realisees sans report non justifie.',
    'Critique',
    'Plan de maintenance valide, suivi GMAO et visa depot sur les reports.'
  ),
  createRiskRow(
    'risk-2',
    'LR-112',
    'Gestion des pieces critiques',
    'Organes de freinage',
    'Traçabilité incomplète des pièces de sécurité remplacées en dépôt',
    'Confirmer la tracabilite des organes de freinage remplaces et la presence des preuves de pose.',
    'Moderee',
    'Rapprochement stock systeme / stock physique et fiche atelier avec numero de lot.'
  ),
  createRiskRow(
    'risk-3',
    'LR-129',
    'Systemes d information',
    'Habilitations GMAO',
    'Habilitations trop larges dans la GMAO de maintenance',
    'S’assurer que les accès sensibles sont limités aux rôles autorisés et revus périodiquement.',
    'Critique',
    'Revue periodique des droits sensibles et journalisation des profils techniques.'
  ),
];

const defaultFinalTalkRows: FinalTalkRow[] = [
  {
    auditableObject: 'Maintenance preventive',
    auditableSubObject: 'Rames a forte rotation',
    code: 'MR-204',
    controlMeasure: 'Plan de maintenance valide, suivi GMAO et visa depot sur les reports.',
    id: 'final-risk-1',
    ...getFinalRiskAssessmentProfile('Critique'),
    operationalControlObjective: 'Verifier que les visites preventives critiques sont programmees, executees et justifiees sans rupture de disponibilite.',
    riskAssessment: 'Critique',
    title: 'Retard de maintenance sur rame a forte rotation',
  },
  {
    auditableObject: 'Gestion des pieces critiques',
    auditableSubObject: 'Organes de freinage',
    code: 'MR-112',
    controlMeasure: 'Rapprochement stock systeme / stock physique et fiche atelier avec numero de lot.',
    id: 'final-risk-2',
    ...getFinalRiskAssessmentProfile('Moderee'),
    operationalControlObjective: 'Confirmer la tracabilite complete des pieces critiques remplacees et la fiabilite des preuves de pose.',
    riskAssessment: 'Moderee',
    title: 'Tracabilite insuffisante des organes de freinage',
  },
  {
    auditableObject: 'Systemes d information',
    auditableSubObject: 'Habilitations GMAO',
    code: 'MR-089',
    controlMeasure: 'Revue periodique des droits sensibles et journalisation des profils techniques.',
    id: 'final-risk-3',
    ...getFinalRiskAssessmentProfile('Critique'),
    operationalControlObjective: 'S’assurer que les accès à la GMAO sont limités aux rôles habilités et régulièrement revus.',
    riskAssessment: 'Critique',
    title: 'Habilitations GMAO non revues periodiquement',
  },
  {
    auditableObject: 'Coordination opérationnelle',
    auditableSubObject: 'Planification depot / exploitation',
    code: 'MR-301',
    controlMeasure: 'Comite hebdomadaire depot-exploitation et tableau de suivi des immobilisations.',
    id: 'final-risk-4',
    ...getFinalRiskAssessmentProfile('Moderee'),
    operationalControlObjective: 'Verifier la coherence entre les immobilisations programmees et les besoins du plan de transport.',
    riskAssessment: 'Moderee',
    title: 'Planification depot et exploitation non synchronisee',
  },
  {
    auditableObject: 'Documentation technique',
    auditableSubObject: 'Dossiers de maintenance par rame',
    code: 'MR-410',
    controlMeasure: 'Checklist documentaire obligatoire avant clôture du dossier atelier.',
    id: 'final-risk-5',
    ...getFinalRiskAssessmentProfile('Mineure'),
    operationalControlObjective: 'Vérifier la présence et la cohérence des documents techniques attachés à chaque intervention clôturée.',
    riskAssessment: 'Mineure',
    title: 'Dossiers techniques incomplets lors des transferts atelier',
  },
];

const legacyDefaultAuditTests = [
  createAuditTestRow(
    'test-1',
    'TV-001',
    'Revue de la planification des visites preventives sur les rames navette Casablanca - Kenitra',
    'Confirmer le respect du plan de maintenance et la justification des reports critiques.',
    'Analyse documentaire, echantillonnage de 12 ordres de travail et entretien avec le chef de depot.',
    'Rim Diab',
    'Cloture',
    '2026-04-14',
    '2026-04-18',
    'Deux ecarts de tracabilite releves sur les reports de maintenance preventive.',
    'Formaliser un visa systematique du chef de depot pour tout report critique.',
    true
  ),
  createAuditTestRow(
    'test-2',
    'TV-002',
    'Verification de la tracabilite des pieces de freinage remplacees en atelier',
    'S assurer que chaque piece critique remplacee dispose d une preuve de pose et d un suivi lot / serie.',
    'Controle sur site, rapprochement stock systeme / stock physique et revue de 15 dossiers techniques.',
    'Yassine Sadiki',
    'En cours',
    '2026-04-17',
    '2026-04-24',
    'L inventaire physique est coherent, mais plusieurs fiches atelier restent incompletes.',
    'Compléter les dossiers techniques et renforcer le contrôle de second niveau.',
    true
  ),
  createAuditTestRow(
    'test-3',
    'TV-003',
    'Test des habilitations dans la GMAO de maintenance',
    'Vérifier que les accès sensibles sont accordés selon les rôles et revus périodiquement.',
    'Extraction des profils, revue des droits, entretiens DSI / maintenance et test d un echantillon d utilisateurs.',
    'Nada Benassou',
    'Ouvert',
    '2026-04-22',
    '2026-04-28',
    'Travaux non demarres ; extraction des habilitations en attente de validation DSI.',
    'Demander la liste consolidee des profils sensibles avant lancement du test.'
  ),
  createAuditTestRow(
    'test-4',
    'TV-004',
    'Contrôle des dispositifs de sécurité voyageurs sur les gares à forte affluence',
    'Mesurer la conformité des contrôles de sécurité voyageurs et du traitement des anomalies terrain.',
    'Observation terrain, revue des registres d’incidents et entretien avec les responsables sécurité des gares.',
    'Hamza Mouddine',
    'En cours',
    '2026-04-20',
    '2026-04-27',
    'Le dispositif est globalement opérationnel ; une anomalie mineure reste ouverte sur la formalisation des rondes.',
    'Mettre a jour la check-list de ronde et consolider les preuves de supervision.'
  ),
];

const defaultAuditTests = createVerificationProgramAuditTests();

const aiRiskRecommendations = [
  createRiskRow(
    'ai-risk-1',
    'LR-201',
    'Materiel roulant',
    'Interventions urgentes',
    'Journalisation incomplète des interventions urgentes sur le matériel roulant',
    'Vérifier que chaque intervention urgente dispose d’une preuve, d’une autorisation et d’une clôture technique complète.',
    'Critique',
    'Journal des interventions, visa hierarchique et rapprochement avec les ordres de travail.'
  ),
  createRiskRow(
    'ai-risk-2',
    'LR-202',
    'Pieces critiques',
    'Stocks depot',
    'Ecarts entre stock physique et stock systeme des pieces critiques',
    'Confirmer la fiabilité des inventaires et des mouvements de pièces de sécurité.',
    'Moderee',
    'Inventaire tournant, rapprochement mensuel et contrôle de second niveau.'
  ),
  createRiskRow(
    'ai-risk-3',
    'LR-203',
    'Securite voyageurs',
    'Visites de sécurité',
    'Retard de traitement des anomalies relevées lors des visites de sécurité',
    'S assurer que les anomalies terrain sont traitees dans les delais et escaladees selon leur criticite.',
    'Critique',
    'Registre des anomalies, suivi des delais et revue hebdomadaire des actions ouvertes.'
  ),
  createRiskRow(
    'ai-risk-4',
    'LR-204',
    'Sous-traitance',
    'Prestataires maintenance',
    'Absence de revue periodique des sous-traitants de maintenance',
    'Vérifier que les prestataires font l’objet d’une évaluation régulière et de contrôles documentés.',
    'Moderee',
    'Revues de performance, évaluation des incidents et vérification des habilitations contractuelles.'
  ),
  createRiskRow(
    'ai-risk-5',
    'LR-205',
    'Exploitation',
    'Immobilisations programmees',
    'Planification insuffisante des immobilisations programmees',
    'Verifier la coordination entre besoins d exploitation et immobilisations de maintenance.',
    'Moderee',
    'Comite depot-exploitation, planning partage et suivi des arbitrages.'
  ),
];

const tabs: TabDef[] = [
  {
    key: 'knowledge',
    label: 'Référentiel de connaissance',
    description: '',
    documents: [
      d('2026-04-12T09:15:00.000Z', 'Procedure_audit_interne_ONCF_v4.pdf', 2_480_000),
      d('2026-04-14T11:30:00.000Z', 'Cartographie_maintenance_materiel_roulant.xlsx', 1_840_000),
    ],
    cards: [
      c('synthese', 'Définition du contexte', 'Synthèse', 'Le périmètre couvre la maintenance préventive, la disponibilité des rames et la traçabilité des interventions critiques.', 'Cette synthèse replace la mission dans le contexte ONCF : disponibilité du matériel, pression d’exploitation et attentes du sponsor audit interne.'),
      c('documents', 'Causes', 'Périmètre', 'Les causes racines les plus probables portent sur la planification, la documentation atelier et les pièces de sécurité.', 'Ce cadre met en relation la charge d exploitation, les stocks critiques, la qualite des dossiers techniques et les contraintes de depot.'),
      c('parties', 'Incidents historiques', 'Parties prenantes', 'Les incidents passés montrent que les immobilisations longues et les reports de maintenance dégradent la régularité et la sécurité.', 'Le contenu détaillé relie les incidents matériel, les retards de remise en service et les alertes techniques remontées par les équipes terrain.'),
      c('hypotheses', 'Benchmarking', 'Hypothèses', 'Le benchmark compare les dépôts ONCF, les taux de disponibilité et les pratiques de revue des organes de sécurité.', 'Ce cadre aide a situer les pratiques observees dans les ateliers par rapport aux standards internes et aux attentes de performance.'),
      c('axes', 'Contrôles', 'Axes', 'Les contrôles attendus concernent la validation des ordres de travail, la revue des habilitations GMAO et la surveillance des pièces critiques.', 'Cette fiche transforme les enjeux de maintenance en points de contrôle auditables directement exploitables pendant la vérification.'),
      c('vigilance', 'Réglementations', 'Vigilance', 'Les références à couvrir incluent les instructions ONCF de maintenance, les consignes de sécurité et les exigences de traçabilité.', 'Le detail recense les textes internes, les consignes d atelier et les obligations de preuve qui structurent la mission.'),
      c('livrables', 'Cas réels', 'Livrables', 'Les cas réels retenus portent sur une rame immobilisée, une pièce de freinage critique et un retard de clôture d’intervention.', 'Ce cadre permet d’illustrer les constats avec des situations terrain réalistes qui parlent aux responsables matériel et exploitation.'),
    ],
  },
  {
    key: 'risk-listing',
    label: 'Listing des risques',
    description: 'Organise les risques liés à la maintenance ferroviaire, aux organes de sécurité et aux outils critiques de pilotage atelier.',
    documents: [
      d('2026-04-10T08:20:00.000Z', 'Matrice_risques_maintenance_rames_2026.xlsx', 2_150_000),
      d('2026-04-16T13:40:00.000Z', 'Historique_anomalies_securite_materiel.docx', 910_000),
    ],
    cards: [],
  },
  {
    key: 'final-talk',
    label: 'TaRi final',
    description: 'Prépare les messages, arbitrages et engagements attendus lors de la restitution finale de la mission maintenance ONCF.',
    documents: [
      d('2026-04-08T10:00:00.000Z', 'Compte_rendu_comite_materiel_precedent.pdf', 1_260_000),
      d('2026-04-17T16:05:00.000Z', 'Synthèse_incidents_techniques_T1.docx', 760_000),
    ],
    cards: [
      c('f1', 'Message d’ouverture', 'Message', 'Le message d’ouverture doit relier sécurité, disponibilité des rames et contraintes d’exploitation ONCF.', 'Cette ouverture installe un cadre clair entre audit interne, direction matériel et exploitation avant la restitution des constats.'),
      c('f2', 'Messages cles', 'Messages', 'Les messages majeurs portent sur la tracabilite des interventions, les pieces critiques et la coordination depot / exploitation.', 'Le contenu detaille condense les messages que la direction doit retenir pour agir rapidement sur les causes racines.'),
      c('f3', 'Arbitrages attendus', 'Arbitrages', 'Les arbitrages attendus concernent les priorites de remediation, les ressources atelier et le calendrier de mise en oeuvre.', 'Cette fiche recense les decisions attendues afin d obtenir des engagements concrets en sortie de reunion.'),
      c('f4', 'Questions sensibles', 'Questions', 'Les questions sensibles porteront sur la matérialité des retards de maintenance et l’exposition sur les organes de sécurité.', 'Le détail prépare des réponses factuelles et argumentées, directement réutilisables pendant la restitution.'),
      c('f5', 'Risques de communication', 'Communication', 'Le principal risque est de banaliser des faiblesses structurelles en simples contraintes d’exploitation.', 'Ce cadre aide à calibrer le ton et la séquence de restitution selon les audiences ONCF.'),
      c('f6', 'Engagements proposes', 'Engagements', 'Les engagements proposés doivent rester réalistes, tracés et soutenables pour les dépôts concernés.', 'Cette fiche structure les prochaines étapes, les livrables attendus et les contrôles à réexécuter après la réunion.'),
      c('f7', 'Suivi post-talk', 'Suivi', 'Un suivi immédiat des actions doit être mis en place avec la direction matériel et les responsables dépôt.', 'Le contenu détaillé organise le post-restitution, les délais et les responsables associés.'),
    ],
  },
  {
    key: 'audit-planning',
    label: 'Planification & tests',
    description:
      'Organise les contrôles d’audit, suit leur avancement, identifie les anomalies et mesure le niveau de conformité de la mission ONCF.',
    documents: [
      d('2026-04-20T08:30:00.000Z', 'Programme_verification_materiel_roulant.xlsx', 1_960_000),
      d('2026-04-21T14:10:00.000Z', 'Planning_tests_terrain_ONCF.pdf', 1_180_000),
    ],
    cards: [],
  },
  {
    key: 'orientation-report',
    label: 'Rapport d’orientation',
    description: 'Structure le rapport d’orientation de la mission ONCF avec le périmètre recommandé et les décisions à confirmer avant vérification.',
    documents: [
      d('2026-04-09T14:15:00.000Z', 'Modele_note_orientation_ONCF.pptx', 3_320_000),
      d('2026-04-18T09:50:00.000Z', 'Plan_charge_depots_2026.xlsx', 1_430_000),
    ],
    cards: [
      c('o1', 'Synthèse d orientation', 'Orientation', 'Le rapport positionne la mission sur la maintenance préventive, la disponibilité des rames et la maîtrise des interventions critiques.', 'Cette synthèse ouvre le rapport avec une lecture claire des enjeux ONCF et des priorités de vérification à confirmer.'),
      c('o2', 'Périmètre recommande', 'Périmètre', 'Le périmètre recommandé cible les dépôts prioritaires, la GMAO et les pièces de sécurité les plus sensibles.', 'Le détail explique ce qui est inclus, différé ou hors mission afin d’éviter toute ambiguïté au lancement.'),
      c('o3', 'Planning cible', 'Planning', 'La séquence attendue comprend cadrage atelier, collecte documentaire, tests terrain et restitution au comité matériel.', 'Cette fiche donne de la visibilité sur le rythme de mission, les jalons et les livraisons attendues.'),
      c('o4', 'Sortie attendue', 'Sortie', 'La mission doit produire des constats clairs sur la maintenance, les données techniques et les responsabilités de supervision.', 'Le contenu détaillé stabilise la valeur attendue de la mission et le niveau de détail de la restitution finale.'),
      c('o5', 'Ressources necessaires', 'Ressources', 'Le rapport doit mobiliser les responsables depot, les referents GMAO et les interlocuteurs exploitation.', 'Cette fiche cadre les besoins humains, documentaires et techniques pour la suite des travaux.'),
      c('o6', 'Facteurs de reussite', 'Reussite', 'La disponibilite des historiques d intervention et la qualite des preuves atelier restent les leviers majeurs.', 'Le detail relie chaque facteur de reussite a une attente concrete pour fluidifier l execution des travaux.'),
      c('o7', 'Décisions à confirmer', 'Décisions', 'Les confirmations finales portent sur les sites cibles, les sponsors métier et le calendrier de vérification.', 'Ce cadre conclut le rapport en listant les arbitrages exacts à valider avant passage à la phase suivante.'),
    ],
  },
];

function clampProbability(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(5, Math.max(1, Math.round(value)));
}

function derivePriority(impact: RiskImpact, probability: number): RiskPriority {
  const score = { High: 3, Low: 1, Medium: 2 }[impact] + clampProbability(probability);

  if (score >= 7) {
    return 'Critical';
  }

  if (score >= 5) {
    return 'High';
  }

  return 'Medium';
}

function getFinalRiskAssessmentProfile(riskAssessment: FinalRiskAssessment): { impact: RiskImpact; probability: number } {
  if (riskAssessment === 'Critique') {
    return { impact: 'High', probability: 5 };
  }

  if (riskAssessment === 'Moderee') {
    return { impact: 'Medium', probability: 3 };
  }

  return { impact: 'Low', probability: 2 };
}

function deriveFinalRiskAssessment(impact: RiskImpact): FinalRiskAssessment {
  if (impact === 'High') {
    return 'Critique';
  }

  if (impact === 'Medium') {
    return 'Moderee';
  }

  return 'Mineure';
}

function getImpactLabel(impact: RiskImpact): string {
  if (impact === 'High') {
    return 'Eleve';
  }

  if (impact === 'Medium') {
    return 'Moyen';
  }

  return 'Faible';
}

function isRiskImpact(value: string): value is RiskImpact {
  return impactLevels.includes(value as RiskImpact);
}

function isFinalRiskAssessment(value: string): value is FinalRiskAssessment {
  return finalRiskAssessments.includes(value as FinalRiskAssessment);
}

function isTestStatus(value: string): value is TestStatus {
  return testStatuses.includes(value as TestStatus);
}

function isAuditAuditor(value: string): value is AuditAuditor {
  return auditAuditors.includes(value as AuditAuditor);
}

function createDefaultRiskRows(): RiskRow[] {
  return defaultRiskRows.map((row) => ({ ...row }));
}

function createDefaultFinalTalkRows(): FinalTalkRow[] {
  return defaultFinalTalkRows.map((row) => ({ ...row }));
}

function createDefaultFinalTalkDraft(): FinalTalkDraft {
  return {
    auditableObject: '',
    auditableSubObject: '',
    code: '',
    controlMeasure: '',
    impact: '',
    operationalControlObjective: '',
    riskAssessment: '',
    title: '',
  };
}

function createFinalTalkDraftFromRow(row: FinalTalkRow): FinalTalkDraft {
  return {
    auditableObject: row.auditableObject,
    auditableSubObject: row.auditableSubObject,
    code: row.code,
    controlMeasure: row.controlMeasure,
    impact: row.impact,
    operationalControlObjective: row.operationalControlObjective,
    riskAssessment: row.riskAssessment,
    title: row.title,
  };
}

function createDefaultRiskDraft(): RiskDraft {
  return {
    auditableObject: '',
    auditableSubObject: '',
    code: '',
    controlMeasure: '',
    impact: '',
    operationalControlObjective: '',
    risk: '',
    riskAssessment: '',
  };
}

function createRiskDraftFromRow(row: RiskRow): RiskDraft {
  return {
    auditableObject: row.auditableObject,
    auditableSubObject: row.auditableSubObject,
    code: row.code,
    controlMeasure: row.controlMeasure,
    impact: row.impact,
    operationalControlObjective: row.operationalControlObjective,
    risk: row.risk,
    riskAssessment: row.riskAssessment,
  };
}

function createDefaultAuditTests(): AuditTestRow[] {
  return defaultAuditTests.map((row) => ({ ...row }));
}

function createDefaultAuditTestDraft(): AuditTestDraft {
  return {
    action: '',
    auditor: '',
    comments: '',
    controlDescription: '',
    endDate: '',
    isNonConformity: false,
    methodology: '',
    objective: '',
    startDate: '',
    status: '',
    testNumber: '',
  };
}

function createAuditTestDraftFromRow(row: AuditTestRow): AuditTestDraft {
  return {
    action: row.action,
    auditor: row.auditor,
    comments: row.comments,
    controlDescription: row.controlDescription,
    endDate: row.endDate,
    isNonConformity: row.isNonConformity,
    methodology: row.methodology,
    objective: row.objective,
    startDate: row.startDate,
    status: row.status,
    testNumber: row.testNumber,
  };
}

function createDefaultOrientationReport(): OrientationReportData {
  return {
    auditeeConcerns:
      'Les responsables dépôt attendent une vision claire sur les interventions prioritaires, les pièces de sécurité et les contraintes de remise en service.',
    characteristics:
      'Mission centrée sur les dépôts prioritaires, la GMAO, les organes de sécurité et la coordination entre maintenance et exploitation.',
    entity: '',
    exclusions:
      'Les investissements lourds hors maintenance courante et les projets de renouvellement de flotte hors périmètre ne sont pas couverts par cette mission.',
    expectedBenefits:
      'Ameliorer la disponibilite des rames, fiabiliser la tracabilite des interventions et reduire les retards causes par des immobilisations non maitrisees.',
    metrics:
      'Analyse des immobilisations longues, du taux de disponibilite des rames, des reports d intervention et des ecarts de stock sur les pieces critiques.',
    missionLabel: 'Audit maintenance matériel roulant',
    missionLead: 'Rim Diab',
    missionReference: 'ONCF-AI-2026-001',
    missionSupervisor: 'Responsable Departement Audit Interne',
    objective:
      'Préoccupation du demandeur : confirmer la maîtrise de la maintenance préventive, la traçabilité des organes de sécurité et la coordination dépôt / exploitation.',
    objectiveRows: [
      createOrientationObjectiveRow(
        'orientation-row-1',
        'Maintenance preventive des rames',
        'Vérifier la planification, l’exécution et la clôture des interventions critiques.',
        'Ordres de travail validés, opérations tracées, supervision dépôt et respect des échéances de maintenance.',
        'Immobilisation prolongée de rame et dégradation de la disponibilité matériel.'
      ),
      createOrientationObjectiveRow(
        'orientation-row-2',
        'GMAO et données techniques',
        'Confirmer la fiabilite des historiques, des habilitations et des mises a jour techniques.',
        'Acces revus periodiquement, journalisation disponible, dossiers techniques complets et synchronises.',
        'Décision maintenance faussée, accès non maîtrisés et preuve d’intervention insuffisante.'
      ),
      createOrientationObjectiveRow(
        'orientation-row-3',
        'Pièces de sécurité',
        'Vérifier la gestion des stocks, des remplacements et des contrôles de second niveau.',
        'Correspondance stock physique / systeme, preuve de pose et validation des pieces critiques remplacees.',
        'Rupture de pièces, intervention non conforme et risque sur la sécurité d’exploitation.'
      ),
    ],
    reportDate: '2026-04-22',
    scope: [],
    startedAt: new Date().toISOString(),
    urgency: '',
    version: 'V1',
    writer: 'Equipe Audit Interne ONCF',
  };
}

function createTabState(tab: TabDef): TabState {
  return {
    auditTests: tab.key === 'audit-planning' ? createDefaultAuditTests() : [],
    documents: tab.documents.map((document, index) => ({ ...document, id: `${tab.key}-${index}` })),
    finalTalkRows: tab.key === 'final-talk' ? createDefaultFinalTalkRows() : [],
    isGenerated: false,
    isValidated: false,
    notes: [],
    orientationReport: tab.key === 'orientation-report' ? createDefaultOrientationReport() : createDefaultOrientationReport(),
    riskRows: tab.key === 'risk-listing' ? createDefaultRiskRows() : [],
    savedAt: null,
    validatedAt: null,
    validatedBy: null,
  };
}

const createState = (): StudyState =>
  tabs.reduce(
    (accumulator, tab) => {
      accumulator[tab.key] = createTabState(tab);
      return accumulator;
    },
    {} as StudyState
  );

function shouldRefreshAuditPlanningDefaults(rows: AuditTestRow[] | undefined): boolean {
  if (!Array.isArray(rows) || rows.length === 0) {
    return false;
  }

  return rows.some((row) => {
    const description = typeof row.controlDescription === 'string' ? row.controlDescription.toLowerCase() : '';

    return description.includes('maintenance') || description.includes('gmao') || description.includes('gares');
  });
}

const loadState = (): StudyState => {
  const base = createState();
  const raw = loadWorkspaceState().studyPhaseState;

  if (!raw || typeof raw !== 'object') {
    return base;
  }

  try {
    const parsed = raw as Partial<StudyState>;

    return tabs.reduce(
      (accumulator, tab) => {
        const parsedTab = parsed[tab.key];
        const shouldUseRefreshedAuditPlanningDefaults =
          tab.key === 'audit-planning' && shouldRefreshAuditPlanningDefaults(parsedTab?.auditTests as AuditTestRow[] | undefined);

        accumulator[tab.key] = {
          auditTests: Array.isArray(parsedTab?.auditTests) && !shouldUseRefreshedAuditPlanningDefaults
            ? (parsedTab.auditTests as AuditTestRow[]).map((row, index) => ({
                action: typeof row.action === 'string' ? row.action : 'Action corrective a definir',
                auditor: isAuditAuditor(row.auditor) ? row.auditor : base[tab.key].auditTests[index]?.auditor ?? 'Rim Diab',
                comments: typeof row.comments === 'string' ? row.comments : 'Commentaires a completer',
                controlDescription:
                  typeof row.controlDescription === 'string' && row.controlDescription.trim()
                    ? row.controlDescription
                    : base[tab.key].auditTests[index]?.controlDescription ?? 'Tache a documenter',
                endDate:
                  typeof row.endDate === 'string' && row.endDate.trim()
                    ? row.endDate
                    : base[tab.key].auditTests[index]?.endDate ?? '2026-04-25',
                id: typeof row.id === 'string' ? row.id : `${tab.key}-test-${index}`,
                isNonConformity: Boolean(row.isNonConformity),
                methodology:
                  typeof row.methodology === 'string' && row.methodology.trim()
                    ? row.methodology
                    : base[tab.key].auditTests[index]?.methodology ?? 'Methodologie a completer',
                objective:
                  typeof row.objective === 'string' && row.objective.trim()
                    ? row.objective
                    : base[tab.key].auditTests[index]?.objective ?? 'Objectif a completer',
                startDate:
                  typeof row.startDate === 'string' && row.startDate.trim()
                    ? row.startDate
                    : base[tab.key].auditTests[index]?.startDate ?? '2026-04-20',
                status: isTestStatus(row.status) ? row.status : base[tab.key].auditTests[index]?.status ?? 'Ouvert',
                testNumber:
                  typeof row.testNumber === 'string' && row.testNumber.trim()
                    ? row.testNumber
                    : base[tab.key].auditTests[index]?.testNumber ?? `TV-${String(index + 1).padStart(3, '0')}`,
              }))
            : base[tab.key].auditTests,
          documents: Array.isArray(parsedTab?.documents) ? (parsedTab.documents as DocItem[]) : base[tab.key].documents,
          finalTalkRows: Array.isArray(parsedTab?.finalTalkRows)
            ? (parsedTab.finalTalkRows as FinalTalkRow[]).map((row, index) => {
                const fallbackAssessment = deriveFinalRiskAssessment(isRiskImpact(row.impact) ? row.impact : 'Medium');
                const riskAssessment = isFinalRiskAssessment(row.riskAssessment) ? row.riskAssessment : fallbackAssessment;
                const assessmentProfile = getFinalRiskAssessmentProfile(riskAssessment);

                return {
                  auditableObject:
                    typeof row.auditableObject === 'string' && row.auditableObject.trim()
                      ? row.auditableObject
                      : base[tab.key].finalTalkRows[index]?.auditableObject ?? 'Périmètre global',
                  auditableSubObject:
                    typeof row.auditableSubObject === 'string' && row.auditableSubObject.trim()
                      ? row.auditableSubObject
                      : base[tab.key].finalTalkRows[index]?.auditableSubObject ?? 'Composante specifique',
                  code: typeof row.code === 'string' && row.code.trim() ? row.code : `MR-${index + 1}`,
                  controlMeasure:
                    typeof row.controlMeasure === 'string' && row.controlMeasure.trim()
                      ? row.controlMeasure
                      : base[tab.key].finalTalkRows[index]?.controlMeasure ?? 'Bonnes pratiques a documenter',
                  id: typeof row.id === 'string' ? row.id : `${tab.key}-final-${index}`,
                  impact: assessmentProfile.impact,
                  operationalControlObjective:
                    typeof row.operationalControlObjective === 'string' && row.operationalControlObjective.trim()
                      ? row.operationalControlObjective
                      : base[tab.key].finalTalkRows[index]?.operationalControlObjective ?? 'Justification du contrôle à renseigner',
                  probability: assessmentProfile.probability,
                  riskAssessment,
                  title: typeof row.title === 'string' && row.title.trim() ? row.title : 'Intitulé à compléter',
                };
              })
            : base[tab.key].finalTalkRows,
          isGenerated: false,
          isValidated: parsedTab?.isValidated ?? false,
          notes: Array.isArray(parsedTab?.notes) ? (parsedTab.notes as NoteItem[]) : [],
          orientationReport:
            parsedTab?.orientationReport && typeof parsedTab.orientationReport === 'object'
              ? {
                  auditeeConcerns:
                    typeof parsedTab.orientationReport.auditeeConcerns === 'string'
                      ? parsedTab.orientationReport.auditeeConcerns
                      : base[tab.key].orientationReport.auditeeConcerns,
                  characteristics:
                    typeof parsedTab.orientationReport.characteristics === 'string'
                      ? parsedTab.orientationReport.characteristics
                      : base[tab.key].orientationReport.characteristics,
                  entity:
                    typeof parsedTab.orientationReport.entity === 'string' ? parsedTab.orientationReport.entity : base[tab.key].orientationReport.entity,
                  exclusions:
                    typeof parsedTab.orientationReport.exclusions === 'string'
                      ? parsedTab.orientationReport.exclusions
                      : base[tab.key].orientationReport.exclusions,
                  expectedBenefits:
                    typeof parsedTab.orientationReport.expectedBenefits === 'string'
                      ? parsedTab.orientationReport.expectedBenefits
                      : base[tab.key].orientationReport.expectedBenefits,
                  metrics:
                    typeof parsedTab.orientationReport.metrics === 'string'
                      ? parsedTab.orientationReport.metrics
                      : base[tab.key].orientationReport.metrics,
                  missionLabel:
                    typeof parsedTab.orientationReport.missionLabel === 'string'
                      ? parsedTab.orientationReport.missionLabel
                      : base[tab.key].orientationReport.missionLabel,
                  missionLead:
                    typeof parsedTab.orientationReport.missionLead === 'string'
                      ? parsedTab.orientationReport.missionLead
                      : base[tab.key].orientationReport.missionLead,
                  missionReference:
                    typeof parsedTab.orientationReport.missionReference === 'string'
                      ? parsedTab.orientationReport.missionReference
                      : base[tab.key].orientationReport.missionReference,
                  missionSupervisor:
                    typeof parsedTab.orientationReport.missionSupervisor === 'string'
                      ? parsedTab.orientationReport.missionSupervisor
                      : base[tab.key].orientationReport.missionSupervisor,
                  objective:
                    typeof parsedTab.orientationReport.objective === 'string'
                      ? parsedTab.orientationReport.objective
                      : base[tab.key].orientationReport.objective,
                  objectiveRows: Array.isArray(parsedTab.orientationReport.objectiveRows)
                    ? parsedTab.orientationReport.objectiveRows.map((row, index) => ({
                        controlCriteria:
                          typeof row?.controlCriteria === 'string' && row.controlCriteria.trim()
                            ? row.controlCriteria
                            : base[tab.key].orientationReport.objectiveRows[index]?.controlCriteria ?? 'Criteres a completer',
                        domain:
                          typeof row?.domain === 'string' && row.domain.trim()
                            ? row.domain
                            : base[tab.key].orientationReport.objectiveRows[index]?.domain ?? 'Domaine a completer',
                        id: typeof row?.id === 'string' ? row.id : `orientation-row-${index}`,
                        objective:
                          typeof row?.objective === 'string' && row.objective.trim()
                            ? row.objective
                            : base[tab.key].orientationReport.objectiveRows[index]?.objective ?? 'Objectif a completer',
                        risk:
                          typeof row?.risk === 'string' && row.risk.trim()
                            ? row.risk
                            : base[tab.key].orientationReport.objectiveRows[index]?.risk ?? 'Risque a completer',
                      }))
                    : base[tab.key].orientationReport.objectiveRows,
                  reportDate:
                    typeof parsedTab.orientationReport.reportDate === 'string'
                      ? parsedTab.orientationReport.reportDate
                      : base[tab.key].orientationReport.reportDate,
                  scope: Array.isArray(parsedTab.orientationReport.scope)
                    ? parsedTab.orientationReport.scope.filter((item): item is string => typeof item === 'string')
                    : base[tab.key].orientationReport.scope,
                  startedAt:
                    typeof parsedTab.orientationReport.startedAt === 'string'
                      ? parsedTab.orientationReport.startedAt
                      : base[tab.key].orientationReport.startedAt,
                  urgency:
                    parsedTab.orientationReport.urgency === 'Faible' ||
                    parsedTab.orientationReport.urgency === 'Moyenne' ||
                    parsedTab.orientationReport.urgency === 'Elevee'
                      ? parsedTab.orientationReport.urgency
                      : base[tab.key].orientationReport.urgency,
                  version:
                    typeof parsedTab.orientationReport.version === 'string'
                      ? parsedTab.orientationReport.version
                      : base[tab.key].orientationReport.version,
                  writer:
                    typeof parsedTab.orientationReport.writer === 'string'
                      ? parsedTab.orientationReport.writer
                      : base[tab.key].orientationReport.writer,
                }
              : base[tab.key].orientationReport,
          riskRows: Array.isArray(parsedTab?.riskRows)
            ? (parsedTab.riskRows as RiskRow[]).map((row, index) => {
                const fallbackImpact = isRiskImpact(row.impact) ? row.impact : base[tab.key].riskRows[index]?.impact ?? 'Medium';
                const riskAssessment = isFinalRiskAssessment(row.riskAssessment) ? row.riskAssessment : deriveFinalRiskAssessment(fallbackImpact);
                const assessmentProfile = getFinalRiskAssessmentProfile(riskAssessment);
                const legacyValidated = 'validated' in row && typeof row.validated === 'boolean' ? row.validated : false;
                const decisionStatus =
                  row.decisionStatus === 'Accepte' || row.decisionStatus === 'Brouillon' || row.decisionStatus === 'Refuse'
                    ? row.decisionStatus
                    : legacyValidated
                      ? 'Accepte'
                      : 'Brouillon';

                return {
                  auditableObject:
                    typeof row.auditableObject === 'string' && row.auditableObject.trim()
                      ? row.auditableObject
                      : base[tab.key].riskRows[index]?.auditableObject ?? 'Périmètre global',
                  auditableSubObject:
                    typeof row.auditableSubObject === 'string' && row.auditableSubObject.trim()
                      ? row.auditableSubObject
                      : base[tab.key].riskRows[index]?.auditableSubObject ?? 'Composante specifique',
                  code:
                    typeof row.code === 'string' && row.code.trim()
                      ? row.code
                      : base[tab.key].riskRows[index]?.code ?? `LR-${String(index + 1).padStart(3, '0')}`,
                  controlMeasure:
                    typeof row.controlMeasure === 'string' && row.controlMeasure.trim()
                      ? row.controlMeasure
                      : base[tab.key].riskRows[index]?.controlMeasure ?? 'Bonnes pratiques a documenter',
                  decisionStatus,
                  id: typeof row.id === 'string' ? row.id : `${tab.key}-risk-${index}`,
                  impact: assessmentProfile.impact,
                  operationalControlObjective:
                    typeof row.operationalControlObjective === 'string' && row.operationalControlObjective.trim()
                      ? row.operationalControlObjective
                      : base[tab.key].riskRows[index]?.operationalControlObjective ?? 'Justification du contrôle à renseigner',
                  priority: derivePriority(assessmentProfile.impact, assessmentProfile.probability),
                  probability: assessmentProfile.probability,
                  risk:
                    typeof row.risk === 'string' && row.risk.trim()
                      ? row.risk
                      : base[tab.key].riskRows[index]?.risk ?? 'Risque a documenter',
                  riskAssessment,
                };
              })
            : base[tab.key].riskRows,
          savedAt: parsedTab?.savedAt ?? null,
          validatedAt: parsedTab?.validatedAt ?? null,
          validatedBy: parsedTab?.validatedBy ?? null,
        };

        return accumulator;
      },
      {} as StudyState
    );
  } catch {
    return base;
  }
};

const formatDate = (value: string): string => new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const formatCompactDate = (value: string): string => {
  const date = parseDateInput(value);

  if (!date) {
    return value;
  }

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

function getMatrixCellBackground(impact: RiskImpact, probability: number): string {
  const priority = derivePriority(impact, probability);

  if (priority === 'Critical') {
    return 'rgba(239, 68, 68, 0.16)';
  }

  if (priority === 'High') {
    return 'rgba(245, 158, 11, 0.18)';
  }

  return 'rgba(16, 185, 129, 0.14)';
}

function getOrientationImpactLabel(urgency: OrientationUrgency | ''): string {
  if (urgency === 'Elevee') {
    return 'Impact eleve';
  }

  if (urgency === 'Moyenne') {
    return 'Impact modere';
  }

  if (urgency === 'Faible') {
    return 'Impact maitrise';
  }

  return 'A definir';
}

function getAuditStatusTone(status: TestStatus): { background: string; text: string } {
  if (status === 'Cloture') {
    return { background: '#dcfce7', text: '#166534' };
  }

  if (status === 'En cours') {
    return { background: '#dbeafe', text: '#1d4ed8' };
  }

  return { background: '#fef3c7', text: '#b45309' };
}

const compactAuditFieldSx = {
  '& .MuiInputBase-input': { fontSize: '0.875rem' },
  '& .MuiInputBase-inputMultiline': { fontSize: '0.875rem' },
  '& .MuiSelect-select': { fontSize: '0.875rem' },
} as const;

function parseDateInput(value: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getDateRangeKeys(rows: AuditTestRow[]): string[] {
  const parsedRanges = rows
    .map((row) => {
      const start = parseDateInput(row.startDate);
      const end = parseDateInput(row.endDate);

      if (!start || !end) {
        return null;
      }

      return start <= end ? { end, start } : { end: start, start: end };
    })
    .filter((range): range is { end: Date; start: Date } => range !== null);

  if (parsedRanges.length === 0) {
    return [];
  }

  const minDate = new Date(Math.min(...parsedRanges.map((range) => range.start.getTime())));
  const maxDate = new Date(Math.max(...parsedRanges.map((range) => range.end.getTime())));
  const keys: string[] = [];

  for (let cursor = new Date(minDate); cursor <= maxDate; cursor = addDays(cursor, 1)) {
    keys.push(formatDateKey(cursor));
  }

  return keys;
}

function formatGanttDayLabel(value: string): string {
  const date = parseDateInput(value);

  if (!date) {
    return value;
  }

  return date.toLocaleDateString('fr-FR', { day: '2-digit' });
}

function formatGanttWeekdayLabel(value: string): string {
  const date = parseDateInput(value);

  if (!date) {
    return '';
  }

  return date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
}

function formatGanttMonthLabel(values: string[]): string {
  if (values.length === 0) {
    return '';
  }

  const firstDate = parseDateInput(values[0]);
  const lastDate = parseDateInput(values.at(-1) ?? '');

  if (!firstDate || !lastDate) {
    return '';
  }

  const firstLabel = firstDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const lastLabel = lastDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return firstLabel === lastLabel ? firstLabel : `${firstLabel} - ${lastLabel}`;
}

interface SectionPaginationProps {
  onChange: (page: number) => void;
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}

function SectionPagination({ onChange, page, pageCount, pageSize, total }: SectionPaginationProps): React.JSX.Element {
  const startResult = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endResult = total === 0 ? 0 : Math.min(page * pageSize, total);
  const compactPages: Array<number | 'ellipsis'> = [];

  if (pageCount <= 5) {
    compactPages.push(...Array.from({ length: pageCount }, (_value, index) => index + 1));
  } else {
    compactPages.push(1, 2, 3);

    if (page > 4 && page < pageCount) {
      compactPages.push('ellipsis', page);
    }

    if (pageCount > 4) {
      compactPages.push('ellipsis');
    }

    compactPages.push(pageCount);
  }

  const uniqueCompactPages = compactPages.filter((item, index, array) => {
    if (item === 'ellipsis') {
      return index === 0 || array[index - 1] !== 'ellipsis';
    }

    return array.indexOf(item) === index;
  });

  return (
    <Stack direction={{ lg: 'row', xs: 'column' }} justifyContent="space-between" spacing={2} sx={{ alignItems: { lg: 'center', xs: 'flex-start' } }}>
      <Typography sx={{ color: '#64748b', fontSize: '0.84rem', fontWeight: 600 }}>{`Results: ${startResult}\u2013${endResult} of ${total}.`}</Typography>

      <Stack direction="row" spacing={0.75}>
        <Button disabled={page === 1} onClick={(): void => onChange(Math.max(page - 1, 1))} sx={{ minWidth: 38, px: 1.2 }} variant="outlined">
          {'<'}
        </Button>
        {uniqueCompactPages.map((item, index) =>
          item === 'ellipsis' ? (
            <Typography key={`ellipsis-${index}`} sx={{ color: '#64748b', fontSize: '0.92rem', fontWeight: 700, px: 0.3 }}>
              ...
            </Typography>
          ) : (
            <Button key={item} onClick={(): void => onChange(item)} sx={{ minWidth: 38, px: 1.2 }} variant={item === page ? 'contained' : 'outlined'}>
              {item}
            </Button>
          )
        )}
        <Button disabled={page === pageCount} onClick={(): void => onChange(Math.min(page + 1, pageCount))} sx={{ minWidth: 38, px: 1.2 }} variant="outlined">
          {'>'}
        </Button>
      </Stack>
    </Stack>
  );
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
  const { addNotification } = useNotifications();
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const riskListingTableRef = React.useRef<HTMLDivElement | null>(null);
  const auditPlanningTableRef = React.useRef<HTMLDivElement | null>(null);
  const finalTalkTableRef = React.useRef<HTMLDivElement | null>(null);
  const hasHydratedWorkspaceDraftRef = React.useRef(false);
  const [activeTab, setActiveTab] = React.useState<TabKey>('knowledge');
  const [activeKnowledgeCardId, setActiveKnowledgeCardId] = React.useState<string>('synthese');
  const [state, setState] = React.useState<StudyState>(createState);
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false);
  const [isRiskDialogOpen, setIsRiskDialogOpen] = React.useState(false);
  const [isFinalTalkDialogOpen, setIsFinalTalkDialogOpen] = React.useState(false);
  const [isNotesListOpen, setIsNotesListOpen] = React.useState(false);
  const [isAuditTestDialogOpen, setIsAuditTestDialogOpen] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState('');
  const [riskDraft, setRiskDraft] = React.useState<RiskDraft>(createDefaultRiskDraft());
  const [riskDraftError, setRiskDraftError] = React.useState<string | null>(null);
  const [editingRiskId, setEditingRiskId] = React.useState<string | null>(null);
  const [finalTalkDraft, setFinalTalkDraft] = React.useState<FinalTalkDraft>(createDefaultFinalTalkDraft());
  const [finalTalkDraftError, setFinalTalkDraftError] = React.useState<string | null>(null);
  const [editingFinalTalkId, setEditingFinalTalkId] = React.useState<string | null>(null);
  const [finalTalkMenuAnchor, setFinalTalkMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [selectedFinalTalkMenuRow, setSelectedFinalTalkMenuRow] = React.useState<FinalTalkRow | null>(null);
  const [auditTestDraft, setAuditTestDraft] = React.useState<AuditTestDraft>(createDefaultAuditTestDraft());
  const [auditTestDraftError, setAuditTestDraftError] = React.useState<string | null>(null);
  const [editingAuditTestId, setEditingAuditTestId] = React.useState<string | null>(null);
  const [auditTestMenuAnchor, setAuditTestMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [selectedAuditTestMenuRow, setSelectedAuditTestMenuRow] = React.useState<AuditTestRow | null>(null);
  const [planningView, setPlanningView] = React.useState<'list' | 'gantt'>('list');
  const [fullscreenSection, setFullscreenSection] = React.useState<FullscreenSection>(null);
  const [riskListingPage, setRiskListingPage] = React.useState(1);
  const [finalTalkPage, setFinalTalkPage] = React.useState(1);
  const [auditPlanningPage, setAuditPlanningPage] = React.useState(1);
  const [riskListingPageSize, setRiskListingPageSize] = React.useState(DEFAULT_TABLE_PAGE_SIZE);
  const [finalTalkPageSize, setFinalTalkPageSize] = React.useState(DEFAULT_TABLE_PAGE_SIZE);
  const [auditPlanningPageSize, setAuditPlanningPageSize] = React.useState(DEFAULT_TABLE_PAGE_SIZE);
  const selectedMissionId = React.useMemo(() => getSelectedMissionIdForUser(workspace, user?.id), [user?.id, workspace]);

  React.useEffect(() => {
    setState(loadState());
  }, []);

  React.useEffect(() => {
    if (!hasHydratedWorkspaceDraftRef.current) {
      hasHydratedWorkspaceDraftRef.current = true;
      return;
    }

    saveWorkspaceStudyPhaseState(state);
  }, [state]);

  React.useEffect(() => {
    const handleFullscreenChange = (): void => {
      const fullscreenElement = document.fullscreenElement;

      if (fullscreenElement === riskListingTableRef.current) {
        setFullscreenSection('risk-listing');
        return;
      }

      if (fullscreenElement === auditPlanningTableRef.current) {
        setFullscreenSection('audit-planning');
        return;
      }

      if (fullscreenElement === finalTalkTableRef.current) {
        setFullscreenSection('final-talk');
        return;
      }

      setFullscreenSection(null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    setSelectedCardId(null);
    setIsAddNoteOpen(false);
    setIsRiskDialogOpen(false);
    setIsFinalTalkDialogOpen(false);
    setIsNotesListOpen(false);
    setIsAuditTestDialogOpen(false);
    setRiskDraft(createDefaultRiskDraft());
    setRiskDraftError(null);
    setEditingRiskId(null);
    setFinalTalkDraft(createDefaultFinalTalkDraft());
    setFinalTalkDraftError(null);
    setEditingFinalTalkId(null);
    setFinalTalkMenuAnchor(null);
    setSelectedFinalTalkMenuRow(null);
    setAuditTestDraft(createDefaultAuditTestDraft());
    setAuditTestDraftError(null);
    setEditingAuditTestId(null);
    setAuditTestMenuAnchor(null);
    setSelectedAuditTestMenuRow(null);
    setRiskListingPage(1);
    setFinalTalkPage(1);
    setAuditPlanningPage(1);
    setPlanningView('list');
  }, [activeTab]);

  const author = user?.name ?? user?.email ?? 'Utilisateur connecte';
  const currentTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const visibleTabs = tabs.filter((tab) => tab.key !== 'orientation-report');
  const currentState = state[activeTab];
  const isAuditPlanningTab = activeTab === 'audit-planning';
  const isFinalTalkTab = activeTab === 'final-talk';
  const isOrientationReportTab = activeTab === 'orientation-report';
  const isRiskListingTab = activeTab === 'risk-listing';
  const cards = currentTab.cards.map((card) => ({
    ...card,
    detail: currentState.isGenerated ? card.detail : 'Le contenu détaillé sera généré automatiquement après un clic sur Générer.',
    summary: currentState.isGenerated ? card.summary : 'Clique sur Générer pour remplir automatiquement ce cadre.',
  }));
  const activeKnowledgeCard = cards.find((card) => card.id === activeKnowledgeCardId) ?? cards[0] ?? null;
  const orientationReport = currentState.orientationReport;
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null;
  const finalTalkRows = currentState.finalTalkRows;
  const notesPreview = currentState.notes.slice(0, 2);
  const riskRows = currentState.riskRows;
  const auditTests = currentState.auditTests;
  const riskListingPageCount = Math.max(Math.ceil(riskRows.length / riskListingPageSize), 1);
  const paginatedRiskRows = riskRows.slice((riskListingPage - 1) * riskListingPageSize, riskListingPage * riskListingPageSize);
  const finalTalkPageCount = Math.max(Math.ceil(finalTalkRows.length / finalTalkPageSize), 1);
  const paginatedFinalTalkRows = finalTalkRows.slice((finalTalkPage - 1) * finalTalkPageSize, finalTalkPage * finalTalkPageSize);
  const auditPlanningPageCount = Math.max(Math.ceil(auditTests.length / auditPlanningPageSize), 1);
  const paginatedAuditTests = auditTests.slice((auditPlanningPage - 1) * auditPlanningPageSize, auditPlanningPage * auditPlanningPageSize);
  const acceptedRiskCount = riskRows.filter((row) => row.decisionStatus === 'Accepte').length;
  const refusedRiskCount = riskRows.filter((row) => row.decisionStatus === 'Refuse').length;
  const closedAuditTests = auditTests.filter((row) => row.status === 'Cloture').length;
  const inProgressAuditTests = auditTests.filter((row) => row.status === 'En cours').length;
  const openAuditTests = auditTests.filter((row) => row.status === 'Ouvert').length;
  const closedAuditTestsPercentage = auditTests.length > 0 ? Math.round((closedAuditTests / auditTests.length) * 100) : 0;
  const ganttDateKeys = getDateRangeKeys(paginatedAuditTests);
  const ganttMonthLabel = formatGanttMonthLabel(ganttDateKeys);
  const todayDateKey = formatDateKey(new Date());

  React.useEffect(() => {
    if (activeTab !== 'knowledge') {
      return;
    }

    if (!cards.some((card) => card.id === activeKnowledgeCardId)) {
      setActiveKnowledgeCardId(cards[0]?.id ?? 'synthese');
    }
  }, [activeKnowledgeCardId, activeTab, cards]);

  const orientationProgressSteps = [
    Boolean(orientationReport.objective.trim()),
    Boolean(orientationReport.entity),
    Boolean(orientationReport.urgency),
    orientationReport.scope.length > 0,
    orientationReport.objectiveRows.some((row) => row.objective.trim() && row.risk.trim()),
  ];
  const orientationProgress = Math.round((orientationProgressSteps.filter(Boolean).length / orientationProgressSteps.length) * 100);

  React.useEffect(() => {
    setRiskListingPage((currentPage) => Math.min(currentPage, riskListingPageCount));
  }, [riskListingPageCount]);

  React.useEffect(() => {
    setFinalTalkPage((currentPage) => Math.min(currentPage, finalTalkPageCount));
  }, [finalTalkPageCount]);

  React.useEffect(() => {
    setAuditPlanningPage((currentPage) => Math.min(currentPage, auditPlanningPageCount));
  }, [auditPlanningPageCount]);

  React.useEffect(() => {
    setRiskListingPageSize(fullscreenSection === 'risk-listing' ? FULLSCREEN_TABLE_PAGE_SIZE : DEFAULT_TABLE_PAGE_SIZE);
    setFinalTalkPageSize(fullscreenSection === 'final-talk' ? FULLSCREEN_TABLE_PAGE_SIZE : DEFAULT_TABLE_PAGE_SIZE);
    setAuditPlanningPageSize(fullscreenSection === 'audit-planning' ? FULLSCREEN_TABLE_PAGE_SIZE : DEFAULT_TABLE_PAGE_SIZE);
  }, [fullscreenSection]);

  const updateState = (updater: (current: StudyState) => StudyState): void => {
    setState((current) => updater(current));
    setHasUnsavedChanges(true);
  };

  const saveState = (nextState: StudyState, message: string, title: string): void => {
    setState(nextState);
    saveWorkspaceStudyPhaseState(nextState);
    setHasUnsavedChanges(false);
    addNotification({ message, title });
  };

  const updateRiskRows = (updater: (rows: RiskRow[]) => RiskRow[]): void => {
    updateState((current) => ({
      ...current,
      'risk-listing': {
        ...current['risk-listing'],
        isValidated: false,
        riskRows: updater(current['risk-listing'].riskRows),
        validatedAt: null,
        validatedBy: null,
      },
    }));
  };

  const updateAuditTests = (updater: (rows: AuditTestRow[]) => AuditTestRow[]): void => {
    updateState((current) => ({
      ...current,
      'audit-planning': {
        ...current['audit-planning'],
        auditTests: updater(current['audit-planning'].auditTests),
        isValidated: false,
        validatedAt: null,
        validatedBy: null,
      },
    }));
  };

  const updateFinalTalkRows = (updater: (rows: FinalTalkRow[]) => FinalTalkRow[]): void => {
    updateState((current) => ({
      ...current,
      'final-talk': {
        ...current['final-talk'],
        finalTalkRows: updater(current['final-talk'].finalTalkRows),
        isValidated: false,
        validatedAt: null,
        validatedBy: null,
      },
    }));
  };

  const handleGenerate = (): void => {
    updateState((current) => ({
      ...current,
      [activeTab]: { ...current[activeTab], isGenerated: true, isValidated: false, validatedAt: null, validatedBy: null },
    }));
    addNotification({ title: "Phase d'étude", message: `Les 7 cadres de ${currentTab.label} ont été générés.` });
  };

  const handleSave = (): void => {
    saveState(
      { ...state, [activeTab]: { ...state[activeTab], savedAt: new Date().toISOString() } },
      `${currentTab.label} a été enregistré avec succès.`,
      'Enregistrement'
    );
  };

  const handleValidate = (): void => {
    saveState(
      {
        ...state,
        [activeTab]: {
          ...state[activeTab],
          isValidated: true,
          savedAt: new Date().toISOString(),
          validatedAt: new Date().toISOString(),
          validatedBy: author,
        },
      },
      `${currentTab.label} a été validé par ${author}.`,
      'Validation'
    );
  };

  const handleAddNote = (): void => {
    const content = noteDraft.trim();

    if (!content) {
      return;
    }

    updateState((current) => ({
      ...current,
      [activeTab]: {
        ...current[activeTab],
        notes: [{ author, content, createdAt: new Date().toISOString(), id: `${activeTab}-note-${Date.now()}` }, ...current[activeTab].notes],
      },
    }));
    setNoteDraft('');
    setIsAddNoteOpen(false);
    addNotification({ title: 'Notes de travail', message: `Une note de travail a été ajoutée dans ${currentTab.label}.` });
  };

  const handleAddRisk = (): void => {
    setEditingRiskId(null);
    setRiskDraft(createDefaultRiskDraft());
    setRiskDraftError(null);
    setIsRiskDialogOpen(true);
  };

  const handleSetRiskDecisionStatus = (riskId: string, decisionStatus: RiskDecisionStatus): void => {
    const targetRisk = riskRows.find((row) => row.id === riskId);

    if (!targetRisk) {
      return;
    }

    const nextDecisionStatus = targetRisk.decisionStatus === decisionStatus ? 'Brouillon' : decisionStatus;

    updateRiskRows((rows) => rows.map((row) => (row.id === riskId ? { ...row, decisionStatus: nextDecisionStatus } : row)));

    addNotification({
      title: 'Listing des risques',
      message:
        nextDecisionStatus === 'Brouillon'
          ? `Le risque "${targetRisk.risk}" est revenu a l etat initial.`
          : `Le risque "${targetRisk.risk}" a ete marque ${nextDecisionStatus.toLowerCase()}.`,
    });
  };

  const handleRiskRecommendation = (): void => {
    const existingRisks = new Set(riskRows.map((row) => row.risk.trim().toLowerCase()));
    const missingRecommendations = aiRiskRecommendations.filter((row) => !existingRisks.has(row.risk.toLowerCase()));

    if (missingRecommendations.length > 0) {
      const recommendationsToAdd = missingRecommendations.slice(0, 2).map((row, index) => ({
        ...row,
        id: `risk-ai-${Date.now()}-${index}`,
      }));

      updateRiskRows((rows) => [...recommendationsToAdd, ...rows]);
      addNotification({
        title: 'Listing des risques',
        message: `${recommendationsToAdd.length} recommandation(s) IA ont été ajoutées.`,
      });
      return;
    }

    updateRiskRows((rows) =>
      rows.map((row, index) => {
        if (index > 1) {
          return row;
        }

        const nextProbability = clampProbability(row.probability + 1);
        const nextImpact = row.impact;
        const nextAssessment = deriveFinalRiskAssessment(nextImpact);

        return {
          ...row,
          decisionStatus: row.decisionStatus,
          impact: nextImpact,
          priority: derivePriority(nextImpact, nextProbability),
          probability: nextProbability,
          riskAssessment: nextAssessment,
        };
      })
    );
    addNotification({
      title: 'Listing des risques',
      message: 'La recommandation IA a réévalué les priorités des risques existants.',
    });
  };

  const handleRiskDraftFieldChange = (field: keyof RiskDraft, value: string): void => {
    setRiskDraftError(null);
    setRiskDraft((currentDraft) => {
      if (field === 'riskAssessment' && isFinalRiskAssessment(value)) {
        return { ...currentDraft, impact: getFinalRiskAssessmentProfile(value).impact, riskAssessment: value };
      }

      if (field === 'riskAssessment' && value === '') {
        return { ...currentDraft, impact: '', riskAssessment: '' };
      }

      if (field === 'impact' && isRiskImpact(value)) {
        return { ...currentDraft, impact: value, riskAssessment: deriveFinalRiskAssessment(value) };
      }

      if (field === 'impact' && value === '') {
        return { ...currentDraft, impact: '', riskAssessment: '' };
      }

      return { ...currentDraft, [field]: value };
    });
  };

  const handleOpenEditRisk = (row: RiskRow): void => {
    setEditingRiskId(row.id);
    setRiskDraft(createRiskDraftFromRow(row));
    setRiskDraftError(null);
    setIsRiskDialogOpen(true);
  };

  const handleCloseRiskDialog = (): void => {
    setIsRiskDialogOpen(false);
    setRiskDraftError(null);
    setEditingRiskId(null);
  };

  const handleSubmitRisk = (): void => {
    if (
      !riskDraft.code.trim() ||
      !riskDraft.auditableObject.trim() ||
      !riskDraft.auditableSubObject.trim() ||
      !riskDraft.risk.trim() ||
      !riskDraft.riskAssessment ||
      !riskDraft.impact ||
      !riskDraft.operationalControlObjective.trim() ||
      !riskDraft.controlMeasure.trim()
    ) {
      setRiskDraftError('Renseigne tous les champs du formulaire avant d’ajouter ou de modifier le risque.');
      return;
    }

    if (!isFinalRiskAssessment(riskDraft.riskAssessment) || !isRiskImpact(riskDraft.impact)) {
      setRiskDraftError('Sélectionne une évaluation du risque et un impact valides.');
      return;
    }

    const assessmentProfile = getFinalRiskAssessmentProfile(riskDraft.riskAssessment);
    const nextRisk = createRiskRow(
      editingRiskId ?? `risk-${Date.now()}`,
      riskDraft.code.trim(),
      riskDraft.auditableObject.trim(),
      riskDraft.auditableSubObject.trim(),
      riskDraft.risk.trim(),
      riskDraft.operationalControlObjective.trim(),
      riskDraft.riskAssessment,
      riskDraft.controlMeasure.trim(),
      'Brouillon'
    );

    if (editingRiskId) {
      updateRiskRows((rows) =>
        rows.map((row) =>
          row.id === editingRiskId
            ? {
                ...nextRisk,
                decisionStatus: row.decisionStatus,
                impact: assessmentProfile.impact,
                priority: derivePriority(assessmentProfile.impact, assessmentProfile.probability),
                probability: assessmentProfile.probability,
              }
            : row
        )
      );
      addNotification({
        title: 'Listing des risques',
        message: `Le risque "${nextRisk.risk}" a été mis à jour.`,
      });
    } else {
      updateRiskRows((rows) => [nextRisk, ...rows]);
      addNotification({
        title: 'Listing des risques',
        message: `Le risque "${nextRisk.risk}" a été ajouté au registre.`,
      });
    }

    handleCloseRiskDialog();
  };

  const handleAddFinalTalkRow = (): void => {
    setEditingFinalTalkId(null);
    setFinalTalkDraft(createDefaultFinalTalkDraft());
    setFinalTalkDraftError(null);
    setIsFinalTalkDialogOpen(true);
  };

  const handleDeleteFinalTalkRow = (rowId: string): void => {
    const targetRow = finalTalkRows.find((row) => row.id === rowId);

    updateFinalTalkRows((rows) => rows.filter((row) => row.id !== rowId));

    if (targetRow) {
      addNotification({
        title: 'TaRi final',
        message: `Le risque "${targetRow.title}" a été supprimé du tableau final.`,
      });
    }
  };

  const handleAuditTestDraftFieldChange = (
    field:
      | 'action'
      | 'auditor'
      | 'comments'
      | 'controlDescription'
      | 'endDate'
      | 'methodology'
      | 'objective'
      | 'startDate'
      | 'status'
      | 'testNumber',
    value: string
  ): void => {
    setAuditTestDraftError(null);
    setAuditTestDraft((currentDraft) => {
      if (field === 'auditor' && isAuditAuditor(value)) {
        return { ...currentDraft, auditor: value };
      }

      if (field === 'auditor' && value === '') {
        return { ...currentDraft, auditor: '' };
      }

      if (field === 'status' && isTestStatus(value)) {
        return { ...currentDraft, status: value };
      }

      if (field === 'status' && value === '') {
        return { ...currentDraft, status: '' };
      }

      return { ...currentDraft, [field]: value };
    });
  };

  const handleOpenAddAuditTest = (): void => {
    setEditingAuditTestId(null);
    setAuditTestDraft(createDefaultAuditTestDraft());
    setAuditTestDraftError(null);
    setIsAuditTestDialogOpen(true);
  };

  const handleOpenEditAuditTest = (row: AuditTestRow): void => {
    setEditingAuditTestId(row.id);
    setAuditTestDraft(createAuditTestDraftFromRow(row));
    setAuditTestDraftError(null);
    setIsAuditTestDialogOpen(true);
  };

  const handleCloseAuditTestDialog = (): void => {
    setIsAuditTestDialogOpen(false);
    setAuditTestDraftError(null);
    setEditingAuditTestId(null);
  };

  const handleOpenAuditTestMenu = (event: React.MouseEvent<HTMLElement>, row: AuditTestRow): void => {
    setAuditTestMenuAnchor(event.currentTarget);
    setSelectedAuditTestMenuRow(row);
  };

  const handleCloseAuditTestMenu = (): void => {
    setAuditTestMenuAnchor(null);
    setSelectedAuditTestMenuRow(null);
  };

  const handleSubmitAuditTest = (): void => {
    const requiredFields = [
      auditTestDraft.testNumber,
      auditTestDraft.controlDescription,
      auditTestDraft.objective,
      auditTestDraft.methodology,
      auditTestDraft.auditor,
      auditTestDraft.comments,
      auditTestDraft.startDate,
      auditTestDraft.status,
      auditTestDraft.endDate,
      auditTestDraft.action,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      setAuditTestDraftError('Renseigne tous les champs du formulaire avant de valider le test.');
      return;
    }

    if (parseDateInput(auditTestDraft.startDate) && parseDateInput(auditTestDraft.endDate) && auditTestDraft.startDate > auditTestDraft.endDate) {
      setAuditTestDraftError('La date de fin doit etre posterieure ou egale a la date de debut.');
      return;
    }

    if (!isAuditAuditor(auditTestDraft.auditor) || !isTestStatus(auditTestDraft.status)) {
      setAuditTestDraftError('Selectionne un auditeur et un statut valides.');
      return;
    }

    const nextRow = createAuditTestRow(
      editingAuditTestId ?? `test-${Date.now()}`,
      auditTestDraft.testNumber.trim(),
      auditTestDraft.controlDescription.trim(),
      auditTestDraft.objective.trim(),
      auditTestDraft.methodology.trim(),
      auditTestDraft.auditor,
      auditTestDraft.status,
      auditTestDraft.startDate,
      auditTestDraft.endDate,
      auditTestDraft.comments.trim(),
      auditTestDraft.action.trim(),
      auditTestDraft.isNonConformity
    );

    if (editingAuditTestId) {
      updateAuditTests((rows) => rows.map((row) => (row.id === editingAuditTestId ? nextRow : row)));
      addNotification({
        title: 'Programme de vérification',
        message: `Le test ${nextRow.testNumber} a ete mis a jour.`,
      });
    } else {
      updateAuditTests((rows) => [...rows, nextRow]);
      addNotification({
        title: 'Programme de vérification',
        message: `Le test ${nextRow.testNumber} a été ajouté au programme de vérification.`,
      });
    }

    handleCloseAuditTestDialog();
  };

  const handleDeleteAuditTest = (testId: string): void => {
    const targetTest = auditTests.find((row) => row.id === testId);

    updateAuditTests((rows) => rows.filter((row) => row.id !== testId));

    if (targetTest) {
      addNotification({
        title: 'Programme de vérification',
        message: `Le test ${targetTest.testNumber} a ete retire du programme.`,
      });
    }
  };

  const handleEditAuditTestFromMenu = (): void => {
    if (!selectedAuditTestMenuRow) {
      return;
    }

    handleOpenEditAuditTest(selectedAuditTestMenuRow);
    handleCloseAuditTestMenu();
  };

  const handleDeleteAuditTestFromMenu = (): void => {
    if (!selectedAuditTestMenuRow) {
      return;
    }

    handleDeleteAuditTest(selectedAuditTestMenuRow.id);
    handleCloseAuditTestMenu();
  };

  const handleFinalTalkDraftFieldChange = (field: keyof FinalTalkDraft, value: string): void => {
    setFinalTalkDraftError(null);
    setFinalTalkDraft((currentDraft) => {
      if (field === 'riskAssessment' && isFinalRiskAssessment(value)) {
        return { ...currentDraft, impact: getFinalRiskAssessmentProfile(value).impact, riskAssessment: value };
      }

      if (field === 'riskAssessment' && value === '') {
        return { ...currentDraft, impact: '', riskAssessment: '' };
      }

      if (field === 'impact' && isRiskImpact(value)) {
        return { ...currentDraft, impact: value, riskAssessment: deriveFinalRiskAssessment(value) };
      }

      if (field === 'impact' && value === '') {
        return { ...currentDraft, impact: '', riskAssessment: '' };
      }

      return { ...currentDraft, [field]: value };
    });
  };

  const handleCloseFinalTalkDialog = (): void => {
    setIsFinalTalkDialogOpen(false);
    setFinalTalkDraftError(null);
    setEditingFinalTalkId(null);
  };

  const handleSubmitFinalTalkRow = (): void => {
    if (
      !finalTalkDraft.code.trim() ||
      !finalTalkDraft.title.trim() ||
      !finalTalkDraft.auditableObject.trim() ||
      !finalTalkDraft.auditableSubObject.trim() ||
      !finalTalkDraft.riskAssessment ||
      !finalTalkDraft.impact ||
      !finalTalkDraft.operationalControlObjective.trim() ||
      !finalTalkDraft.controlMeasure.trim()
    ) {
      setFinalTalkDraftError('Renseigne tous les champs du formulaire avant d ajouter ou modifier la ligne.');
      return;
    }

    if (!isFinalRiskAssessment(finalTalkDraft.riskAssessment) || !isRiskImpact(finalTalkDraft.impact)) {
      setFinalTalkDraftError('Sélectionne une évaluation du risque et un impact valides.');
      return;
    }

    const assessmentProfile = getFinalRiskAssessmentProfile(finalTalkDraft.riskAssessment);
    const nextRow: FinalTalkRow = {
      auditableObject: finalTalkDraft.auditableObject.trim(),
      auditableSubObject: finalTalkDraft.auditableSubObject.trim(),
      code: finalTalkDraft.code.trim(),
      controlMeasure: finalTalkDraft.controlMeasure.trim(),
      id: editingFinalTalkId ?? `final-risk-${Date.now()}`,
      impact: assessmentProfile.impact,
      operationalControlObjective: finalTalkDraft.operationalControlObjective.trim(),
      probability: assessmentProfile.probability,
      riskAssessment: finalTalkDraft.riskAssessment,
      title: finalTalkDraft.title.trim(),
    };

    if (editingFinalTalkId) {
      updateFinalTalkRows((rows) => rows.map((row) => (row.id === editingFinalTalkId ? nextRow : row)));
      addNotification({
        title: 'TaRi final',
        message: `Le risque "${nextRow.title}" a été mis à jour.`,
      });
    } else {
      updateFinalTalkRows((rows) => [nextRow, ...rows]);
      addNotification({
        title: 'TaRi final',
        message: `Le risque "${nextRow.title}" a été ajouté au tableau final.`,
      });
    }

    handleCloseFinalTalkDialog();
  };

  const handleOpenEditFinalTalkRow = (row: FinalTalkRow): void => {
    setEditingFinalTalkId(row.id);
    setFinalTalkDraft(createFinalTalkDraftFromRow(row));
    setFinalTalkDraftError(null);
    setIsFinalTalkDialogOpen(true);
  };

  const handleOpenFinalTalkMenu = (event: React.MouseEvent<HTMLElement>, row: FinalTalkRow): void => {
    setFinalTalkMenuAnchor(event.currentTarget);
    setSelectedFinalTalkMenuRow(row);
  };

  const handleCloseFinalTalkMenu = (): void => {
    setFinalTalkMenuAnchor(null);
    setSelectedFinalTalkMenuRow(null);
  };

  const handleEditFinalTalkFromMenu = (): void => {
    if (!selectedFinalTalkMenuRow) {
      return;
    }

    handleOpenEditFinalTalkRow(selectedFinalTalkMenuRow);
    handleCloseFinalTalkMenu();
  };

  const handleDeleteFinalTalkFromMenu = (): void => {
    if (!selectedFinalTalkMenuRow) {
      return;
    }

    handleDeleteFinalTalkRow(selectedFinalTalkMenuRow.id);
    handleCloseFinalTalkMenu();
  };

  const handleSaveFinalTalkDraft = (): void => {
    saveState(
      {
        ...state,
        'final-talk': {
          ...state['final-talk'],
          savedAt: new Date().toISOString(),
        },
      },
      'Le tableau TaRi final a été enregistré en brouillon.',
      'Brouillon'
    );
  };

  const handleSaveRiskDraft = (): void => {
    saveState(
      {
        ...state,
        'risk-listing': {
          ...state['risk-listing'],
          savedAt: new Date().toISOString(),
        },
      },
      'Le listing des risques a été enregistré en brouillon.',
      'Brouillon'
    );
  };

  const handleValidateFinalTalk = (): void => {
    saveState(
      {
        ...state,
        'final-talk': {
          ...state['final-talk'],
          isValidated: true,
          savedAt: new Date().toISOString(),
          validatedAt: new Date().toISOString(),
          validatedBy: author,
        },
      },
      `TaRi final a été validé par ${author}.`,
      'Validation'
    );
  };

  const updateOrientationReport = (updater: (current: OrientationReportData) => OrientationReportData): void => {
    updateState((current) => ({
      ...current,
      'orientation-report': {
        ...current['orientation-report'],
        isValidated: false,
        orientationReport: updater(current['orientation-report'].orientationReport),
        validatedAt: null,
        validatedBy: null,
      },
    }));
  };

  const handleOrientationFieldChange =
    (
      field:
        | 'auditeeConcerns'
        | 'characteristics'
        | 'entity'
        | 'exclusions'
        | 'expectedBenefits'
        | 'metrics'
        | 'missionLabel'
        | 'missionLead'
        | 'missionReference'
        | 'missionSupervisor'
        | 'objective'
        | 'reportDate'
        | 'urgency'
        | 'version'
        | 'writer'
    ) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const value = event.target.value;

      updateOrientationReport((current) => ({
        ...current,
        [field]: field === 'urgency' && (value === 'Faible' || value === 'Moyenne' || value === 'Elevee') ? value : value,
      }));
    };

  const handleOrientationObjectiveRowChange =
    (rowId: string, field: 'controlCriteria' | 'domain' | 'objective' | 'risk') =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const value = event.target.value;

      updateOrientationReport((current) => ({
        ...current,
        objectiveRows: current.objectiveRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
      }));
    };

  const handleAddOrientationObjectiveRow = (): void => {
    updateOrientationReport((current) => ({
      ...current,
      objectiveRows: [
        ...current.objectiveRows,
        createOrientationObjectiveRow(
          `orientation-row-${Date.now()}`,
          'Nouveau domaine',
          'Nouvel objectif d audit',
          'Criteres de maitrise a definir',
          'Risque a documenter'
        ),
      ],
    }));
  };

  const handleRemoveOrientationObjectiveRow = (rowId: string): void => {
    updateOrientationReport((current) => ({
      ...current,
      objectiveRows: current.objectiveRows.filter((row) => row.id !== rowId),
    }));
  };

  const handleToggleOrientationScope = (scopeItem: string): void => {
    updateOrientationReport((current) => ({
      ...current,
      scope: current.scope.includes(scopeItem)
        ? current.scope.filter((item) => item !== scopeItem)
        : [...current.scope, scopeItem],
    }));
  };

  const handleSaveOrientationReport = (): void => {
    saveState(
      {
        ...state,
        'orientation-report': {
          ...state['orientation-report'],
          isValidated: false,
          savedAt: new Date().toISOString(),
          validatedAt: null,
          validatedBy: null,
        },
      },
      'Le rapport d’orientation a été enregistré.',
      'Enregistrement'
    );
  };

  const handleSubmitOrientationReport = (): void => {
    saveState(
      {
        ...state,
        'orientation-report': {
          ...state['orientation-report'],
          isValidated: true,
          savedAt: new Date().toISOString(),
          validatedAt: new Date().toISOString(),
          validatedBy: author,
        },
      },
      `Le rapport d’orientation a été soumis par ${author}.`,
      'Soumission'
    );
  };

  const toggleSectionFullscreen = async (section: Exclude<FullscreenSection, null>): Promise<void> => {
    const targetMap: Record<Exclude<FullscreenSection, null>, React.RefObject<HTMLDivElement | null>> = {
      'audit-planning': auditPlanningTableRef,
      'final-talk': finalTalkTableRef,
      'risk-listing': riskListingTableRef,
    };

    const targetElement = targetMap[section].current;

    if (!targetElement) {
      return;
    }

    try {
      if (document.fullscreenElement === targetElement) {
        await document.exitFullscreen();
        return;
      }

      await targetElement.requestFullscreen();
    } catch {
      addNotification({
        title: 'Plein ecran',
        message: 'Le mode plein ecran n a pas pu etre active pour ce tableau.',
      });
    }
  };

  if (!selectedMissionId) {
    return <MissionRequiredAccess />;
  }

  return (
    <Stack spacing={3.5}>
      <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={2} sx={{ alignItems: { md: 'center', xs: 'flex-start' } }}>
        <Box>
          <Typography sx={{ color: '#6366f1', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Phase d’étude</Typography>
          <Typography
            sx={{
              color: '#0f172a',
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontSize: { xs: '2rem', md: '2.35rem' },
              fontWeight: 700,
              letterSpacing: '-0.04em',
              mt: 0.75,
            }}
          >
            {currentTab.label}
          </Typography>
          {currentTab.description ? <Typography color="text.secondary" sx={{ maxWidth: 980, mt: 1.1 }}>{currentTab.description}</Typography> : null}
        </Box>

        {isRiskListingTab ? (
          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.25}>
            <Button onClick={handleRiskRecommendation} startIcon={<SparkleIcon fontSize="var(--icon-fontSize-md)" />} variant="outlined">
              Recommandation IA
            </Button>
            <Button onClick={handleAddRisk} variant="contained">
              Ajouter risque
            </Button>
          </Stack>
        ) : isAuditPlanningTab ? (
          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.25}>
            <Button onClick={(): void => setPlanningView('list')} variant={planningView === 'list' ? 'contained' : 'outlined'}>
              List View
            </Button>
            <Button onClick={(): void => setPlanningView('gantt')} variant={planningView === 'gantt' ? 'contained' : 'outlined'}>
              Gantt View
            </Button>
            <Button onClick={handleOpenAddAuditTest} variant="contained">
              Ajouter test
            </Button>
          </Stack>
        ) : isOrientationReportTab ? (
          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.25}>
            <Button onClick={handleSaveOrientationReport} startIcon={<FloppyDiskIcon fontSize="var(--icon-fontSize-md)" />} variant="outlined">
              Enregistrer
            </Button>
            <Button onClick={handleSubmitOrientationReport} variant="contained">
              Soumettre
            </Button>
          </Stack>
        ) : isFinalTalkTab ? (
          <Button onClick={handleAddFinalTalkRow} variant="contained">
            Ajouter
          </Button>
        ) : (
          <Button onClick={handleGenerate} startIcon={<SparkleIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Générer
          </Button>
        )}
      </Stack>

      {isRiskListingTab ? (
        <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs onChange={(_event, value: TabKey): void => setActiveTab(value)} scrollButtons="auto" sx={{ px: 2.5, pt: 2 }} value={activeTab} variant="scrollable">
              {visibleTabs.map((tab) => (
                <Tab key={tab.key} label={tab.label} value={tab.key} />
              ))}
            </Tabs>
            <Divider sx={{ mt: 2 }} />

            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 12,
                    xs: 12,
                  }}
                >
                  <Stack spacing={2.25}>
                    <Stack direction={{ sm: 'row', xs: 'column' }} justifyContent="space-between" spacing={2} sx={{ alignItems: { sm: 'center', xs: 'flex-start' } }}>
                      <Box>
                        <Typography sx={{ color: '#111827', fontSize: '1.15rem', fontWeight: 700 }}>Table des risques</Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                          Registre structuré des objets auditables, des objectifs de contrôle et des bonnes pratiques à suivre pour les risques ONCF.
                        </Typography>
                      </Box>
                      <Stack alignItems="center" direction="row" spacing={1}>
                        <Chip label={`${riskRows.length} risque(s)`} size="small" />
                        <Chip color={acceptedRiskCount > 0 ? 'success' : 'default'} label={`${acceptedRiskCount} accepte(s)`} size="small" />
                        <Chip color={refusedRiskCount > 0 ? 'error' : 'default'} label={`${refusedRiskCount} refuse(s)`} size="small" />
                        {hasUnsavedChanges ? <Chip color="warning" label="Modifications locales" size="small" /> : null}
                      </Stack>
                    </Stack>

                    <Box
                      ref={riskListingTableRef}
                      sx={{
                        border: '1px solid rgba(148, 163, 184, 0.16)',
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
                        <FullscreenToggleButton isFullscreen={fullscreenSection === 'risk-listing'} onClick={(): void => void toggleSectionFullscreen('risk-listing')} />
                      </Box>
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ minWidth: 1920 }}>
                          <Box
                            sx={{
                              backgroundColor: '#f8fafc',
                              display: 'grid',
                              gap: 1.5,
                              gridTemplateColumns:
                                '120px minmax(170px, 1.15fr) minmax(170px, 1.15fr) minmax(220px, 1.4fr) minmax(240px, 1.55fr) 160px 130px minmax(220px, 1.45fr) 150px 90px',
                              px: 2,
                              py: 1.6,
                            }}
                          >
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Code</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Objet auditable</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Sous-objet auditable</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Intitulé du risque</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              Objectif opérationnel de contrôle
                            </Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Evaluation du risque</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Impact</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Bonnes pratiques</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>Statut</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>Action</Typography>
                          </Box>
                          <Divider />

                          {riskRows.length > 0 ? (
                            paginatedRiskRows.map((row) => (
                              <React.Fragment key={row.id}>
                                <Box
                                  sx={{
                                    alignItems: 'start',
                                    backgroundColor:
                                      row.decisionStatus === 'Accepte'
                                        ? 'rgba(16, 185, 129, 0.05)'
                                        : row.decisionStatus === 'Refuse'
                                          ? 'rgba(239, 68, 68, 0.05)'
                                          : 'transparent',
                                    display: 'grid',
                                    gap: 1.5,
                                    gridTemplateColumns:
                                      '120px minmax(170px, 1.15fr) minmax(170px, 1.15fr) minmax(220px, 1.4fr) minmax(240px, 1.55fr) 160px 130px minmax(220px, 1.45fr) 150px 90px',
                                    px: 2,
                                    py: 1.8,
                                  }}
                                >
                                  <Typography sx={{ color: '#4f46e5', fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.code}</Typography>
                                  <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.auditableObject}</Typography>
                                  <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.auditableSubObject}</Typography>
                                  <Typography sx={{ color: '#111827', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.risk}</Typography>
                                  <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.operationalControlObjective}</Typography>
                                  <Chip
                                    label={row.riskAssessment}
                                    size="small"
                                    sx={{
                                      alignSelf: 'start',
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
                                      alignSelf: 'start',
                                      backgroundColor: impactFieldBackground[row.impact],
                                      color: impactTextColor[row.impact],
                                      fontWeight: 700,
                                      justifyContent: 'center',
                                      minWidth: 92,
                                    }}
                                  />
                                  <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.controlMeasure}</Typography>
                                  <Stack alignItems="center" direction="row" gap={0.7} sx={{ justifyContent: 'center', justifySelf: 'center' }}>
                                    <IconButton
                                      aria-label={`Accepter ${row.risk}`}
                                      onClick={(): void => handleSetRiskDecisionStatus(row.id, 'Accepte')}
                                      size="small"
                                      sx={{
                                        backgroundColor: row.decisionStatus === 'Accepte' ? '#dcfce7' : 'transparent',
                                        borderRadius: '999px',
                                        boxShadow: 'none',
                                        color: row.decisionStatus === 'Accepte' ? '#4ade80' : '#94a3b8',
                                        height: 28,
                                        width: 28,
                                        '&:hover': {
                                          backgroundColor: row.decisionStatus === 'Accepte' ? '#dcfce7' : '#f8fafc',
                                          boxShadow: 'none',
                                        },
                                      }}
                                    >
                                      <CheckCircleIcon fontSize="0.95rem" weight={row.decisionStatus === 'Accepte' ? 'fill' : 'regular'} />
                                    </IconButton>
                                    <IconButton
                                      aria-label={`Refuser ${row.risk}`}
                                      onClick={(): void => handleSetRiskDecisionStatus(row.id, 'Refuse')}
                                      size="small"
                                      sx={{
                                        backgroundColor: row.decisionStatus === 'Refuse' ? '#fee2e2' : 'transparent',
                                        borderRadius: '999px',
                                        boxShadow: 'none',
                                        color: row.decisionStatus === 'Refuse' ? '#f87171' : '#94a3b8',
                                        height: 28,
                                        width: 28,
                                        '&:hover': {
                                          backgroundColor: row.decisionStatus === 'Refuse' ? '#fee2e2' : '#f8fafc',
                                          boxShadow: 'none',
                                        },
                                      }}
                                    >
                                      <XCircleIcon fontSize="0.95rem" weight={row.decisionStatus === 'Refuse' ? 'fill' : 'regular'} />
                                    </IconButton>
                                  </Stack>
                                  <Stack alignItems="center" direction="row" gap={0.35} sx={{ justifyContent: 'center', justifySelf: 'center' }}>
                                      <Button
                                        color="success"
                                        onClick={(): void => handleSetRiskDecisionStatus(row.id, 'Accepte')}
                                        size="small"
                                        startIcon={<Box component="span" sx={{ fontSize: '0.44rem', lineHeight: 1 }}>{'✔'}</Box>}
                                        sx={{
                                          backgroundColor: row.decisionStatus === 'Accepte' ? '#dcfce7' : '#ffffff',
                                          border: '1px solid',
                                          borderColor: row.decisionStatus === 'Accepte' ? '#86efac' : '#d7dee7',
                                          borderRadius: '999px',
                                          boxShadow: 'none',
                                          color: row.decisionStatus === 'Accepte' ? '#4ade80' : '#86efac',
                                          display: 'none',
                                          fontSize: 0,
                                          height: 18,
                                          minWidth: 18,
                                          p: 0,
                                          width: 18,
                                          '& .MuiButton-startIcon': { alignItems: 'center', display: 'flex', justifyContent: 'center', m: 0 },
                                          '&:hover': {
                                            backgroundColor: '#f0fdf4',
                                            borderColor: '#86efac',
                                            boxShadow: 'none',
                                          },
                                        }}
                                        variant="text"
                                      >
                                        ✔ Accepte
                                      </Button>
                                      <Button
                                        color="error"
                                        onClick={(): void => handleSetRiskDecisionStatus(row.id, 'Refuse')}
                                        size="small"
                                        startIcon={<Box component="span" sx={{ fontSize: '0.44rem', lineHeight: 1 }}>{'✖'}</Box>}
                                        sx={{
                                          backgroundColor: row.decisionStatus === 'Refuse' ? '#fee2e2' : '#ffffff',
                                          border: '1px solid',
                                          borderColor: row.decisionStatus === 'Refuse' ? '#fecaca' : '#d7dee7',
                                          borderRadius: '999px',
                                          boxShadow: 'none',
                                          color: row.decisionStatus === 'Refuse' ? '#f87171' : '#fca5a5',
                                          display: 'none',
                                          fontSize: 0,
                                          height: 18,
                                          minWidth: 18,
                                          p: 0,
                                          width: 18,
                                          '& .MuiButton-startIcon': { alignItems: 'center', display: 'flex', justifyContent: 'center', m: 0 },
                                          '&:hover': {
                                            backgroundColor: '#fef2f2',
                                            borderColor: '#fecaca',
                                            boxShadow: 'none',
                                          },
                                        }}
                                        variant="text"
                                      >
                                        ✖ Refuse
                                      </Button>
                                      <Button
                                        onClick={(): void => handleOpenEditRisk(row)}
                                        size="small"
                                        startIcon={<Box component="span" sx={{ fontSize: '0.72rem', lineHeight: 1 }}>{'✏'}</Box>}
                                        sx={{
                                          backgroundColor: 'transparent',
                                          borderRadius: '999px',
                                          boxShadow: 'none',
                                          color: '#64748b',
                                          fontSize: 0,
                                          height: 28,
                                          minWidth: 28,
                                          p: 0,
                                          width: 28,
                                          '& .MuiButton-startIcon': { alignItems: 'center', display: 'flex', fontSize: '0.72rem', justifyContent: 'center', m: 0 },
                                          '&:hover': {
                                            backgroundColor: '#f8fafc',
                                            boxShadow: 'none',
                                          },
                                        }}
                                        variant="text"
                                      >
                                        ✏ Modifier
                                      </Button>
                                  </Stack>
                                </Box>
                                <Divider />
                              </React.Fragment>
                            ))
                          ) : (
                            <Box sx={{ p: 3 }}>
                              <Typography color="text.secondary">Aucun risque pour le moment. Utilise Ajouter risque pour creer la premiere ligne de risque ONCF.</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ p: 1.75 }}>
                        <SectionPagination
                          onChange={setRiskListingPage}
                          page={riskListingPage}
                          pageCount={riskListingPageCount}
                          pageSize={riskListingPageSize}
                          total={riskRows.length}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    xs: 12,
                  }}
                >
                  <Card
                    sx={{
                      backgroundColor: '#fbfcff',
                      border: '1px solid rgba(148, 163, 184, 0.16)',
                      borderRadius: '22px',
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={2.25}>
                        <Box>
                          <Typography sx={{ color: '#111827', fontSize: '1.08rem', fontWeight: 700 }}>Matrice des risques</Typography>
                          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                            Vue croisee de l impact et de la probabilite pour visualiser les risques les plus sensibles de la mission ONCF.
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'grid', gap: 0.9, gridTemplateColumns: '56px repeat(5, minmax(0, 1fr))' }}>
                          <Box />
                          {probabilityLevels.map((value) => (
                            <Box
                              key={`header-${value}`}
                              sx={{
                                alignItems: 'center',
                                backgroundColor: '#f8fafc',
                                borderRadius: '14px',
                                color: '#475569',
                                display: 'flex',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                justifyContent: 'center',
                                minHeight: 42,
                              }}
                            >
                              {value}
                            </Box>
                          ))}

                          {matrixImpactLevels.flatMap((impact) => {
                            return [
                              <Box
                                key={`label-${impact}`}
                                sx={{
                                  alignItems: 'center',
                                  color: impactTextColor[impact],
                                  display: 'flex',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  justifyContent: 'center',
                                  minHeight: 84,
                                }}
                              >
                                {impact}
                              </Box>,
                              ...probabilityLevels.map((probability) => {
                                const cellRows = riskRows.filter(
                                  (row) => row.impact === impact && clampProbability(row.probability) === probability
                                );

                                return (
                                  <Box
                                    key={`${impact}-${probability}`}
                                    sx={{
                                      backgroundColor: cellRows.length > 0 ? getMatrixCellBackground(impact, probability) : '#f8fafc',
                                      border: '1px solid rgba(148, 163, 184, 0.14)',
                                      borderRadius: '16px',
                                      minHeight: 84,
                                      p: 1,
                                    }}
                                  >
                                    <Typography sx={{ color: '#111827', fontSize: '0.76rem', fontWeight: 700 }}>{cellRows.length}</Typography>
                                    <Stack spacing={0.45} sx={{ mt: 0.6 }}>
                                      {cellRows.slice(0, 2).map((row) => (
                                        <Typography key={row.id} noWrap sx={{ color: '#334155', fontSize: '0.67rem' }}>
                                          {row.risk}
                                        </Typography>
                                      ))}
                                      {cellRows.length > 2 ? (
                                        <Typography sx={{ color: '#475569', fontSize: '0.67rem', fontWeight: 700 }}>
                                          +{cellRows.length - 2}
                                        </Typography>
                                      ) : null}
                                    </Stack>
                                  </Box>
                                );
                              }),
                            ];
                          })}
                        </Box>

                        <Stack spacing={1.2}>
                          {(['Critical', 'High', 'Medium'] as RiskPriority[]).map((priority) => {
                            const matchingRows = riskRows.filter((row) => row.priority === priority);
                            const width = riskRows.length > 0 ? `${(matchingRows.length / riskRows.length) * 100}%` : '0%';

                            return (
                              <Stack key={priority} direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                                <Typography sx={{ color: priorityTextColor[priority], fontSize: '0.76rem', fontWeight: 700, minWidth: 54 }}>
                                  {priority}
                                </Typography>
                                <Box sx={{ backgroundColor: '#e5e7eb', borderRadius: '999px', flex: '1 1 auto', height: 8, overflow: 'hidden' }}>
                                  <Box
                                    sx={{
                                      backgroundColor: priorityTone[priority].background,
                                      borderRadius: '999px',
                                      height: '100%',
                                      width,
                                    }}
                                  />
                                </Box>
                                <Typography sx={{ color: '#111827', fontSize: '0.76rem', fontWeight: 700 }}>{matchingRows.length}</Typography>
                              </Stack>
                            );
                          })}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      ) : isAuditPlanningTab ? (
        <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs onChange={(_event, value: TabKey): void => setActiveTab(value)} scrollButtons="auto" sx={{ px: 2.5, pt: 2 }} value={activeTab} variant="scrollable">
              {visibleTabs.map((tab) => (
                <Tab key={tab.key} label={tab.label} value={tab.key} />
              ))}
            </Tabs>
            <Divider sx={{ mt: 2 }} />

            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  {[
                    {
                      accent: '#2563eb',
                      surface: 'rgba(37, 99, 235, 0.06)',
                      badge: 'Vision globale',
                      helper: 'Couverture globale de la mission',
                      label: 'Total des tests',
                      value: `${auditTests.length}`,
                    },
                    {
                      accent: '#16a34a',
                      surface: 'rgba(22, 163, 74, 0.06)',
                      badge: 'Execution',
                      helper: `${closedAuditTestsPercentage}% du programme`,
                      label: 'Tests clôturés',
                      value: `${closedAuditTests}`,
                    },
                    {
                      accent: '#d97706',
                      surface: 'rgba(217, 119, 6, 0.08)',
                      badge: 'Suivi actif',
                      helper: 'Execution en cours',
                      label: 'Tests en cours',
                      value: `${inProgressAuditTests}`,
                    },
                    {
                      accent: '#475569',
                      surface: 'rgba(71, 85, 105, 0.07)',
                      badge: 'Backlog',
                      helper: 'A lancer',
                      label: 'Tests ouverts',
                      value: `${openAuditTests}`,
                    },
                  ].map((item) => (
                    <Grid key={item.label} size={{ lg: 3, md: 6, xs: 12 }}>
                      <Card
                        sx={{
                          backgroundColor: '#ffffff',
                          border: '1px solid rgba(148, 163, 184, 0.14)',
                          borderRadius: '22px',
                          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)',
                          height: '100%',
                        }}
                      >
                        <CardContent sx={{ p: 2.25 }}>
                          <Stack spacing={1.25}>
                            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                              <Chip
                                label={item.badge}
                                size="small"
                                sx={{
                                  backgroundColor: item.surface,
                                  color: item.accent,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                }}
                              />
                              <Box sx={{ backgroundColor: item.accent, borderRadius: '999px', height: 9, width: 9 }} />
                            </Stack>
                            <Typography sx={{ color: '#64748b', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              {item.label}
                            </Typography>
                            <Typography sx={{ color: '#111827', fontSize: '1.7rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{item.value}</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: '0.81rem', lineHeight: 1.6 }}>
                              {item.helper}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Card
                  ref={auditPlanningTableRef}
                  sx={{
                    border: '1px solid rgba(148, 163, 184, 0.14)',
                    borderRadius: '22px',
                    boxShadow: 'none',
                    position: 'relative',
                    '&:fullscreen': {
                      backgroundColor: '#ffffff',
                      borderRadius: 0,
                      height: '100%',
                      overflow: 'auto',
                      pb: 1.5,
                      pt: 6,
                      px: 1.5,
                    },
                  }}
                >
                  <Box sx={{ position: 'absolute', right: 12, top: 12, zIndex: 3 }}>
                    <FullscreenToggleButton isFullscreen={fullscreenSection === 'audit-planning'} onClick={(): void => void toggleSectionFullscreen('audit-planning')} />
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2.25}>
                      <Stack direction={{ sm: 'row', xs: 'column' }} justifyContent="space-between" spacing={2} sx={{ alignItems: { sm: 'center', xs: 'flex-start' } }}>
                        <Box>
                          <Typography sx={{ color: '#111827', fontSize: '1.15rem', fontWeight: 700 }}>Programme de vérification (tests)</Typography>
                          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                            Organise les contrôles d’audit, suis leur avancement, documente les anomalies et mesure le niveau de conformité de la mission ONCF.
                          </Typography>
                        </Box>
                        <Stack alignItems="center" direction="row" spacing={1}>
                          <Chip label={planningView === 'list' ? 'List View' : 'Gantt View'} size="small" />
                          {hasUnsavedChanges ? <Chip color="warning" label="Modifications locales" size="small" /> : null}
                        </Stack>
                      </Stack>

                      {planningView === 'list' ? (
                        <Box sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '20px', overflow: 'hidden' }}>
                          <Box sx={{ overflowX: 'auto' }}>
                            <Table sx={{ minWidth: 2200 }}>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 120 }}>N du test</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 280 }}>Tache</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 220 }}>Objectif</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 240 }}>Methodologie</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 180 }}>Auditeur responsable</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 140 }}>Statut</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 140 }}>Date de debut</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 140 }}>Date de fin</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 240 }}>Commentaires</TableCell>
                                  <TableCell align="center" sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 72 }} />
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {paginatedAuditTests.map((row) => {
                                  const statusTone = getAuditStatusTone(row.status);

                                  return (
                                    <TableRow key={row.id}>
                                      <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Typography sx={{ color: '#111827', fontSize: '0.875rem', fontWeight: 700 }}>{row.testNumber}</Typography>
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Typography sx={{ color: '#111827', fontSize: '0.875rem', lineHeight: 1.6 }}>{row.controlDescription}</Typography>
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Typography sx={{ color: '#111827', fontSize: '0.875rem', lineHeight: 1.6 }}>{row.objective}</Typography>
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Typography sx={{ color: '#111827', fontSize: '0.875rem', lineHeight: 1.6 }}>{row.methodology}</Typography>
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Typography sx={{ color: '#111827', fontSize: '0.875rem' }}>{row.auditor}</Typography>
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Chip
                                          label={row.status}
                                          size="small"
                                          sx={{
                                            backgroundColor: statusTone.background,
                                            color: statusTone.text,
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Typography sx={{ color: '#111827', fontSize: '0.875rem' }}>{formatCompactDate(row.startDate)}</Typography>
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Typography sx={{ color: '#111827', fontSize: '0.875rem' }}>{formatCompactDate(row.endDate)}</Typography>
                                      </TableCell>
                                      <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Typography sx={{ color: '#111827', fontSize: '0.875rem', lineHeight: 1.6 }}>{row.comments}</Typography>
                                      </TableCell>
                                      <TableCell align="center" sx={{ verticalAlign: 'top' }}>
                                        <IconButton aria-label="Ouvrir le menu du test" onClick={(event): void => handleOpenAuditTestMenu(event, row)} size="small">
                                          <DotsThreeOutlineVerticalIcon fontSize="var(--icon-fontSize-md)" />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '20px', overflow: 'hidden' }}>
                          <Box
                            sx={{
                              alignItems: { md: 'center', xs: 'flex-start' },
                              backgroundColor: '#f8fafc',
                              display: 'flex',
                              flexDirection: { md: 'row', xs: 'column' },
                              gap: 1.5,
                              justifyContent: 'space-between',
                              px: 2.25,
                              py: 1.6,
                            }}
                          >
                            <Box>
                              <Typography sx={{ color: '#111827', fontSize: '0.98rem', fontWeight: 700 }}>Planning visuel des tests</Typography>
                              <Typography sx={{ color: '#475569', fontSize: '0.86rem', mt: 0.45 }}>
                                Vue structuree du programme avec les tests, les responsables, le statut et les periodes planifiees.
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                              <Chip label={ganttMonthLabel || 'Planning en cours'} size="small" />
                              <Chip color="info" label={`${auditTests.length} tests`} size="small" />
                            </Stack>
                          </Box>
                          {ganttDateKeys.length > 0 ? (
                            <Box sx={{ p: 2 }}>
                              <Box sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '18px', overflow: 'hidden' }}>
                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: `210px 140px 120px minmax(0, 1fr)`,
                                  }}
                                >
                                  <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid rgba(148, 163, 184, 0.14)', color: '#334155', fontSize: '0.8rem', fontWeight: 700, px: 2, py: 1.5 }}>
                                    Nom du test
                                  </Box>
                                  <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid rgba(148, 163, 184, 0.14)', color: '#334155', fontSize: '0.8rem', fontWeight: 700, px: 2, py: 1.5 }}>
                                    Auditeur
                                  </Box>
                                  <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid rgba(148, 163, 184, 0.14)', color: '#334155', fontSize: '0.8rem', fontWeight: 700, px: 2, py: 1.5 }}>
                                    Statut
                                  </Box>
                                  <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid rgba(148, 163, 184, 0.14)', px: 1.2, py: 1.2 }}>
                                    <Typography sx={{ color: '#334155', fontSize: '0.78rem', fontWeight: 700, mb: 1, textAlign: 'center', textTransform: 'capitalize' }}>
                                      {ganttMonthLabel}
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${ganttDateKeys.length}, minmax(0, 1fr))` }}>
                                      {ganttDateKeys.map((dateKey) => (
                                        <Box
                                          key={dateKey}
                                          sx={{
                                            alignItems: 'center',
                                            backgroundColor: dateKey === todayDateKey ? '#eef2ff' : '#f8fafc',
                                            borderLeft: '1px solid rgba(148, 163, 184, 0.12)',
                                            color: dateKey === todayDateKey ? '#4338ca' : '#475569',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            minHeight: 64,
                                            px: 0.35,
                                          }}
                                        >
                                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{formatGanttDayLabel(dateKey)}</Typography>
                                          <Typography sx={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>{formatGanttWeekdayLabel(dateKey)}</Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>

                                  {paginatedAuditTests.map((row, index) => {
                                    const startDate = parseDateInput(row.startDate);
                                    const endDate = parseDateInput(row.endDate);
                                    const rangeStart = startDate && endDate && startDate > endDate ? endDate : startDate;
                                    const rangeEnd = startDate && endDate && startDate > endDate ? startDate : endDate;
                                    const startIndex = rangeStart ? ganttDateKeys.indexOf(formatDateKey(rangeStart)) : -1;
                                    const endIndex = rangeEnd ? ganttDateKeys.indexOf(formatDateKey(rangeEnd)) : -1;
                                    const statusTone = getAuditStatusTone(row.status);
                                    const rowBackground = index % 2 === 0 ? '#ffffff' : '#fcfdff';

                                    return (
                                      <React.Fragment key={row.id}>
                                        <Box sx={{ backgroundColor: rowBackground, borderBottom: '1px solid rgba(148, 163, 184, 0.14)', px: 2, py: 1.5 }}>
                                          <Typography sx={{ color: '#2563eb', fontSize: '0.86rem', fontWeight: 700 }}>{row.testNumber}</Typography>
                                          <Typography sx={{ color: '#111827', fontSize: '0.84rem', lineHeight: 1.55, mt: 0.4 }}>
                                            {row.controlDescription}
                                          </Typography>
                                        </Box>
                                        <Box sx={{ alignItems: 'center', backgroundColor: rowBackground, borderBottom: '1px solid rgba(148, 163, 184, 0.14)', display: 'flex', px: 2, py: 1.5 }}>
                                          <Typography sx={{ color: '#334155', fontSize: '0.84rem' }}>{row.auditor}</Typography>
                                        </Box>
                                        <Box sx={{ alignItems: 'center', backgroundColor: rowBackground, borderBottom: '1px solid rgba(148, 163, 184, 0.14)', display: 'flex', px: 2, py: 1.5 }}>
                                          <Chip
                                            label={row.status}
                                            size="small"
                                            sx={{
                                              backgroundColor: statusTone.background,
                                              color: statusTone.text,
                                              fontWeight: 700,
                                            }}
                                          />
                                        </Box>
                                        <Box sx={{ backgroundColor: rowBackground, borderBottom: '1px solid rgba(148, 163, 184, 0.14)', px: 1.2, py: 1 }}>
                                          <Box
                                            sx={{
                                              display: 'grid',
                                              gridTemplateColumns: `repeat(${ganttDateKeys.length}, minmax(0, 1fr))`,
                                              position: 'relative',
                                            }}
                                          >
                                            {ganttDateKeys.map((dateKey) => (
                                              <Box
                                                key={`${row.id}-${dateKey}`}
                                                sx={{
                                                  backgroundColor: dateKey === todayDateKey ? 'rgba(99, 102, 241, 0.06)' : '#f8fafc',
                                                  borderLeft: '1px solid rgba(148, 163, 184, 0.12)',
                                                  minHeight: 64,
                                                }}
                                              />
                                            ))}
                                            {startIndex >= 0 && endIndex >= startIndex ? (
                                              <Box
                                                sx={{
                                                  alignItems: 'center',
                                                  alignSelf: 'center',
                                                  backgroundColor: statusTone.background,
                                                  border: '1px solid rgba(99, 102, 241, 0.08)',
                                                  borderRadius: '10px',
                                                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.10)',
                                                  color: statusTone.text,
                                                  display: 'flex',
                                                  fontSize: '0.72rem',
                                                  fontWeight: 700,
                                                  gridColumn: `${startIndex + 1} / ${endIndex + 2}`,
                                                  gridRow: 1,
                                                  height: 30,
                                                  justifyContent: 'center',
                                                  mx: 0.45,
                                                  px: 0.8,
                                                  zIndex: 1,
                                                }}
                                              >
                                                {`${formatCompactDate(row.startDate)} - ${formatCompactDate(row.endDate)}`}
                                              </Box>
                                            ) : (
                                              <Box
                                                sx={{
                                                  alignItems: 'center',
                                                  alignSelf: 'center',
                                                  border: '1px dashed rgba(148, 163, 184, 0.5)',
                                                  borderRadius: '10px',
                                                  color: '#64748b',
                                                  display: 'flex',
                                                  fontSize: '0.72rem',
                                                  fontWeight: 700,
                                                  gridColumn: `1 / ${ganttDateKeys.length + 1}`,
                                                  gridRow: 1,
                                                  height: 30,
                                                  justifyContent: 'center',
                                                  mx: 0.45,
                                                  px: 0.8,
                                                  zIndex: 1,
                                                }}
                                              >
                                                Non planifie
                                              </Box>
                                            )}
                                          </Box>
                                        </Box>
                                      </React.Fragment>
                                    );
                                  })}
                                </Box>
                              </Box>

                              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', mt: 1.6 }}>
                                {[
                                  { color: '#dcfce7', label: 'Cloture', text: '#166534' },
                                  { color: '#dbeafe', label: 'En cours', text: '#1d4ed8' },
                                  { color: '#fef3c7', label: 'Ouvert', text: '#b45309' },
                                ].map((item) => (
                                  <Stack key={item.label} alignItems="center" direction="row" spacing={0.75}>
                                    <Box sx={{ backgroundColor: item.color, borderRadius: '4px', height: 12, width: 12 }} />
                                    <Typography sx={{ color: item.text, fontSize: '0.76rem', fontWeight: 700 }}>{item.label}</Typography>
                                  </Stack>
                                ))}
                              </Stack>
                            </Box>
                          ) : (
                            <Box sx={{ p: 3 }}>
                              <Typography color="text.secondary">Aucune date exploitable pour afficher la vue Gantt.</Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      <SectionPagination
                        onChange={setAuditPlanningPage}
                        page={auditPlanningPage}
                        pageCount={auditPlanningPageCount}
                        pageSize={auditPlanningPageSize}
                        total={auditTests.length}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      ) : isOrientationReportTab ? (
        <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs onChange={(_event, value: TabKey): void => setActiveTab(value)} scrollButtons="auto" sx={{ px: 2.5, pt: 2 }} value={activeTab} variant="scrollable">
              {visibleTabs.map((tab) => (
                <Tab key={tab.key} label={tab.label} value={tab.key} />
              ))}
            </Tabs>
            <Divider sx={{ mt: 2 }} />

            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 7,
                    xs: 12,
                  }}
                >
                  <Stack spacing={2.5}>
                <Card
                  sx={{
                    border: '1px solid rgba(148, 163, 184, 0.14)',
                    borderRadius: '22px',
                    boxShadow: 'none',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography sx={{ color: '#111827', fontSize: '1.08rem', fontWeight: 700 }}>Rappel des objectifs generaux de la mission</Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.6 }}>
                              Rubriques reprises du rapport Word : préoccupations, objectifs à atteindre et bénéfices attendus de la mission.
                            </Typography>
                          </Box>
                          <TextField
                            fullWidth
                            label="Préoccupations du demandeur / objectifs à atteindre"
                            minRows={4}
                            multiline
                            onChange={handleOrientationFieldChange('objective')}
                            value={orientationReport.objective}
                          />
                          <TextField
                            fullWidth
                            label="Bénéfices attendus des recommandations de l’audit"
                            minRows={3}
                            multiline
                            onChange={handleOrientationFieldChange('expectedBenefits')}
                            value={orientationReport.expectedBenefits}
                          />
                          <TextField
                            fullWidth
                            label="Préoccupations des principaux responsables audités"
                            minRows={3}
                            multiline
                            onChange={handleOrientationFieldChange('auditeeConcerns')}
                            value={orientationReport.auditeeConcerns}
                          />
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '22px', boxShadow: 'none' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                          <Typography sx={{ color: '#111827', fontSize: '1.08rem', fontWeight: 700 }}>Éléments identifiés lors de la phase d’étude</Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ md: 6, xs: 12 }}>
                              <TextField
                                fullWidth
                                label="Entite concernee"
                                onChange={handleOrientationFieldChange('entity')}
                                select
                                value={orientationReport.entity}
                              >
                                {orientationEntities.map((entity) => (
                                  <MenuItem key={entity} value={entity}>
                                    {entity}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                              <TextField
                                fullWidth
                                label="Niveau d urgence"
                                onChange={handleOrientationFieldChange('urgency')}
                                select
                                value={orientationReport.urgency}
                              >
                                {orientationUrgencyOptions.map((urgency) => (
                                  <MenuItem key={urgency} value={urgency}>
                                    {urgency}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                          </Grid>
                          <TextField
                            fullWidth
                            label="Donnees chiffrees et evolution"
                            minRows={4}
                            multiline
                            onChange={handleOrientationFieldChange('metrics')}
                            value={orientationReport.metrics}
                          />
                          <TextField
                            fullWidth
                            label="Caractéristiques"
                            minRows={3}
                            multiline
                            onChange={handleOrientationFieldChange('characteristics')}
                            value={orientationReport.characteristics}
                          />
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '22px', boxShadow: 'none' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography sx={{ color: '#111827', fontSize: '1.08rem', fontWeight: 700 }}>Axe de travail et d’investigations de l’audit</Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.6 }}>
                              Limites du champ d audit et description des objectifs retenus, comme dans le tableau du document Word.
                            </Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ color: '#111827', fontSize: '0.94rem', fontWeight: 700, mb: 1 }}>Périmètre d application</Typography>
                            <Grid container spacing={1.5}>
                              {orientationScopeOptions.map((scopeItem) => (
                                <Grid key={scopeItem} size={{ md: 6, xs: 12 }}>
                                  <Box sx={{ backgroundColor: '#f8fafc', border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '16px', px: 1.5, py: 1 }}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={orientationReport.scope.includes(scopeItem)}
                                          onChange={(): void => {
                                            handleToggleOrientationScope(scopeItem);
                                          }}
                                        />
                                      }
                                      label={scopeItem}
                                      sx={{ m: 0, width: '100%' }}
                                    />
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                          <TextField
                            fullWidth
                            label="Limites ou exclusions éventuelles du champ de l’audit"
                            minRows={3}
                            multiline
                            onChange={handleOrientationFieldChange('exclusions')}
                            value={orientationReport.exclusions}
                          />
                          <Stack direction={{ sm: 'row', xs: 'column' }} justifyContent="space-between" spacing={2} sx={{ alignItems: { sm: 'center', xs: 'flex-start' } }}>
                            <Typography sx={{ color: '#111827', fontSize: '0.94rem', fontWeight: 700 }}>
                              Description des objectifs d audit
                            </Typography>
                            <Button onClick={handleAddOrientationObjectiveRow} variant="outlined">
                              Ajouter une ligne
                            </Button>
                          </Stack>
                          <Box sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '18px', overflow: 'hidden' }}>
                            <Box sx={{ overflowX: 'auto' }}>
                              <Table sx={{ minWidth: 720 }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Objectifs d’audit retenus</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Risques associés</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, width: 72 }}>
                                      Action
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {orientationReport.objectiveRows.map((row) => (
                                    <TableRow key={row.id}>
                                      <TableCell sx={{ minWidth: 320, verticalAlign: 'top' }}>
                                        <TextField
                                          fullWidth
                                          minRows={3}
                                          multiline
                                          onChange={handleOrientationObjectiveRowChange(row.id, 'objective')}
                                          size="small"
                                          value={row.objective}
                                        />
                                      </TableCell>
                                      <TableCell sx={{ minWidth: 320, verticalAlign: 'top' }}>
                                        <TextField
                                          fullWidth
                                          minRows={3}
                                          multiline
                                          onChange={handleOrientationObjectiveRowChange(row.id, 'risk')}
                                          size="small"
                                          value={row.risk}
                                        />
                                      </TableCell>
                                      <TableCell align="center" sx={{ verticalAlign: 'top' }}>
                                        <IconButton aria-label="Supprimer la ligne" color="error" onClick={(): void => handleRemoveOrientationObjectiveRow(row.id)}>
                                          <TrashIcon fontSize="var(--icon-fontSize-md)" />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Card sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '18px', boxShadow: 'none' }}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Progression</Typography>
                            <Typography sx={{ color: '#111827', fontSize: '1.8rem', fontWeight: 700, mt: 1 }}>{orientationProgress}%</Typography>
                            <Box sx={{ backgroundColor: '#e5e7eb', borderRadius: '999px', height: 10, mt: 1.5, overflow: 'hidden' }}>
                              <Box sx={{ backgroundColor: '#4f46e5', borderRadius: '999px', height: '100%', width: `${orientationProgress}%` }} />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>

                <Grid size={{ lg: 5, xs: 12 }}>
                  <Card sx={{ backgroundColor: '#fbfcff', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '22px', boxShadow: 'none', position: 'sticky', top: 88 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={2.2}>
                        <Box>
                          <Typography sx={{ color: '#111827', fontSize: '1.08rem', fontWeight: 700 }}>Aperçu du rapport</Typography>
                          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                            Resume instantane de la fiche d orientation ONCF construite a partir de la trame du rapport Word.
                          </Typography>
                        </Box>

                        <Box sx={{ backgroundColor: '#ffffff', border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '18px', p: 2 }}>
                          <Stack spacing={1.6}>
                            <Box>
                              <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Objectif principal</Typography>
                              <Typography sx={{ color: '#111827', lineHeight: 1.8, mt: 0.7 }}>
                                {orientationReport.objective.trim() || 'Aucun objectif renseigne pour le moment.'}
                              </Typography>
                            </Box>

                            <Divider />

                            <Box>
                              <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Benefices attendus</Typography>
                              <Typography sx={{ color: '#111827', lineHeight: 1.8, mt: 0.7 }}>
                                {orientationReport.expectedBenefits.trim() || 'Aucun benefice attendu renseigne pour le moment.'}
                              </Typography>
                            </Box>

                            <Divider />

                            <Box>
                              <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Impact</Typography>
                              <Typography sx={{ color: '#111827', fontWeight: 700, mt: 0.7 }}>
                                {getOrientationImpactLabel(orientationReport.urgency)}
                              </Typography>
                            </Box>

                            <Divider />

                            <Box>
                              <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Statut</Typography>
                              <Chip
                                label={currentState.isValidated ? 'Soumis' : currentState.savedAt ? 'Brouillon enregistré' : 'En préparation'}
                                size="small"
                                sx={{
                                  backgroundColor: currentState.isValidated ? '#dcfce7' : '#eef2ff',
                                  color: currentState.isValidated ? '#166534' : '#4338ca',
                                  fontWeight: 700,
                                  mt: 0.9,
                                }}
                              />
                            </Box>

                            <Divider />

                            <Box>
                              <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Périmètre valide</Typography>
                              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                                {orientationReport.scope.length > 0 ? (
                                  orientationReport.scope.map((item) => (
                                    <Chip key={item} label={item} size="small" />
                                  ))
                                ) : (
                                  <Typography color="text.secondary">Aucun périmètre validé pour le moment.</Typography>
                                )}
                              </Stack>
                            </Box>

                            <Divider />

                            <Box>
                              <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Objectifs d’audit retenus</Typography>
                              <Stack spacing={0.8} sx={{ mt: 1 }}>
                                {orientationReport.objectiveRows.slice(0, 3).map((row) => (
                                  <Box key={row.id} sx={{ backgroundColor: '#f8fafc', borderRadius: '12px', p: 1.2 }}>
                                    <Typography sx={{ color: '#111827', fontSize: '0.86rem', fontWeight: 700 }}>{row.objective}</Typography>
                                    <Typography color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.35 }}>
                                      Risque associe : {row.risk}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      ) : isFinalTalkTab ? (
        <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs onChange={(_event, value: TabKey): void => setActiveTab(value)} scrollButtons="auto" sx={{ px: 2.5, pt: 2 }} value={activeTab} variant="scrollable">
              {visibleTabs.map((tab) => (
                <Tab key={tab.key} label={tab.label} value={tab.key} />
              ))}
            </Tabs>
            <Divider sx={{ mt: 2 }} />

            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 12,
                    xs: 12,
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction={{ sm: 'row', xs: 'column' }} justifyContent="space-between" spacing={2} sx={{ alignItems: { sm: 'center', xs: 'flex-start' } }}>
                      <Box>
                        <Typography sx={{ color: '#111827', fontSize: '1.15rem', fontWeight: 700 }}>Tableau des risques</Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                          Registre structuré des objets auditables, des objectifs de contrôle, du niveau de risque et des mesures en place pour la réunion finale.
                        </Typography>
                      </Box>
                      <Stack alignItems="center" direction="row" spacing={1}>
                        <Chip label={`${finalTalkRows.length} risque(s)`} size="small" />
                      </Stack>
                    </Stack>

                    <Box
                      ref={finalTalkTableRef}
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
                        <FullscreenToggleButton isFullscreen={fullscreenSection === 'final-talk'} onClick={(): void => void toggleSectionFullscreen('final-talk')} />
                      </Box>
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ minWidth: 1700 }}>
                          <Box
                            sx={{
                              backgroundColor: '#f8fafc',
                              display: 'grid',
                              gap: 1.5,
                              gridTemplateColumns:
                                '120px minmax(170px, 1.15fr) minmax(170px, 1.15fr) minmax(220px, 1.4fr) minmax(240px, 1.55fr) 160px 130px minmax(220px, 1.45fr) 72px',
                              px: 2,
                              py: 1.6,
                            }}
                          >
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Code</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Objet auditable</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Sous-objet auditable</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Intitulé du risque</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              Objectif opérationnel de contrôle
                            </Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Evaluation du risque</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Impact</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Bonnes pratiques</Typography>
                            <Typography sx={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>
                              Menu
                            </Typography>
                          </Box>
                          <Divider />

                          {paginatedFinalTalkRows.map((row) => (
                            <React.Fragment key={row.id}>
                              <Box
                                sx={{
                                  alignItems: 'start',
                                  display: 'grid',
                                  gap: 1.5,
                                  gridTemplateColumns:
                                    '120px minmax(170px, 1.15fr) minmax(170px, 1.15fr) minmax(220px, 1.4fr) minmax(240px, 1.55fr) 160px 130px minmax(220px, 1.45fr) 72px',
                                  px: 2,
                                  py: 1.7,
                                }}
                              >
                                <Typography sx={{ color: '#4f46e5', fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.code}</Typography>
                                <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.auditableObject}</Typography>
                                <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.auditableSubObject}</Typography>
                                <Typography sx={{ color: '#111827', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.title}</Typography>
                                <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.operationalControlObjective}</Typography>
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
                                <Typography sx={{ color: '#334155', fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.6, wordBreak: 'break-word' }}>{row.controlMeasure}</Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                  <IconButton aria-label="Ouvrir le menu TaRi" onClick={(event): void => handleOpenFinalTalkMenu(event, row)}>
                                    <DotsThreeOutlineVerticalIcon fontSize="var(--icon-fontSize-md)" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Divider />
                            </React.Fragment>
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ p: 1.75 }}>
                        <SectionPagination
                          onChange={setFinalTalkPage}
                          page={finalTalkPage}
                          pageCount={finalTalkPageCount}
                          pageSize={finalTalkPageSize}
                          total={finalTalkRows.length}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    xs: 12,
                  }}
                >
                  <Card
                    sx={{
                      backgroundColor: '#fbfcff',
                      border: '1px solid rgba(148, 163, 184, 0.16)',
                      borderRadius: '22px',
                      boxShadow: 'none',
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={2.25}>
                        <Box>
                          <Typography sx={{ color: '#111827', fontSize: '1.08rem', fontWeight: 700 }}>Matrice des risques</Typography>
                          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                            Matrice visuelle des risques selon la criticite et la probabilite de traitement.
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'grid', gap: 0.9, gridTemplateColumns: '56px repeat(5, minmax(0, 1fr))' }}>
                          <Box />
                          {probabilityLevels.map((value) => (
                            <Box
                              key={`final-header-${value}`}
                              sx={{
                                alignItems: 'center',
                                backgroundColor: '#f8fafc',
                                borderRadius: '14px',
                                color: '#475569',
                                display: 'flex',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                justifyContent: 'center',
                                minHeight: 42,
                              }}
                            >
                              {value}
                            </Box>
                          ))}

                          {matrixImpactLevels.flatMap((impact) => {
                            return [
                              <Box
                                key={`final-label-${impact}`}
                                sx={{
                                  alignItems: 'center',
                                  color: impactTextColor[impact],
                                  display: 'flex',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  justifyContent: 'center',
                                  minHeight: 84,
                                }}
                              >
                                {impact}
                              </Box>,
                              ...probabilityLevels.map((probability) => {
                                const cellRows = finalTalkRows.filter(
                                  (row) => row.impact === impact && clampProbability(row.probability) === probability
                                );

                                return (
                                  <Box
                                    key={`final-${impact}-${probability}`}
                                    sx={{
                                      backgroundColor: cellRows.length > 0 ? getMatrixCellBackground(impact, probability) : '#f8fafc',
                                      border: '1px solid rgba(148, 163, 184, 0.14)',
                                      borderRadius: '16px',
                                      minHeight: 84,
                                      p: 1,
                                    }}
                                  >
                                    <Typography sx={{ color: '#111827', fontSize: '0.76rem', fontWeight: 700 }}>{cellRows.length}</Typography>
                                    <Stack spacing={0.45} sx={{ mt: 0.6 }}>
                                      {cellRows.slice(0, 2).map((row) => (
                                        <Typography key={row.id} noWrap sx={{ color: '#334155', fontSize: '0.67rem' }}>
                                          {row.code}
                                        </Typography>
                                      ))}
                                      {cellRows.length > 2 ? (
                                        <Typography sx={{ color: '#475569', fontSize: '0.67rem', fontWeight: 700 }}>
                                          +{cellRows.length - 2}
                                        </Typography>
                                      ) : null}
                                    </Stack>
                                  </Box>
                                );
                              }),
                            ];
                          })}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs onChange={(_event, value: TabKey): void => setActiveTab(value)} scrollButtons="auto" sx={{ px: 2.5, pt: 2 }} value={activeTab} variant="scrollable">
              {visibleTabs.map((tab) => (
                <Tab key={tab.key} label={tab.label} value={tab.key} />
              ))}
            </Tabs>
            <Divider sx={{ mt: 2 }} />

            <Stack spacing={3} sx={{ p: 3 }}>
              <Stack direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={2} sx={{ alignItems: { md: 'center', xs: 'flex-start' } }}>
                <Box>
                  <Typography sx={{ color: '#111827', fontSize: '1.15rem', fontWeight: 700 }}>Cadres générés</Typography>
                </Box>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Chip color={currentState.isGenerated ? 'success' : 'default'} label={currentState.isGenerated ? 'Génération terminée' : 'Génération en attente'} size="small" />
                  <Chip color={currentState.isValidated ? 'success' : 'default'} label={currentState.isValidated ? 'Onglet valide' : 'Validation en attente'} size="small" />
                  {hasUnsavedChanges ? <Chip color="warning" label="Modifications locales" size="small" /> : null}
                </Stack>
              </Stack>
              {activeTab === 'knowledge' ? (
                <KnowledgeReferencePanel aiLabel={aiLabel} isGenerated={currentState.isGenerated} />
              ) : (
                <Card sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '20px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)' }}>
                  <CardContent sx={{ p: 0 }}>
                    <Tabs
                      onChange={(_event, value: string): void => setActiveKnowledgeCardId(value)}
                      scrollButtons="auto"
                      sx={{ px: 2.5, pt: 2 }}
                      value={activeKnowledgeCard?.id ?? false}
                      variant="scrollable"
                    >
                      {cards.map((card) => (
                        <Tab key={card.id} label={card.title} value={card.id} />
                      ))}
                    </Tabs>
                    <Divider sx={{ mt: 2 }} />

                    {activeKnowledgeCard ? (
                      <Stack spacing={2.5} sx={{ p: 2.5 }}>
                        <Stack alignItems="flex-start" direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={1.5}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: '#111827', fontSize: '1.05rem', fontWeight: 700 }}>{activeKnowledgeCard.title}</Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.55 }}>
                              {activeKnowledgeCard.category}
                            </Typography>
                          </Box>
                          <Chip label={aiLabel} size="small" sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 700 }} />
                        </Stack>

                        <Box sx={{ backgroundColor: '#f8fafc', borderRadius: '16px', p: 1.9 }}>
                          <Typography sx={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.8 }}>{activeKnowledgeCard.summary}</Typography>
                        </Box>

                        <Box sx={{ backgroundColor: '#ffffff', border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '16px', p: 1.9 }}>
                          <Typography sx={{ color: '#111827', lineHeight: 1.9 }}>{activeKnowledgeCard.detail}</Typography>
                        </Box>

                        <Button
                          onClick={(): void => setSelectedCardId(activeKnowledgeCard.id)}
                          startIcon={<EyeIcon fontSize="var(--icon-fontSize-md)" />}
                          sx={{ alignSelf: 'flex-start' }}
                          variant="outlined"
                        >
                          Ouvrir le detail
                        </Button>
                      </Stack>
                    ) : null}
                  </CardContent>
                </Card>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {isRiskListingTab ? (
        <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack alignItems={{ md: 'center', xs: 'flex-start' }} direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography sx={{ color: '#111827', fontSize: '1.12rem', fontWeight: 700 }}>Actions de l onglet</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {currentState.savedAt ? `Dernier brouillon : ${formatDate(currentState.savedAt)}` : 'Aucun brouillon enregistré pour le moment.'}
                </Typography>
                {currentState.validatedAt ? <Typography color="text.secondary" sx={{ mt: 0.5 }}>Valide le {formatDate(currentState.validatedAt)} par {currentState.validatedBy}</Typography> : null}
              </Box>

              <Stack direction="row" spacing={1.25}>
                <Button onClick={handleSaveRiskDraft} variant="outlined">Brouillon</Button>
                <Button onClick={handleSave} startIcon={<FloppyDiskIcon fontSize="var(--icon-fontSize-md)" />} variant="outlined">Enregistrer</Button>
                <Button onClick={handleValidate} variant="contained">Valider</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : isAuditPlanningTab ? (
        <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack alignItems={{ md: 'center', xs: 'flex-start' }} direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography sx={{ color: '#111827', fontSize: '1.12rem', fontWeight: 700 }}>Statut du programme de vérification</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {currentState.savedAt ? `Dernier enregistrement : ${formatDate(currentState.savedAt)}` : 'Aucun enregistrement effectué pour ce programme.'}
                </Typography>
                {currentState.validatedAt ? <Typography color="text.secondary" sx={{ mt: 0.5 }}>Valide le {formatDate(currentState.validatedAt)} par {currentState.validatedBy}</Typography> : null}
              </Box>

              <Stack direction="row" spacing={1.25}>
                <Button onClick={handleSave} startIcon={<FloppyDiskIcon fontSize="var(--icon-fontSize-md)" />} variant="outlined">Enregistrer</Button>
                <Button onClick={handleValidate} variant="contained">Valider</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : isOrientationReportTab ? null : isFinalTalkTab ? (
        <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack alignItems={{ md: 'center', xs: 'flex-start' }} direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography sx={{ color: '#111827', fontSize: '1.12rem', fontWeight: 700 }}>Statut du TaRi final</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {currentState.savedAt ? `Dernier brouillon : ${formatDate(currentState.savedAt)}` : 'Aucun brouillon enregistré pour le moment.'}
                </Typography>
                {currentState.validatedAt ? <Typography color="text.secondary" sx={{ mt: 0.5 }}>Valide le {formatDate(currentState.validatedAt)} par {currentState.validatedBy}</Typography> : null}
              </Box>

              <Stack direction="row" spacing={1.25}>
                <Button
                  onClick={handleSaveFinalTalkDraft}
                  sx={{
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: '#d97706' },
                  }}
                  variant="contained"
                >
                  Brouillon
                </Button>
                <Button
                  onClick={handleValidateFinalTalk}
                  sx={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: '#059669' },
                  }}
                  variant="contained"
                >
                  Valider
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <React.Fragment>
          <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Stack alignItems={{ md: 'center', xs: 'flex-start' }} direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography color="text.secondary">{currentState.savedAt ? `Dernier enregistrement : ${formatDate(currentState.savedAt)}` : 'Aucun enregistrement effectué pour cet onglet.'}</Typography>
                    {currentState.validatedAt ? <Typography color="text.secondary" sx={{ mt: 0.5 }}>Valide le {formatDate(currentState.validatedAt)} par {currentState.validatedBy}</Typography> : null}
                  </Box>

                  <Stack direction="row" spacing={1.25}>
                    <Button onClick={handleSave} startIcon={<FloppyDiskIcon fontSize="var(--icon-fontSize-md)" />} variant="outlined">Enregistrer</Button>
                    <Button onClick={handleValidate} variant="contained">Valider</Button>
                    <IconButton aria-label="Ajouter une note" onClick={(): void => setIsAddNoteOpen(true)} sx={{ border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '14px', px: 1.5 }}>
                      <CheckCircleIcon color="#10b981" fontSize="1.15rem" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography sx={{ color: '#111827', fontSize: '1.1rem', fontWeight: 700 }}>Notes de travail</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.6 }}>Les notes affichent la date et le nom de la personne qui les a ajoutées.</Typography>
                  </Box>
                  {currentState.notes.length > 2 ? <Button onClick={(): void => setIsNotesListOpen(true)} variant="text">Voir plus</Button> : null}
                </Stack>

                {currentState.notes.length > 0 ? (
                  notesPreview.map((note) => (
                    <Box key={note.id} sx={{ backgroundColor: '#f8fafc', border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '18px', p: 2 }}>
                      <Typography sx={{ color: '#111827', fontSize: '0.98rem', fontWeight: 700 }}>{note.author}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.35 }}>{formatDate(note.createdAt)}</Typography>
                      <Typography sx={{ color: '#334155', lineHeight: 1.8, mt: 1.15 }}>{note.content}</Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ backgroundColor: '#f8fafc', borderRadius: '16px', color: '#64748b', p: 2 }}>Aucune note de travail ajoutée pour le moment.</Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </React.Fragment>
      )}

      <Dialog fullWidth maxWidth="md" onClose={handleCloseAuditTestDialog} open={isAuditTestDialogOpen}>
        <DialogTitle>{editingAuditTestId ? 'Modifier un test' : 'Ajouter un test'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25}>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid size={{ md: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="N du test"
                  onChange={(event): void => handleAuditTestDraftFieldChange('testNumber', event.target.value)}
                  size="small"
                  sx={compactAuditFieldSx}
                  value={auditTestDraft.testNumber}
                />
              </Grid>
              <Grid size={{ md: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Auditeur responsable"
                  onChange={(event): void => handleAuditTestDraftFieldChange('auditor', event.target.value)}
                  select
                  size="small"
                  sx={compactAuditFieldSx}
                  value={auditTestDraft.auditor}
                >
                  {auditAuditors.map((auditor) => (
                    <MenuItem key={auditor} value={auditor}>
                      {auditor}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ md: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Statut"
                  onChange={(event): void => handleAuditTestDraftFieldChange('status', event.target.value)}
                  select
                  size="small"
                  sx={compactAuditFieldSx}
                  value={auditTestDraft.status}
                >
                  {testStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Tache"
                  minRows={3}
                  multiline
                  onChange={(event): void => handleAuditTestDraftFieldChange('controlDescription', event.target.value)}
                  size="small"
                  sx={compactAuditFieldSx}
                  value={auditTestDraft.controlDescription}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Objectif"
                  minRows={3}
                  multiline
                  onChange={(event): void => handleAuditTestDraftFieldChange('objective', event.target.value)}
                  size="small"
                  sx={compactAuditFieldSx}
                  value={auditTestDraft.objective}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Methodologie"
                  minRows={3}
                  multiline
                  onChange={(event): void => handleAuditTestDraftFieldChange('methodology', event.target.value)}
                  size="small"
                  sx={compactAuditFieldSx}
                  value={auditTestDraft.methodology}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Date de debut"
                  onChange={(event): void => handleAuditTestDraftFieldChange('startDate', event.target.value)}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={compactAuditFieldSx}
                  type="date"
                  value={auditTestDraft.startDate}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Date de fin"
                  onChange={(event): void => handleAuditTestDraftFieldChange('endDate', event.target.value)}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={compactAuditFieldSx}
                  type="date"
                  value={auditTestDraft.endDate}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Commentaires"
                  minRows={3}
                  multiline
                  onChange={(event): void => handleAuditTestDraftFieldChange('comments', event.target.value)}
                  size="small"
                  sx={compactAuditFieldSx}
                  value={auditTestDraft.comments}
                />
              </Grid>
            </Grid>

            {auditTestDraftError ? (
              <Typography sx={{ color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>{auditTestDraftError}</Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={handleCloseAuditTestDialog}>Annuler</Button>
          <Button onClick={handleSubmitAuditTest} variant="contained">
            {editingAuditTestId ? 'Enregistrer les modifications' : 'Ajouter le test'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" onClose={handleCloseRiskDialog} open={isRiskDialogOpen}>
        <DialogTitle>{editingRiskId ? 'Modifier un risque' : 'Ajouter un risque'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ md: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Code"
                  onChange={(event): void => handleRiskDraftFieldChange('code', event.target.value)}
                  size="small"
                  value={riskDraft.code}
                />
              </Grid>
              <Grid size={{ md: 8, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Intitulé du risque"
                  onChange={(event): void => handleRiskDraftFieldChange('risk', event.target.value)}
                  size="small"
                  value={riskDraft.risk}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Objet auditable"
                  onChange={(event): void => handleRiskDraftFieldChange('auditableObject', event.target.value)}
                  size="small"
                  value={riskDraft.auditableObject}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Sous-objet auditable"
                  onChange={(event): void => handleRiskDraftFieldChange('auditableSubObject', event.target.value)}
                  size="small"
                  value={riskDraft.auditableSubObject}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Objectif opérationnel de contrôle"
                  minRows={3}
                  multiline
                  onChange={(event): void => handleRiskDraftFieldChange('operationalControlObjective', event.target.value)}
                  size="small"
                  value={riskDraft.operationalControlObjective}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Evaluation du risque"
                  onChange={(event): void => handleRiskDraftFieldChange('riskAssessment', event.target.value)}
                  select
                  size="small"
                  value={riskDraft.riskAssessment}
                >
                  {finalRiskAssessments.map((assessment) => {
                    const { impact } = getFinalRiskAssessmentProfile(assessment);

                    return (
                      <MenuItem key={assessment} sx={{ color: impactTextColor[impact] }} value={assessment}>
                        {assessment}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Impact"
                  onChange={(event): void => handleRiskDraftFieldChange('impact', event.target.value)}
                  select
                  size="small"
                  value={riskDraft.impact}
                >
                  {impactLevels.map((impact) => (
                    <MenuItem key={impact} sx={{ color: impactTextColor[impact] }} value={impact}>
                      {getImpactLabel(impact)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Bonnes pratiques"
                  minRows={3}
                  multiline
                  onChange={(event): void => handleRiskDraftFieldChange('controlMeasure', event.target.value)}
                  size="small"
                  value={riskDraft.controlMeasure}
                />
              </Grid>
            </Grid>
            {riskDraftError ? (
              <Typography sx={{ color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>{riskDraftError}</Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={handleCloseRiskDialog}>Annuler</Button>
          <Button onClick={handleSubmitRisk} variant="contained">
            {editingRiskId ? 'Enregistrer les modifications' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="md" onClose={handleCloseFinalTalkDialog} open={isFinalTalkDialogOpen}>
        <DialogTitle>{editingFinalTalkId ? 'Modifier un risque TaRi' : 'Ajouter un risque TaRi'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ md: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Code"
                  onChange={(event): void => handleFinalTalkDraftFieldChange('code', event.target.value)}
                  size="small"
                  value={finalTalkDraft.code}
                />
              </Grid>
              <Grid size={{ md: 8, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Intitulé du risque"
                  onChange={(event): void => handleFinalTalkDraftFieldChange('title', event.target.value)}
                  size="small"
                  value={finalTalkDraft.title}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Objet auditable"
                  onChange={(event): void => handleFinalTalkDraftFieldChange('auditableObject', event.target.value)}
                  size="small"
                  value={finalTalkDraft.auditableObject}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Sous-objet auditable"
                  onChange={(event): void => handleFinalTalkDraftFieldChange('auditableSubObject', event.target.value)}
                  size="small"
                  value={finalTalkDraft.auditableSubObject}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Objectif opérationnel de contrôle"
                  minRows={3}
                  multiline
                  onChange={(event): void => handleFinalTalkDraftFieldChange('operationalControlObjective', event.target.value)}
                  size="small"
                  value={finalTalkDraft.operationalControlObjective}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Evaluation du risque"
                  onChange={(event): void => handleFinalTalkDraftFieldChange('riskAssessment', event.target.value)}
                  select
                  size="small"
                  value={finalTalkDraft.riskAssessment}
                >
                  {finalRiskAssessments.map((assessment) => {
                    const { impact } = getFinalRiskAssessmentProfile(assessment);

                    return (
                      <MenuItem key={assessment} sx={{ color: impactTextColor[impact] }} value={assessment}>
                        {assessment}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Impact"
                  onChange={(event): void => handleFinalTalkDraftFieldChange('impact', event.target.value)}
                  select
                  size="small"
                  value={finalTalkDraft.impact}
                >
                  {impactLevels.map((impact) => (
                    <MenuItem key={impact} sx={{ color: impactTextColor[impact] }} value={impact}>
                      {getImpactLabel(impact)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ md: 8, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Bonnes pratiques"
                  minRows={3}
                  multiline
                  onChange={(event): void => handleFinalTalkDraftFieldChange('controlMeasure', event.target.value)}
                  size="small"
                  value={finalTalkDraft.controlMeasure}
                />
              </Grid>
            </Grid>
            {finalTalkDraftError ? (
              <Typography sx={{ color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>{finalTalkDraftError}</Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={handleCloseFinalTalkDialog}>Annuler</Button>
          <Button onClick={handleSubmitFinalTalkRow} variant="contained">
            {editingFinalTalkId ? 'Enregistrer les modifications' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={finalTalkMenuAnchor} onClose={handleCloseFinalTalkMenu} open={Boolean(finalTalkMenuAnchor)}>
        <MenuItem onClick={handleEditFinalTalkFromMenu}>Modifier</MenuItem>
        <MenuItem onClick={handleDeleteFinalTalkFromMenu} sx={{ color: '#dc2626' }}>
          Supprimer
        </MenuItem>
      </Menu>

      <Menu anchorEl={auditTestMenuAnchor} onClose={handleCloseAuditTestMenu} open={Boolean(auditTestMenuAnchor)}>
        <MenuItem onClick={handleEditAuditTestFromMenu}>Modifier</MenuItem>
        <MenuItem onClick={handleDeleteAuditTestFromMenu} sx={{ color: '#dc2626' }}>
          Supprimer
        </MenuItem>
      </Menu>

      <Dialog fullWidth maxWidth="md" onClose={(): void => setSelectedCardId(null)} open={Boolean(selectedCard)}>
        <DialogTitle>{selectedCard?.title}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
              <Chip label={selectedCard?.category} size="small" sx={{ alignSelf: 'flex-start' }} />
              <Chip label={aiLabel} size="small" sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 700 }} />
            </Stack>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>{selectedCard?.summary}</Typography>
            <Typography sx={{ color: '#111827', lineHeight: 1.95 }}>{selectedCard?.detail}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={(): void => setSelectedCardId(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" onClose={(): void => setIsAddNoteOpen(false)} open={isAddNoteOpen}>
        <DialogTitle>Ajouter une note de travail</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography color="text.secondary">La note sera associée à {author} avec la date du jour.</Typography>
            <TextField fullWidth minRows={5} multiline onChange={(event): void => setNoteDraft(event.target.value)} placeholder="Saisis ici la note de travail à enregistrer..." value={noteDraft} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={(): void => setIsAddNoteOpen(false)}>Annuler</Button>
          <Button onClick={handleAddNote} variant="contained">Ajouter la note</Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="md" onClose={(): void => setIsNotesListOpen(false)} open={isNotesListOpen}>
        <DialogTitle>Toutes les notes de travail</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {currentState.notes.map((note) => (
              <Box key={note.id} sx={{ backgroundColor: '#f8fafc', border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '18px', p: 2 }}>
                <Typography sx={{ color: '#111827', fontSize: '0.98rem', fontWeight: 700 }}>{note.author}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.35 }}>{formatDate(note.createdAt)}</Typography>
                <Typography sx={{ color: '#334155', lineHeight: 1.8, mt: 1.15 }}>{note.content}</Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={(): void => setIsNotesListOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

