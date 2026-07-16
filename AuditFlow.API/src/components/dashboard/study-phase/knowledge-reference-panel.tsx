'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';

import knowledgeDossierRaw from '../../../../knowledge_dossier_1.json';

type KnowledgeLayerKey =
  | 'benchmarking'
  | 'best_practices'
  | 'causes'
  | 'context_and_definition'
  | 'controls'
  | 'real_incidents'
  | 'regularisation';

interface KnowledgeArticle {
  article_id: string;
  citations: string[];
  content: string;
  title: string;
}

interface KnowledgeLayer {
  articles: KnowledgeArticle[];
  summary: string;
}

type KnowledgeDataset = Record<KnowledgeLayerKey, KnowledgeLayer>;

interface KnowledgeSupportSectionDefinition {
  articleLimit: number;
  articleOffset?: number;
  key: KnowledgeLayerKey;
  label: string;
}

interface KnowledgeSectionDefinition {
  articleLimit: number;
  articleOffset?: number;
  bridge: string;
  category: string;
  helperText: string;
  id: string;
  key: KnowledgeLayerKey;
  supportingSections?: KnowledgeSupportSectionDefinition[];
  title: string;
}

interface KnowledgeSupportSection {
  articles: KnowledgeArticle[];
  extraArticles: KnowledgeArticle[];
  label: string;
}

interface KnowledgeSection {
  articles: KnowledgeArticle[];
  bridge: string;
  category: string;
  extraArticles: KnowledgeArticle[];
  extraSources: string[];
  helperText: string;
  id: string;
  sources: string[];
  supportingSections: KnowledgeSupportSection[];
  summary: string;
  title: string;
}

interface KnowledgeReferencePanelProps {
  aiLabel: string;
  isGenerated: boolean;
}

const blueTitleSx = { color: '#1d4ed8', fontSize: '1.08rem', fontWeight: 800 };
const sectionCardSx = {
  background: 'linear-gradient(135deg, rgba(219, 234, 254, 0.72) 0%, rgba(239, 246, 255, 0.9) 100%)',
  border: '1px solid rgba(96, 165, 250, 0.22)',
  borderRadius: '18px',
  p: 2.1,
};

const knowledgeDossier = knowledgeDossierRaw as KnowledgeDataset;

const knowledgeSectionDefinitions: KnowledgeSectionDefinition[] = [
  {
    articleLimit: 4,
    bridge: 'Cette base de lecture définit le périmètre, les objectifs et les enjeux à garder en tête avant d’examiner les causes.',
    category: 'Cadre général',
    helperText: 'Cette section pose le vocabulaire, l’importance du processus et les attentes de maîtrise.',
    id: 'context',
    key: 'context_and_definition',
    title: 'Définition du contexte',
  },
  {
    articleLimit: 4,
    bridge: 'Les causes identifiées expliquent pourquoi des écarts apparaissent ensuite dans les incidents, les contrôles et la conformité.',
    category: 'Facteurs explicatifs',
    helperText: 'Cette lecture permet de remonter des symptômes observés vers leurs causes organisationnelles, humaines et techniques.',
    id: 'causes',
    key: 'causes',
    title: 'Causes',
  },
  {
    articleLimit: 4,
    articleOffset: 1,
    bridge: 'Les incidents historiques montrent comment les causes se matérialisent sur le terrain et ce qu’elles produisent sur la performance.',
    category: 'Retours d’expérience',
    helperText: 'Cette section relie les facteurs de défaillance à des situations déjà observées dans des environnements comparables.',
    id: 'historical-incidents',
    key: 'real_incidents',
    title: 'Incidents historiques',
  },
  {
    articleLimit: 4,
    bridge: 'Le benchmarking permet de comparer la situation étudiée à des modèles de maturité et à des repères d’organisation plus avancés.',
    category: 'Repères de comparaison',
    helperText: 'Cette section aide à situer le niveau de maîtrise actuel et à identifier les pratiques qui renforcent la performance.',
    id: 'benchmarking',
    key: 'benchmarking',
    title: 'Benchmarking',
  },
  {
    articleLimit: 4,
    bridge: 'Les contrôles traduisent les constats précédents en points de vérification concrets, mesurables et directement auditables.',
    category: 'Dispositifs de maîtrise',
    helperText: 'Cette section rassemble les mécanismes de contrôle attendus et les bonnes pratiques qui les rendent efficaces.',
    id: 'controls',
    key: 'controls',
    supportingSections: [{ articleLimit: 3, key: 'best_practices', label: 'Bonnes pratiques associées' }],
    title: 'Contrôles',
  },
  {
    articleLimit: 4,
    bridge: 'Les réglementations fixent les exigences minimales à respecter et cadrent la manière dont les contrôles doivent être conçus.',
    category: 'Cadre normatif',
    helperText: 'Cette lecture précise les obligations légales, réglementaires et normatives qui encadrent la gestion des réclamations.',
    id: 'regulations',
    key: 'regularisation',
    title: 'Réglementations',
  },
  {
    articleLimit: 1,
    bridge: 'Le cas réel synthétise le contexte, les causes, les contrôles et les exigences réglementaires dans une situation concrète.',
    category: 'Mise en situation',
    helperText: 'Cette section met en avant un cas emblématique et les enseignements directement réutilisables pour l’analyse.',
    id: 'real-case',
    key: 'real_incidents',
    supportingSections: [{ articleLimit: 2, key: 'best_practices', label: 'Enseignements applicables' }],
    title: 'Cas réel',
  },
];

function sliceArticles(layer: KnowledgeLayer, limit: number, offset = 0): KnowledgeArticle[] {
  return layer.articles.slice(offset, offset + limit);
}

function deduplicateSources(sections: KnowledgeSupportSection[], articles: KnowledgeArticle[]): string[] {
  const sourceSet = new Set<string>();

  for (const article of articles) {
    for (const citation of article.citations) {
      sourceSet.add(citation);
    }
  }

  for (const section of sections) {
    for (const article of section.articles) {
      for (const citation of article.citations) {
        sourceSet.add(citation);
      }
    }
  }

  return [...sourceSet];
}

function buildKnowledgeSection(definition: KnowledgeSectionDefinition): KnowledgeSection {
  const primaryLayer = knowledgeDossier[definition.key];
  const articles = sliceArticles(primaryLayer, definition.articleLimit, definition.articleOffset);
  const extraArticles = primaryLayer.articles.slice((definition.articleOffset ?? 0) + definition.articleLimit);
  const supportingSections =
    definition.supportingSections?.map((section) => ({
      articles: sliceArticles(knowledgeDossier[section.key], section.articleLimit, section.articleOffset),
      extraArticles: knowledgeDossier[section.key].articles.slice((section.articleOffset ?? 0) + section.articleLimit),
      label: section.label,
    })) ?? [];
  const sources = deduplicateSources(supportingSections, articles);

  return {
    articles,
    bridge: definition.bridge,
    category: definition.category,
    extraArticles,
    extraSources: sources.slice(8),
    helperText: definition.helperText,
    id: definition.id,
    sources,
    supportingSections,
    summary: primaryLayer.summary,
    title: definition.title,
  };
}

function getSourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./u, '');
  } catch {
    return url;
  }
}

function renderArticle(article: KnowledgeArticle, index: number): React.JSX.Element {
  return (
    <Box
      key={`${article.article_id}-${article.title}`}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: '18px',
        p: 2.1,
      }}
    >
      <Stack spacing={1.1}>
        <Typography sx={{ color: '#2563eb', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Sous-theme {String(index + 1).padStart(2, '0')}
        </Typography>
        <Typography sx={{ color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>{article.title}</Typography>
        <Typography sx={{ color: '#334155', lineHeight: 1.85 }}>{article.content}</Typography>
        {article.citations.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {article.citations.slice(0, 3).map((citation) => (
              <Link
                href={citation}
                key={citation}
                rel="noreferrer"
                sx={{
                  backgroundColor: '#eff6ff',
                  borderRadius: '999px',
                  color: '#1d4ed8',
                  px: 1.25,
                  py: 0.55,
                  textDecoration: 'none',
                }}
                target="_blank"
                variant="body2"
              >
                {getSourceLabel(citation)}
              </Link>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

function renderExpandedContent(section: KnowledgeSection): React.JSX.Element {
  const hasExtraPrimaryArticles = section.extraArticles.length > 0;
  const supportSectionsWithExtras = section.supportingSections.filter((supportSection) => supportSection.extraArticles.length > 0);
  const hasExtraSources = section.extraSources.length > 0;
  const hasAdditionalContent = hasExtraPrimaryArticles || supportSectionsWithExtras.length > 0 || hasExtraSources;

  if (!hasAdditionalContent) {
    return (
      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
        Tout le contenu disponible pour cette section est deja visible.
      </Typography>
    );
  }

  return (
    <Stack spacing={2.1}>
      {hasExtraPrimaryArticles ? (
        <Stack spacing={1.4}>{section.extraArticles.map((article, index) => renderArticle(article, index + section.articles.length))}</Stack>
      ) : null}

      {supportSectionsWithExtras.length > 0 ? (
        <Stack spacing={1.6}>
          {supportSectionsWithExtras.map((supportSection) => (
            <Box
              key={supportSection.label}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(37, 99, 235, 0.14)',
                borderRadius: '18px',
                p: 2.1,
              }}
            >
              <Typography sx={blueTitleSx}>{supportSection.label}</Typography>
              <Stack spacing={1.35} sx={{ mt: 1.5 }}>
                {supportSection.extraArticles.map((article, index) => renderArticle(article, index + supportSection.articles.length))}
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : null}

      {hasExtraSources ? (
        <Box
          sx={{
            backgroundColor: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            borderRadius: '18px',
            p: 2.1,
          }}
        >
          <Typography sx={blueTitleSx}>Sources supplementaires</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.4 }}>
            {section.extraSources.map((source) => (
              <Link
                href={source}
                key={source}
                rel="noreferrer"
                sx={{
                  backgroundColor: '#eff6ff',
                  borderRadius: '999px',
                  color: '#1d4ed8',
                  px: 1.25,
                  py: 0.55,
                  textDecoration: 'none',
                }}
                target="_blank"
                variant="body2"
              >
                {getSourceLabel(source)}
              </Link>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}

export function KnowledgeReferencePanel({ aiLabel, isGenerated }: KnowledgeReferencePanelProps): React.JSX.Element {
  const knowledgeSections = React.useMemo(() => knowledgeSectionDefinitions.map(buildKnowledgeSection), []);
  const [activeSectionId, setActiveSectionId] = React.useState<string>(knowledgeSections[0]?.id ?? 'context');
  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null);

  const activeSection = knowledgeSections.find((section) => section.id === activeSectionId) ?? knowledgeSections[0] ?? null;
  const activeSectionIndex = activeSection ? knowledgeSections.findIndex((section) => section.id === activeSection.id) : -1;
  const previousSection = activeSectionIndex > 0 ? knowledgeSections[activeSectionIndex - 1] : null;
  const nextSection =
    activeSectionIndex >= 0 && activeSectionIndex < knowledgeSections.length - 1 ? knowledgeSections[activeSectionIndex + 1] : null;
  const isDetailExpanded = selectedSectionId === activeSection?.id;
  const hasAdditionalContent = Boolean(
    activeSection &&
      (activeSection.extraArticles.length > 0 ||
        activeSection.extraSources.length > 0 ||
        activeSection.supportingSections.some((section) => section.extraArticles.length > 0))
  );

  React.useEffect(() => {
    if (!knowledgeSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(knowledgeSections[0]?.id ?? 'context');
    }
  }, [activeSectionId, knowledgeSections]);

  if (!activeSection) {
    return (
      <Card sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '20px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)' }}>
        <CardContent>
          <Typography color="text.secondary">Aucune section de connaissance n’est disponible pour le moment.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '20px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)' }}>
      <CardContent sx={{ p: 0 }}>
        <Tabs
          onChange={(_event, value: string): void => setActiveSectionId(value)}
          scrollButtons="auto"
          sx={{ px: 2.5, pt: 2 }}
          value={activeSection.id}
          variant="scrollable"
        >
          {knowledgeSections.map((section) => (
            <Tab key={section.id} label={section.title} value={section.id} />
          ))}
        </Tabs>
        <Divider sx={{ mt: 2 }} />

        <Stack spacing={2.4} sx={{ p: 2.5 }}>
          <Stack alignItems="flex-start" direction={{ md: 'row', xs: 'column' }} justifyContent="space-between" spacing={1.5}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#1d4ed8', fontSize: '1.18rem', fontWeight: 800 }}>{activeSection.title}</Typography>
              <Typography sx={{ color: '#475569', mt: 0.7 }}>{activeSection.category}</Typography>
            </Box>
            <Chip label={aiLabel} size="small" sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 700 }} />
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ md: 6, xs: 12 }}>
              <Box sx={sectionCardSx}>
                <Typography sx={blueTitleSx}>Vue d'ensemble</Typography>
                <Typography sx={{ color: '#334155', lineHeight: 1.85, mt: 1.1 }}>
                  {isGenerated
                    ? activeSection.summary
                    : "Clique sur Generer pour charger une synthese claire, directement issue du dossier de connaissance."}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Box sx={sectionCardSx}>
                <Typography sx={blueTitleSx}>Fil conducteur</Typography>
                <Typography sx={{ color: '#334155', lineHeight: 1.85, mt: 1.1 }}>{activeSection.bridge}</Typography>
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid rgba(148, 163, 184, 0.14)',
              borderRadius: '18px',
              p: 2.1,
            }}
          >
            <Typography sx={blueTitleSx}>Reperes de lecture</Typography>
            <Typography sx={{ color: '#334155', lineHeight: 1.85, mt: 1.1 }}>{activeSection.helperText}</Typography>
            <Stack direction={{ md: 'row', xs: 'column' }} spacing={1.1} sx={{ mt: 1.6 }}>
              {previousSection ? <Chip label={`En amont : ${previousSection.title}`} sx={{ alignSelf: 'flex-start' }} variant="outlined" /> : null}
              {nextSection ? <Chip label={`En aval : ${nextSection.title}`} sx={{ alignSelf: 'flex-start' }} variant="outlined" /> : null}
            </Stack>
          </Box>

          <Stack spacing={1.4}>
            <Typography sx={blueTitleSx}>Points structurants</Typography>
            {isGenerated ? (
              activeSection.articles.map((article, index) => renderArticle(article, index))
            ) : (
              <Box
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px dashed rgba(59, 130, 246, 0.35)',
                  borderRadius: '18px',
                  p: 2.1,
                }}
              >
                <Typography sx={{ color: '#2563eb', fontSize: '0.92rem', fontWeight: 700 }}>Sous-themes prets a etre affiches</Typography>
                <Typography sx={{ color: '#475569', lineHeight: 1.85, mt: 1 }}>
                  Le contenu detaille de cette rubrique apparaitra ici avec des sous-titres, du texte lisible et les sources associees.
                </Typography>
              </Box>
            )}
          </Stack>

          {isGenerated && activeSection.supportingSections.length > 0 ? (
            <Stack spacing={1.4}>
              {activeSection.supportingSections.map((section) => (
                <Box
                  key={section.label}
                  sx={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(37, 99, 235, 0.14)',
                    borderRadius: '18px',
                    p: 2.1,
                  }}
                >
                  <Typography sx={blueTitleSx}>{section.label}</Typography>
                  <Stack spacing={1.35} sx={{ mt: 1.5 }}>
                    {section.articles.map((article, index) => renderArticle(article, index))}
                    {isDetailExpanded ? section.extraArticles.map((article, index) => renderArticle(article, index + section.articles.length)) : null}
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : null}

          {isGenerated && isDetailExpanded ? (
            <>
              <Divider />
              {renderExpandedContent(activeSection)}
            </>
          ) : null}

          {isGenerated ? (
            <Box
              sx={{
                backgroundColor: '#f8fafc',
                border: '1px solid rgba(148, 163, 184, 0.14)',
                borderRadius: '18px',
                p: 2.1,
              }}
            >
              <Typography sx={blueTitleSx}>Sources de la section</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.4 }}>
                {activeSection.sources.slice(0, isDetailExpanded ? undefined : 8).map((source) => (
                  <Link
                    href={source}
                    key={source}
                    rel="noreferrer"
                    sx={{
                      backgroundColor: '#eff6ff',
                      borderRadius: '999px',
                      color: '#1d4ed8',
                      px: 1.25,
                      py: 0.55,
                      textDecoration: 'none',
                    }}
                    target="_blank"
                    variant="body2"
                  >
                    {getSourceLabel(source)}
                  </Link>
                ))}
              </Stack>
            </Box>
          ) : null}

          {isGenerated ? (
            <Button
              disabled={!hasAdditionalContent}
              onClick={(): void => setSelectedSectionId((current) => (current === activeSection.id ? null : activeSection.id))}
              startIcon={<EyeIcon fontSize="var(--icon-fontSize-md)" />}
              sx={{ alignSelf: 'flex-start' }}
              variant="outlined"
            >
              {isDetailExpanded ? 'Masquer le detail' : 'Ouvrir le detail'}
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
