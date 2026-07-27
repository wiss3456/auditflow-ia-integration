'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { apiRequest, ApiError } from '@/lib/api/http';
import { authClient } from '@/lib/auth/client';

interface BackendArticle {
  articleId: string;
  title: string;
  content: string;
  citations: string[];
}

interface BackendDossier {
  id: string;
  dimensionKey: string;
  summary: string;
  articles: BackendArticle[];
}

const dimensionLabels: Record<string, string> = {
  context_and_definition: 'Définition du contexte',
  causes: 'Causes',
  controls: 'Contrôles',
  regularisation: 'Réglementations',
  best_practices: 'Bonnes pratiques',
  benchmarking: 'Benchmarking',
  real_incidents: 'Incidents réels',
};

interface Props {
  missionId: string;
}

export function KnowledgeDossierViewer({ missionId }: Props): React.JSX.Element {
  const [dossiers, setDossiers] = React.useState<BackendDossier[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isCancelled = false;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiRequest<BackendDossier[]>(`/api/missions/${missionId}/knowledge`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${authClient.getToken() ?? ''}` },
        });

        if (isCancelled) return;

        setDossiers(result);
        setActiveKey(result[0]?.dimensionKey ?? null);
      } catch (err) {
        if (isCancelled) return;
        const message = err instanceof ApiError ? `${err.status} - ${err.message}` : 'Erreur inconnue lors du chargement.';
        setError(message);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [missionId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Stack alignItems="center" direction="row" spacing={2}>
            <CircularProgress size={24} />
            <Typography>Chargement du dossier de connaissances...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert color="error">Erreur lors du chargement : {error}</Alert>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Mission ID utilisé : {missionId}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!dossiers || dossiers.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Aucun dossier de connaissances trouvé pour cette mission (ID : {missionId}). Clique sur Générer pour en créer un.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const activeDossier = dossiers.find((d) => d.dimensionKey === activeKey) ?? dossiers[0];

  return (
    <Card sx={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: '20px' }}>
      <CardContent sx={{ p: 0 }}>
        <Tabs
          onChange={(_e, value: string): void => setActiveKey(value)}
          scrollButtons="auto"
          sx={{ px: 2.5, pt: 2 }}
          value={activeDossier.dimensionKey}
          variant="scrollable"
        >
          {dossiers.map((d) => (
            <Tab key={d.dimensionKey} label={dimensionLabels[d.dimensionKey] ?? d.dimensionKey} value={d.dimensionKey} />
          ))}
        </Tabs>
        <Divider sx={{ mt: 2 }} />

        <Stack spacing={2.5} sx={{ p: 2.5 }}>
          <Stack alignItems="center" direction="row" justifyContent="space-between">
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {dimensionLabels[activeDossier.dimensionKey] ?? activeDossier.dimensionKey}
            </Typography>
            <Chip label="Généré par IA" size="small" sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 700 }} />
          </Stack>

          <Box sx={{ backgroundColor: '#f8fafc', borderRadius: '16px', p: 2 }}>
            <Typography sx={{ color: '#475569', lineHeight: 1.85 }}>{activeDossier.summary}</Typography>
          </Box>

          <Stack spacing={1.5}>
            {activeDossier.articles.map((article) => (
              <Box
                key={article.articleId}
                sx={{ backgroundColor: '#ffffff', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '16px', p: 2 }}
              >
                <Typography sx={{ fontWeight: 700, mb: 1 }}>{article.title}</Typography>
                <Typography sx={{ color: '#334155', lineHeight: 1.8 }}>{article.content}</Typography>
                {article.citations.length > 0 ? (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                    {article.citations.map((citation) => (
                      <Chip
                        component="a"
                        href={citation}
                        key={citation}
                        label={citation.length > 40 ? `${citation.slice(0, 40)}...` : citation}
                        rel="noreferrer"
                        size="small"
                        target="_blank"
                        clickable
                      />
                    ))}
                  </Stack>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}