'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { BrandMark } from '@/components/dashboard/layout/brand-mark';
import { paths } from '@/paths';

export interface LayoutProps {
  children: React.ReactNode;
}

const highlights = [
  {
    badge: 'IA',
    description:
      'Préqualification assistée des constats, synthèse des données de mission et aide à l’identification des zones de risque pour les audits internes ONCF.',
    title: 'Audit interne assisté par IA',
  },
  {
    badge: 'PM',
    description:
      'Centralisation des missions, du périmètre, des objectifs, des tests et des livrables pour piloter les travaux d’audit de façon structurée.',
    title: 'Pilotage des missions d’audit',
  },
  {
    badge: 'AI',
    description:
      'Appui à la génération des référentiels, analyses de risques, plans de vérification et synthèses exploitables par les équipes d’audit interne.',
    title: 'Analyse assistée par IA',
  },
  {
    badge: 'RS',
    description:
      'Suivi des recommandations, des actions correctives et des rapports de restitution avec une lecture claire de l’avancement global.',
    title: 'Reporting & suivi des recommandations',
  },
] as const;

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        backgroundColor: '#f4f4f8',
        minHeight: '100dvh',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.96fr) minmax(560px, 1.14fr)' },
          minHeight: '100dvh',
        }}
      >
        <Box
          component="aside"
          sx={{
            background:
              'radial-gradient(circle at 65% 88%, rgba(243, 112, 255, 0.22) 0%, rgba(243, 112, 255, 0) 26%), radial-gradient(circle at 50% 78%, rgba(112, 168, 255, 0.32) 0%, rgba(112, 168, 255, 0.04) 30%, rgba(112, 168, 255, 0) 54%), linear-gradient(180deg, #3424d8 0%, #2c1dd2 42%, #2d24e2 100%)',
            color: 'common.white',
            minHeight: { xs: 560, lg: '100dvh' },
            overflow: 'hidden',
            position: 'relative',
            px: { xs: 3, sm: 5, lg: 6 },
            py: { xs: 4, sm: 5, lg: 4 },
          }}
        >
          <Box
            sx={{
              background:
                'radial-gradient(circle at 50% 24%, rgba(147, 163, 255, 0.58) 0%, rgba(147, 163, 255, 0.22) 16%, rgba(147, 163, 255, 0.08) 32%, rgba(32, 27, 164, 0) 60%)',
              borderRadius: '50%',
              bottom: '-24%',
              content: '""',
              height: '62%',
              left: '-10%',
              position: 'absolute',
              right: '-10%',
            }}
          />
          <Box
            sx={{
              backgroundImage:
                'linear-gradient(115deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(28deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundPosition: '0 0, 0 0',
              backgroundSize: '150px 110px, 190px 140px',
              bottom: '-10%',
              left: '-8%',
              opacity: 0.28,
              position: 'absolute',
              right: '-8%',
              top: '42%',
              transform: 'perspective(920px) rotateX(66deg)',
            }}
          />
          <Stack
            spacing={{ xs: 4, lg: 6 }}
            sx={{
              maxWidth: 470,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Stack spacing={3}>
              <Box
                component={RouterLink}
                href={paths.home}
                sx={{
                  alignItems: 'center',
                  color: 'inherit',
                  display: 'inline-flex',
                  gap: 1.1,
                  textDecoration: 'none',
                }}
              >
                <BrandMark size={20} withShadow={false} />
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.72)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}
                >
                  AuditFlow ONCF
                </Typography>
              </Box>

              <Typography
                sx={{
                  color: 'common.white',
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontSize: { xs: '2.8rem', sm: '3.5rem', lg: '4.05rem' },
                  fontWeight: 200,
                  letterSpacing: '-0em',
                  lineHeight: 1.02,
                  maxWidth: 480,
                }}
              >
                Pilotez
                <br />
                l’audit interne
                <br />
                ONCF avec
                <br />
                une vision claire.
              </Typography>
            </Stack>

            <Stack spacing={2.1} sx={{ maxWidth: 440, mt: { lg: 4 } }}>
              {highlights.map((item) => (
                <Stack alignItems="flex-start" direction="row" key={item.title} spacing={1.6}>
                  <Box
                    sx={{
                      alignItems: 'center',
                      backdropFilter: 'blur(8px)',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: '12px',
                      color: 'common.white',
                      display: 'flex',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      height: 50,
                      justifyContent: 'center',
                      minWidth: 50,
                    }}
                  >
                    {item.badge}
                  </Box>
                  <Box>
                    <Typography sx={{ color: 'common.white', fontSize: '0.98rem', fontWeight: 600, lineHeight: 1.3 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: 'rgba(240, 241, 255, 0.62)', fontSize: '0.92rem', lineHeight: 1.55, mt: 0.35 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#fcfcff',
            display: 'flex',
            justifyContent: 'center',
            minHeight: { xs: 'auto', lg: '100dvh' },
            px: { xs: 2.5, sm: 4, lg: 6 },
            py: { xs: 3.5, sm: 5, lg: 7 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              maxWidth: 560,
              mt: 0,
              p: 0,
              width: '100%',
            }}
          >
            {children}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
