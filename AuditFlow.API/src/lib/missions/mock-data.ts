export interface AuditMission {
  client: string;
  createdBy?: string;
  dueDate: string;
  id: string;
  nextAction: string;
  objective: string;
  openFindings: number;
  owner: string;
  phase: string;
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
  scope: string;
  site: string;
  status: 'Planning' | 'Fieldwork' | 'Review' | 'Follow-up' | 'Closed';
  title: string;
}

export const auditMissions = [
  {
    client: 'Direction Materiel',
    dueDate: '2026-04-24',
    id: 'ONCF-AI-2026-001',
    nextAction: 'Finaliser la cartographie des depots et caler les entretiens avec le technicentre de Casablanca.',
    objective:
      'Verifier la tracabilite de la maintenance preventive, la gestion des pieces critiques et le suivi des immobilisations longues du materiel roulant.',
    openFindings: 4,
    owner: 'Rim Diab',
    phase: 'Cadrage terrain en preparation',
    priority: 'High',
    progress: 24,
    scope: 'Maintenance preventive du materiel roulant',
    site: 'Technicentre de Casablanca',
    status: 'Planning',
    title: 'Audit maintenance materiel roulant',
  },
  {
    client: 'Direction Infrastructure',
    dueDate: '2026-04-29',
    id: 'ONCF-AI-2026-002',
    nextAction: "Achever les tests de controle sur les alertes terrain et les journaux d'incidents des passages a niveau.",
    objective:
      'Evaluer la maitrise des passages a niveau sensibles, la tracabilite des anomalies de securite et la coordination avec les intervenants locaux.',
    openFindings: 5,
    owner: 'Yassine Sadiki',
    phase: 'Tests terrain en cours',
    priority: 'High',
    progress: 61,
    scope: 'Securite des passages a niveau',
    site: 'Axe Kenitra - Casablanca',
    status: 'Fieldwork',
    title: 'Audit securite passages a niveau',
  },
  {
    client: "Direction Systemes d'Information",
    dueDate: '2026-05-06',
    id: 'ONCF-AI-2026-003',
    nextAction: 'Preparer la restitution sur les habilitations privilegiees et les comptes techniques des applications critiques.',
    objective:
      'Confirmer que les acces aux applications de circulation, de billettique et de maintenance sont attribues, revus et traces conformement aux exigences de securite.',
    openFindings: 3,
    owner: 'Rim Diab',
    phase: 'Paquet de revue a finaliser',
    priority: 'Medium',
    progress: 78,
    scope: "Habilitations et controles d'acces SI critiques",
    site: 'SI central et sites distants',
    status: 'Review',
    title: 'Revue des habilitations SI critiques',
  },
  {
    client: 'Pole Voyageurs',
    dueDate: '2026-03-30',
    id: 'ONCF-AI-2026-004',
    nextAction: "Presenter l'etat de mise en oeuvre au prochain comite de suivi des recommandations.",
    objective:
      "Verifier la mise en oeuvre des recommandations sur la gestion des perturbations, l'information voyageurs en gare et la coordination des cellules de crise.",
    openFindings: 1,
    owner: 'Yassine Sadiki',
    phase: "Suivi du plan d'actions",
    priority: 'Low',
    progress: 88,
    scope: 'Gestion des perturbations et information voyageurs',
    site: 'Reseau national',
    status: 'Follow-up',
    title: 'Suivi information voyageurs',
  },
] satisfies AuditMission[];
