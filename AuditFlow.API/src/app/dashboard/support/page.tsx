'use client';

import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowSquareUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareUpRight';

import { useAppLanguage } from '@/hooks/use-app-language';
import { paths } from '@/paths';

const supportSections = [
  {
    actionHref: paths.dashboard.settings,
    actionLabel: { en: 'Open settings', fr: 'Ouvrir les paramètres' },
    description: {
      en: 'Adjust workspace preferences, notification behaviors and application options.',
      fr: "Configure les préférences de l’espace AuditFlow ONCF, les réglages d’affichage et les options générales de l’application.",
    },
    details: {
      en: [
        'Review general application preferences.',
        'Manage notification behavior and visibility rules.',
        'Open the password management area from the settings page.',
      ],
      fr: [
        'Consulte et modifie les préférences générales de l’application.',
        'Règle le comportement des notifications et leur affichage.',
        'Accède rapidement à la gestion du mot de passe depuis la page des paramètres.',
      ],
    },
    key: 'settings',
    title: { en: 'Settings', fr: 'Paramètres' },
  },
  {
    actionHref: paths.dashboard.settings,
    actionLabel: { en: 'Open security', fr: 'Ouvrir la sécurité' },
    description: {
      en: 'Protect the workspace by reviewing password and security-related options.',
      fr: "Vérifie les options de sécurité du compte et les actions de protection disponibles dans l’espace AuditFlow ONCF.",
    },
    details: {
      en: [
        'Update your password and reinforce access rules.',
        'Review security-related settings from a single place.',
        'Track important changes through the notification history.',
      ],
      fr: [
        'Mets à jour ton mot de passe et renforce les règles d’accès.',
        'Centralise les options liées à la sécurité dans un seul écran.',
        "Suis les changements importants via l’historique des notifications.",
      ],
    },
    key: 'security',
    title: { en: 'Security', fr: 'Sécurité' },
  },
  {
    actionHref: paths.dashboard.account,
    actionLabel: { en: 'Open account', fr: 'Ouvrir le compte' },
    description: {
      en: 'Access the user profile, identity details and account-related information.',
      fr: 'Consulte le profil utilisateur, les informations du compte et les données personnelles associées.',
    },
    details: {
      en: [
        'View the connected profile and account summary.',
        'Update identity information available in the workspace.',
        'Keep the user area consistent with the rest of the application.',
      ],
      fr: [
        'Affiche le profil connecté et le résumé du compte.',
        'Mets à jour les informations d’identité disponibles dans l’espace AuditFlow ONCF.',
        'Assure la cohérence des informations utilisateur dans toute l’application.',
      ],
    },
    key: 'account',
    title: { en: 'User account', fr: 'Compte utilisateur' },
  },
  {
    actionHref: paths.dashboard.notifications,
    actionLabel: { en: 'Open help center', fr: "Ouvrir le centre d’assistance" },
    description: {
      en: 'Find help resources, application activity and guidance for the main workflows.',
      fr: "Retrouve les ressources d’aide, les activités de l’application et les conseils sur les principaux usages.",
    },
    details: {
      en: [
        'Read the latest recorded activity messages.',
        'Use the help center as an operational guide.',
        'Access a persistent history of notifications and changes.',
      ],
      fr: [
        'Consulte les derniers messages d’activité enregistrés.',
        'Utilise le centre d’assistance comme guide opérationnel.',
        'Accède à un historique persistant des notifications et des changements.',
      ],
    },
    key: 'help-center',
    title: { en: 'Help center', fr: 'Centre d’assistance' },
  },
] as const;

export default function Page(): React.JSX.Element {
  const { language } = useAppLanguage();
  const [selectedSectionKey, setSelectedSectionKey] = React.useState<(typeof supportSections)[number]['key']>('settings');

  const selectedSection = supportSections.find((section) => section.key === selectedSectionKey) ?? supportSections[0];

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">{language === 'fr' ? 'Support' : 'Support'}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {language === 'fr'
            ? "Accède à une aide claire sur les rubriques importantes de l’application et ouvre directement les écrans associés."
            : 'Access clear guidance for key application sections and open the related screens directly.'}
        </Typography>
      </div>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { lg: '280px minmax(0, 1fr)', xs: '1fr' } }}>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1}>
              {supportSections.map((section) => {
                const isSelected = section.key === selectedSection.key;

                return (
                  <Button
                    key={section.key}
                    onClick={(): void => {
                      setSelectedSectionKey(section.key);
                    }}
                    sx={{ justifyContent: 'flex-start', minHeight: 46 }}
                    variant={isSelected ? 'contained' : 'text'}
                  >
                    {section.title[language]}
                  </Button>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <div>
                <Typography sx={{ color: '#111827', fontSize: '1.3rem', fontWeight: 700 }}>
                  {selectedSection.title[language]}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8, mt: 1 }}>
                  {selectedSection.description[language]}
                </Typography>
              </div>

              <Box
                sx={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid rgba(148, 163, 184, 0.16)',
                  borderRadius: '18px',
                  p: 2.5,
                }}
              >
                <Typography sx={{ color: '#111827', fontSize: '0.95rem', fontWeight: 700 }}>
                  {language === 'fr' ? "Actions et rôle dans l’application" : 'Actions and role in the application'}
                </Typography>
                <Stack component="ul" spacing={1.1} sx={{ color: '#64748b', lineHeight: 1.8, m: 0, mt: 1.5, pl: 2.5 }}>
                  {selectedSection.details[language].map((detail) => (
                    <li key={detail}>
                      <Typography component="span" sx={{ color: 'inherit', fontSize: '0.95rem' }}>
                        {detail}
                      </Typography>
                    </li>
                  ))}
                </Stack>
              </Box>

              <Button
                component={Link}
                endIcon={<ArrowSquareUpRightIcon fontSize="var(--icon-fontSize-md)" />}
                href={selectedSection.actionHref}
                sx={{ alignSelf: 'flex-start' }}
                variant="contained"
              >
                {selectedSection.actionLabel[language]}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
