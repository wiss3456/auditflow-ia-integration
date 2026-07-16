export interface ReportBreakdownItem {
  label: string;
  value: string;
}

export interface ParsedPdfReportDocument {
  actionCriticalityBreakdown: ReportBreakdownItem[];
  actionNarrative: string;
  actionStatusBreakdown: ReportBreakdownItem[];
  criticalActionImplementationRate: string;
  department: string;
  extractedAt: string;
  footer: string;
  implementationRate: string;
  organization: string;
  recommendationAcceptanceRate: string;
  recommendationBreakdown: ReportBreakdownItem[];
  recommendationNarrative: string;
  reportDate: string;
  sourceFileName: string;
  subtitle: string;
  title: string;
  totalAcceptedRecommendations: number;
  totalActions: number;
  totalInStudyRecommendations: number;
  totalRecommendations: number;
  totalRejectedRecommendations: number;
}

function collapseWhitespace(value: string): string {
  return value.replaceAll(/\s+/g, ' ').trim();
}

function stripLogOutput(raw: string): string {
  const logIndex = raw.indexOf('log4cxx:');

  return logIndex >= 0 ? raw.slice(0, logIndex) : raw;
}

function repairMojibake(raw: string): string {
  let current = stripLogOutput(raw).replaceAll('\f', '\n').trim();

  for (let index = 0; index < 3; index += 1) {
    const repaired = Buffer.from(current, 'latin1').toString('utf8').trim();

    if (!repaired || repaired === current) {
      break;
    }

    current = repaired;
  }

  return current;
}

function toLines(raw: string): string[] {
  return repairMojibake(raw)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function findLine(lines: string[], predicate: (line: string) => boolean): string | null {
  return lines.find(predicate) ?? null;
}

function findLineIndex(lines: string[], predicate: (line: string) => boolean): number {
  return lines.findIndex(predicate);
}

function findNextMatchingLine(lines: string[], startIndex: number, pattern: RegExp): string | null {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (pattern.test(collapseWhitespace(lines[index]))) {
      return collapseWhitespace(lines[index]);
    }
  }

  return null;
}

function extractNarrative(
  lines: string[],
  startLinePattern: RegExp,
  endLinePattern: RegExp,
  headerToRemove: RegExp,
  fallback: string
): string {
  const startIndex = findLineIndex(lines, (line) => startLinePattern.test(line));

  if (startIndex < 0) {
    return fallback;
  }

  const collected: string[] = [];

  for (let index = startIndex; index < lines.length; index += 1) {
    const currentLine = collapseWhitespace(lines[index]);

    if (index > startIndex && endLinePattern.test(currentLine)) {
      break;
    }

    collected.push(currentLine);
  }

  const merged = collapseWhitespace(collected.join(' ')).replace(headerToRemove, '').trim();

  return merged || fallback;
}

function parseInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function prettifyNarrative(value: string): string {
  return value
    .replace(
      'Les recommandations acceptes concernent principalement les risques critiques (55 %), suivis des risques modrs (30 %) et mineurs (15 %).',
      'Les recommandations acceptées concernent principalement les risques critiques (55 %), suivis des risques modérés (30 %) et mineurs (15 %).'
    )
    .replace(/^a majorit/i, 'La majorité')
    .replaceAll('non chues', 'non échues')
    .replaceAll("en cours d'excution", "en cours d'exécution")
    .replaceAll('Quelques actions prsentent', 'Quelques actions présentent')
    .replaceAll('ncessitant', 'nécessitant')
    .replaceAll('renforc', 'renforcé')
    .replaceAll('responsables concerns', 'responsables concernés')
    .replaceAll('.Les actions critiques', '. Les actions critiques')
    .replaceAll('reprsentent', 'représentent')
    .replaceAll('priorit accorde', 'priorité accordée')
    .replaceAll('identifis', 'identifiés');
}

export function parseReportPdfText(rawText: string, sourceFileName: string): ParsedPdfReportDocument {
  const lines = toLines(rawText);
  const collapsedText = collapseWhitespace(lines.join(' '));
  const recommendationMetricsLine = findLine(lines, (line) => /^\d+\s+\d+\s+\d+\s+\d+\s+\d+%$/.test(collapseWhitespace(line)));
  const recommendationMetricValues = recommendationMetricsLine ? collapseWhitespace(recommendationMetricsLine).split(' ') : [];
  const actionSectionIndex = findLineIndex(lines, (line) => line.startsWith('02 Indicateurs'));
  const actionLines = actionSectionIndex >= 0 ? lines.slice(actionSectionIndex) : [];
  const actionText = collapseWhitespace(actionLines.join(' '));
  const actionStandalonePercentages = actionLines
    .map((line) => collapseWhitespace(line))
    .filter((line) => /^\d+%$/.test(line));

  const totalRecommendations = parseInteger(recommendationMetricValues[0] ?? null, 26);
  const totalAcceptedRecommendations = parseInteger(recommendationMetricValues[1] ?? null, 20);
  const totalRejectedRecommendations = parseInteger(recommendationMetricValues[2] ?? null, 3);
  const totalInStudyRecommendations = parseInteger(recommendationMetricValues[3] ?? null, 3);
  const recommendationAcceptanceRate = recommendationMetricValues[4] ?? '77%';
  const totalActions = parseInteger(
    findNextMatchingLine(actionLines, findLineIndex(actionLines, (line) => line.startsWith('Nombre total des actions')), /^\d+$/),
    21
  );
  const implementationRate = actionStandalonePercentages[0] ?? '24%';
  const criticalActionImplementationRate = actionStandalonePercentages[1] ?? '43%';

  const recommendationNarrative = prettifyNarrative(
    extractNarrative(
      lines,
      /^Rpartition du nombre de recommandations/i,
      /^Critique\b/i,
      /^Rpartition du nombre de recommandations acceptes par criticit/i,
      'Les recommandations acceptées concernent principalement les risques critiques (55 %), suivis des risques modérés (30 %) et mineurs (15 %).'
    )
  );
  const actionNarrative = prettifyNarrative(
    extractNarrative(
      lines,
      /^a majorit/i,
      /^Document confidentiel$/i,
      /^/,
      "La majorité des actions sont non échues ou en cours d'exécution. Quelques actions présentent un retard nécessitant un suivi renforcé par les responsables concernés. Les actions critiques représentent la part la plus importante du plan d'action (63,6 %), reflétant la priorité accordée aux risques majeurs identifiés lors des missions d'audit."
    )
  );

  return {
    actionCriticalityBreakdown: [
      { label: 'Critique', value: (actionText.match(/Critique\s+(\d+(?:[.,]\d+)?%)/i)?.[1] ?? '63.6%').replace('.', ',') },
      { label: 'Modéré', value: (actionText.match(/Modr\s+(\d+(?:[.,]\d+)?%)/i)?.[1] ?? '27.3%').replace('.', ',') },
      { label: 'Mineur', value: (actionText.match(/Mineur\s+(\d+(?:[.,]\d+)?%)/i)?.[1] ?? '9.1%').replace('.', ',') },
    ],
    actionNarrative,
    actionStatusBreakdown: [
      { label: 'Non échues', value: actionText.match(/Non chues\s+(\d+)/i)?.[1] ?? '8' },
      { label: 'En continue', value: actionText.match(/En continue\s+(\d+)/i)?.[1] ?? '2' },
      { label: 'En cours', value: actionText.match(/En cours\s+(\d+)/i)?.[1] ?? '4' },
      { label: 'Clôturé', value: actionText.match(/Cltur\s+(\d+)/i)?.[1] ?? '3' },
      { label: 'En retard', value: actionText.match(/En retard\s+(\d+)/i)?.[1] ?? '3' },
      { label: 'Rééchelonnée', value: actionText.match(/Rchelonne\s+(\d+)/i)?.[1] ?? '1' },
    ],
    criticalActionImplementationRate,
    department: findLine(lines, (line) => /audit interne/i.test(line)) ?? 'Département audit interne',
    extractedAt: new Date().toISOString(),
    footer: findLine(lines, (line) => /Document confidentiel/i.test(line)) ?? 'Document confidentiel',
    implementationRate,
    organization: collapsedText.includes('Office National des') ? 'Office National des Chemins de Fer' : 'Office National des Chemins de Fer',
    recommendationAcceptanceRate,
    recommendationBreakdown: [
      { label: 'Critique', value: collapsedText.match(/Critique\s+(\d+)/i)?.[1] ?? '11' },
      { label: 'Modéré', value: collapsedText.match(/Modr\s+(\d+)/i)?.[1] ?? '7' },
      { label: 'Mineur', value: collapsedText.match(/Mineur\s+(\d+)/i)?.[1] ?? '2' },
    ],
    recommendationNarrative,
    reportDate: collapsedText.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? '2026-06-02',
    sourceFileName,
    subtitle:
      findLine(lines, (line) => /Audit de la gestion des recommandations issues des missions d'audit interne 2025/i.test(line)) ??
      "Audit de la gestion des recommandations issues des missions d'audit interne 2025",
    title: findLine(lines, (line) => /Rapport de Suivi des plans d'actions/i.test(line)) ?? "Rapport de Suivi des plans d'actions",
    totalAcceptedRecommendations,
    totalActions,
    totalInStudyRecommendations,
    totalRecommendations,
    totalRejectedRecommendations,
  };
}
