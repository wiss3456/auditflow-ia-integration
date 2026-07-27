'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { fetchMissionLookupItems } from '@/lib/missions/api';
import { createMission } from '@/lib/missions/api';
import { ApiError } from '@/lib/api/http';
import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { loadAllAuditorAccounts } from '@/lib/auth/mock-users';
import type { AuditMission } from '@/lib/missions/mock-data';
import { saveWorkspaceMission, saveWorkspaceSelectedMission } from '@/lib/workspace-storage';
import { paths } from '@/paths';

async function createMissionId(): Promise<string> {
  const currentYear = dayjs().format('YYYY');

  let realMissions: { missionId: string }[] = [];
  try {
    realMissions = await fetchMissionLookupItems();
  } catch {
    realMissions = [];
  }

  const usedIndexes = realMissions
    .filter((mission) => mission.missionId.startsWith(`ONCF-AI-${currentYear}-`))
    .map((mission) => Number(mission.missionId.split('-').at(-1)))
    .filter((value) => Number.isFinite(value));

  const nextIndex = (usedIndexes.length > 0 ? Math.max(...usedIndexes) : 0) + 1;
  return `ONCF-AI-${currentYear}-${String(nextIndex).padStart(3, '0')}`;
}

const initialFormState = {
  client: '',
  deliverables: '',
  dueDate: dayjs().add(21, 'day').format('YYYY-MM-DD'),
  focusAreas: '',
  owner: '',
  title: '',
};

const predefinedOwnerOptions = ['Yassine Sadiki', 'Rim Diab', 'Hamza Mouddine', 'Nada Benassou'] as const;
const excludedOwnerKeys = new Set([getOwnerIdentityKey('Rim')]);

function getOwnerIdentityKey(owner: string): string {
  return owner
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, 'fr'))
    .join(' ');
}

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useNotifications();
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const [form, setForm] = React.useState(initialFormState);
  const [error, setError] = React.useState<string | null>(null);
  const [isPrepared, setIsPrepared] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const editingMissionId = searchParams.get('missionId');
  const editingMission = React.useMemo(
    () => (editingMissionId ? workspace.missions.find((mission) => mission.id === editingMissionId) ?? null : null),
    [editingMissionId, workspace.missions]
  );
  const ownerOptions = React.useMemo(() => {
    const knownOwners = new Map<string, string>();

    predefinedOwnerOptions.forEach((owner) => {
      knownOwners.set(getOwnerIdentityKey(owner), owner);
    });

    workspace.missions.forEach((mission) => {
      if (mission.owner.trim()) {
        const normalizedOwner = mission.owner.trim();
        const ownerKey = getOwnerIdentityKey(normalizedOwner);

        if (!excludedOwnerKeys.has(ownerKey) && !knownOwners.has(ownerKey)) {
          knownOwners.set(ownerKey, normalizedOwner);
        }
      }
    });

    loadAllAuditorAccounts().forEach((account) => {
      const fullName = `${account.firstName} ${account.lastName}`.trim();

      if (fullName) {
        const ownerKey = getOwnerIdentityKey(fullName);

        if (!excludedOwnerKeys.has(ownerKey) && !knownOwners.has(ownerKey)) {
          knownOwners.set(ownerKey, fullName);
        }
      }
    });

    return Array.from(knownOwners.values()).sort((left, right) => left.localeCompare(right, 'fr'));
  }, [workspace.missions]);

  React.useEffect(() => {
    if (!editingMission) {
      setForm(initialFormState);
      setError(null);
      setIsPrepared(false);
      return;
    }

    setForm({
      client: editingMission.client,
      deliverables: editingMission.objective,
      dueDate: editingMission.dueDate,
      focusAreas: editingMission.scope,
      owner: editingMission.owner,
      title: editingMission.title,
    });
    setError(null);
    setIsPrepared(false);
  }, [editingMission]);

  const handleFieldChange =
    (field: keyof typeof initialFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      setError(null);
      setIsPrepared(false);
      setForm((currentForm) => ({ ...currentForm, [field]: event.target.value }));
    };

  const handleReset = (): void => {
    setForm(
      editingMission
        ? {
            client: editingMission.client,
            deliverables: editingMission.objective,
            dueDate: editingMission.dueDate,
            focusAreas: editingMission.scope,
            owner: editingMission.owner,
            title: editingMission.title,
          }
        : initialFormState
    );
    setError(null);
    setIsPrepared(false);
  };

  const handlePrepareMission = async (): Promise<void> => {
  if (editingMissionId && !editingMission) {
    setError("La mission a modifier est introuvable.");
    return;
  }

  const title = form.title.trim();
  const client = form.client.trim();
  const owner = form.owner.trim();
  const focusAreas = form.focusAreas.trim();
  const deliverables = form.deliverables.trim();
  const dueDate = form.dueDate;

  if (!title || !client || !owner) {
    setError("Renseigne au minimum le titre, l'entite et le responsable de mission avant de valider.");
    return;
  }

  const objective = focusAreas
    ? `Mission ONCF creee avec les axes de travail suivants : ${focusAreas}.`
    : 'Mission ONCF creee sans axes de travail detailles a ce stade.';
  const fullObjective = deliverables ? `${objective} Livrables attendus : ${deliverables}.` : objective;
  const nextAction = dueDate
    ? `Lancer le cadrage de la mission et confirmer l'echeance cible du ${dayjs(dueDate).format('DD MMMM YYYY')}.`
    : 'Lancer le cadrage de la mission et confirmer le planning operationnel.';


  if (editingMission) {
    const mission: AuditMission = {
      ...editingMission,
      client,
      dueDate,
      nextAction,
      objective: fullObjective,
      owner,
      scope: focusAreas || 'Perimetre a definir',
      site: client,
      title,
    };

    saveWorkspaceMission(mission);
    setIsPrepared(true);
    addNotification({
      message: `La mission ${mission.title} a ete mise a jour et synchronisee dans les missions et les ecrans lies.`,
      title: 'Mission',
    });
    router.push(paths.dashboard.missionDetails(mission.id));
    return;
  }

  // --- Cas création : appel réel au backend .NET ---
  setIsSubmitting(true);
  setError(null);

  try {
    const reference = await createMissionId();

    const backendMission = await createMission({
      client,
      description: fullObjective,
      dueDate,
      objective: fullObjective,
      ownerUserId: null,
      reference,
      scope: focusAreas || 'Perimetre a definir',
      site: client,
      title,
    });

    const mission: AuditMission = {
      client,
      createdBy: user?.email ?? user?.name ?? owner,
      dueDate,
      id: backendMission.id,
      nextAction,
      objective: fullObjective,
      openFindings: 0,
      owner,
      phase: 'Mission prete a lancer',
      priority: 'Medium',
      progress: 10,
      scope: focusAreas || 'Perimetre a definir',
      site: client,
      status: 'Planning',
      title,
    };

    saveWorkspaceMission(mission);
    setIsPrepared(true);
    addNotification({
      message: `La mission ${mission.title} a ete enregistree cote serveur et synchronisee dans les missions et les ecrans lies.`,
      title: 'Mission',
    });

    if (user?.id) {
      saveWorkspaceSelectedMission(user.id, mission.id);
    }

    router.push(paths.dashboard.overview);
  } catch (creationError) {
  const message =
    creationError instanceof ApiError
      ? creationError.message
      : 'Impossible de creer la mission sur le serveur. Verifie que le backend est bien lance.';

  // Si c'est une collision de référence, réessaie automatiquement une fois
  if (message.toLowerCase().includes('reference') && message.toLowerCase().includes('existe')) {
    setError('Nouvelle tentative avec une référence différente...');
    // on pourrait relancer handlePrepareMission() ici, mais pour rester simple :
    setError('La référence générée était déjà utilisée. Réessaie en cliquant à nouveau sur "Préparer cette mission".');
  } else {
    setError(message);
  }
} finally {
  setIsSubmitting(false);
}
};

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">{editingMission ? 'Modifier la mission' : 'Nouvelle mission'}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {editingMission
            ? "Modifie directement les informations de cette mission ONCF puis enregistre les changements."
            : "Renseigne directement les informations de la mission ONCF. Aucun modele predefini n&apos;est charge automatiquement."}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5">{editingMission ? 'Edition de la mission' : 'Formulaire de mission'}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                {editingMission
                  ? 'Les informations actuelles sont pre-remplies pour te permettre de les ajuster rapidement.'
                  : 'Tous les champs sont vides par defaut afin de te laisser construire la mission librement.'}
              </Typography>
            </Box>

            {editingMissionId && !editingMission ? <Alert color="error">La mission a modifier est introuvable.</Alert> : null}

            {error ? <Alert color="error">{error}</Alert> : null}

            <Grid container spacing={2}>
              <Grid
                size={{
                  md: 6,
                  xs: 12,
                }}
              >
                <TextField fullWidth label="Titre de mission" onChange={handleFieldChange('title')} value={form.title} />
              </Grid>
              <Grid
                size={{
                  md: 6,
                  xs: 12,
                }}
              >
                <TextField fullWidth label="Entite / client interne" onChange={handleFieldChange('client')} value={form.client} />
              </Grid>
              <Grid
                size={{
                  md: 6,
                  xs: 12,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid rgba(148, 163, 184, 0.16)',
                    borderRadius: '18px',
                    height: '100%',
                    p: 2,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography sx={{ color: '#111827', fontSize: '0.98rem', fontWeight: 700 }}>Responsable</Typography>
                    </Box>

                    <TextField
                      fullWidth
                      label="Selection rapide"
                      onChange={(event): void => {
                        setError(null);
                        setIsPrepared(false);
                        setForm((currentForm) => ({
                          ...currentForm,
                          owner: event.target.value,
                        }));
                      }}
                      select
                      value={ownerOptions.includes(form.owner.trim()) ? form.owner.trim() : ''}
                    >
                      {ownerOptions.map((ownerOption) => (
                        <MenuItem key={ownerOption} value={ownerOption}>
                          {ownerOption}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Box>
              </Grid>
              <Grid
                size={{
                  md: 6,
                  xs: 12,
                }}
              >
                <TextField
                  fullWidth
                  helperText="Selectionne la date cible de la mission."
                  label="Date cible"
                  onChange={(event): void => {
                    setError(null);
                    setIsPrepared(false);
                    setForm((currentForm) => ({ ...currentForm, dueDate: event.target.value }));
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="date"
                  value={form.dueDate}
                />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Axes de travail" onChange={handleFieldChange('focusAreas')} value={form.focusAreas} />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Livrables attendus"
                  minRows={3}
                  multiline
                  onChange={handleFieldChange('deliverables')}
                  value={form.deliverables}
                />
              </Grid>
            </Grid>

            <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.5}>
              <Button onClick={(): void => { void handlePrepareMission(); }} variant="contained" disabled={isSubmitting}>
  {isSubmitting ? 'Création en cours...' : editingMission ? 'Enregistrer les modifications' : 'Preparer cette mission'}
</Button>
              <Button onClick={handleReset} variant="outlined">
                {editingMission ? 'Reinitialiser les changements' : 'Reinitialiser le formulaire'}
              </Button>
            </Stack>

            {isPrepared ? (
              <Alert color="success">
                {editingMission
                  ? 'La mission ONCF a ete mise a jour dans le registre partage.'
                  : 'La mission ONCF est enregistree dans le registre partage. Elle apparait maintenant dans les missions et dans les ecrans lies.'}
              </Alert>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
