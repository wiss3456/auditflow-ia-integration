import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: "Vue d'ensemble", href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'riskBase', title: 'Base des risques', href: paths.dashboard.riskBase, icon: 'file-text' },
  { key: 'orientationReport', title: 'Rapport', href: paths.dashboard.orientationReport, icon: 'file-text' },
  { key: 'studyPhase', title: "Phase d'étude", href: paths.dashboard.studyPhase, icon: 'list-bullets' },
  { key: 'followUp', title: 'Suivi', href: paths.dashboard.followUp, icon: 'arrow-clockwise' },
  { key: 'support', title: 'Support', href: paths.dashboard.support, icon: 'lifebuoy' },
] satisfies NavItemConfig[];
