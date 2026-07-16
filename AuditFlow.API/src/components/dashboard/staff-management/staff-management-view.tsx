'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { CopyIcon } from '@phosphor-icons/react/dist/ssr/Copy';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import { ProhibitIcon } from '@phosphor-icons/react/dist/ssr/Prohibit';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';

import { useNotifications } from '@/hooks/use-notifications';
import { useUser } from '@/hooks/use-user';
import { canManagePersonnel, getCreatableStatusOptions, getDefaultCreatableStatus, normalizeProfileStatus } from '@/lib/auth/roles';
import {
  createGeneratedAuditorPassword,
} from '@/lib/auth/mock-users';
import { deleteManagedUser, fetchManagedUsers, type ManagedAccount, createManagedUser, setManagedUserDisabled } from '@/lib/auth/user-management';
import { getGeneratedPasswordForUser, removeGeneratedPasswordForUser, saveGeneratedPasswordForUser } from '@/lib/auth/generated-passwords';
import { PROFILE_UPDATED_EVENT, loadStoredProfile } from '@/lib/profile-storage';

const teamOptions = ['1', '2', '3'] as const;

interface SessionFormState {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  status: string;
  team: string;
}

interface CreatedCredentials {
  email: string;
  password: string;
}

interface StaffAccountRow extends ManagedAccount {
  generatedPassword: string | null;
}

function buildInitialSessionForm(defaultStatus: string): SessionFormState {
  return {
    email: '',
    firstName: '',
    lastName: '',
    password: createGeneratedAuditorPassword(),
    phone: '',
    status: defaultStatus,
    team: '1',
  };
}

export function StaffManagementView(): React.JSX.Element {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [profile, setProfile] = React.useState(() => loadStoredProfile(user));
  const [sessionError, setSessionError] = React.useState<string | null>(null);
  const currentStatus = normalizeProfileStatus(typeof user?.role === 'string' ? user.role : profile.status);
  const availableStatusOptions = React.useMemo(() => getCreatableStatusOptions(currentStatus), [currentStatus]);
  const defaultSessionStatus = React.useMemo(() => getDefaultCreatableStatus(currentStatus), [currentStatus]);
  const [sessionForm, setSessionForm] = React.useState<SessionFormState>(() => buildInitialSessionForm('Auditeur'));
  const [createdCredentials, setCreatedCredentials] = React.useState<CreatedCredentials | null>(null);
  const [staffAccounts, setStaffAccounts] = React.useState<StaffAccountRow[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = React.useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null);
  const [selectedAccount, setSelectedAccount] = React.useState<StaffAccountRow | null>(null);
  const canAccessStaffManagement = canManagePersonnel(currentStatus);

  const loadStaffAccounts = React.useCallback(async (): Promise<void> => {
    if (!canAccessStaffManagement) {
      setStaffAccounts([]);
      setIsLoadingAccounts(false);
      return;
    }

    setIsLoadingAccounts(true);

    try {
      const accounts = await fetchManagedUsers();
      setStaffAccounts(
        accounts.map((account) => ({
          ...account,
          generatedPassword: getGeneratedPasswordForUser(account.id),
        }))
      );
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Chargement des comptes impossible.');
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [canAccessStaffManagement]);

  React.useEffect(() => {
    setProfile(loadStoredProfile(user));
    if (canAccessStaffManagement) {
      void loadStaffAccounts();
    }

    const handleProfileUpdate = (): void => {
      setProfile(loadStoredProfile(user));

      if (canAccessStaffManagement) {
        void loadStaffAccounts();
      }
    };

    globalThis.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);

    return () => {
      globalThis.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate);
    };
  }, [canAccessStaffManagement, loadStaffAccounts, user]);

  React.useEffect(() => {
    setSessionForm((currentForm) => {
      if (availableStatusOptions.includes(currentForm.status as (typeof availableStatusOptions)[number])) {
        return currentForm;
      }

      return { ...buildInitialSessionForm(defaultSessionStatus), email: currentForm.email, firstName: currentForm.firstName, lastName: currentForm.lastName, phone: currentForm.phone, team: currentForm.team };
    });
  }, [availableStatusOptions, defaultSessionStatus]);

  const handleSessionFieldChange =
    (field: keyof SessionFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }): void => {
      const { value } = event.target;

      setSessionError(null);
      setSessionForm((currentForm) => ({ ...currentForm, [field]: value }));
    };

  const handleCreateSession = (): void => {
    const email = sessionForm.email.trim().toLowerCase();
    const firstName = sessionForm.firstName.trim();
    const lastName = sessionForm.lastName.trim();
    const phone = sessionForm.phone.trim();

    if (!firstName || !lastName || !email || !phone) {
      setSessionError('Renseigne tous les champs obligatoires avant de creer la session.');
      return;
    }

    void (async (): Promise<void> => {
      try {
        const { password, user: createdUser } = await createManagedUser({
          email,
          firstName,
          lastName,
          password: sessionForm.password,
          phone,
          statusLabel: sessionForm.status,
          team: sessionForm.team,
        });

        saveGeneratedPasswordForUser(createdUser.id, password);
        setCreatedCredentials({ email: createdUser.email ?? email, password });
        setSessionForm(buildInitialSessionForm(defaultSessionStatus));
        await loadStaffAccounts();
        addNotification({
          message: `Le compte de ${createdUser.firstName} ${createdUser.lastName} a ete cree.`,
          title: 'Gestion du personnel',
        });
      } catch (error) {
        setSessionError(error instanceof Error ? error.message : 'Creation du compte impossible.');
      }
    })();
  };

  const handleCopyCredentials = async (credentials: CreatedCredentials): Promise<void> => {
    const credentialsText = `Adresse e-mail : ${credentials.email}\nMot de passe : ${credentials.password}`;

    await navigator.clipboard.writeText(credentialsText);
    addNotification({
      message: 'Les identifiants ont ete copies dans le presse-papiers.',
      title: 'Gestion du personnel',
    });
  };

  const handleOpenAccountMenu = (event: React.MouseEvent<HTMLButtonElement>, account: StaffAccountRow): void => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const handleCloseAccountMenu = (): void => {
    setMenuAnchorEl(null);
    setSelectedAccount(null);
  };

  const handleDeleteAccount = (): void => {
    if (!selectedAccount) {
      return;
    }

    void (async (): Promise<void> => {
      try {
        await deleteManagedUser(selectedAccount.id);
        removeGeneratedPasswordForUser(selectedAccount.id);
        await loadStaffAccounts();
        addNotification({
          message: `Le compte de ${selectedAccount.firstName} ${selectedAccount.lastName} a ete supprime.`,
          title: 'Gestion du personnel',
        });
        handleCloseAccountMenu();
      } catch (error) {
        setSessionError(error instanceof Error ? error.message : 'Suppression du compte impossible.');
      }
    })();
  };

  const handleDisableAccount = (): void => {
    if (!selectedAccount || selectedAccount.isDisabled) {
      return;
    }

    void (async (): Promise<void> => {
      try {
        const disabledAccount = await setManagedUserDisabled(selectedAccount.id, true);
        await loadStaffAccounts();
        addNotification({
          message: `Le compte de ${disabledAccount.firstName} ${disabledAccount.lastName} a ete desactive.`,
          title: 'Gestion du personnel',
        });
        handleCloseAccountMenu();
      } catch (error) {
        setSessionError(error instanceof Error ? error.message : 'Desactivation du compte impossible.');
      }
    })();
  };

  const visibleAccounts = [...staffAccounts].reverse();
  const canDeleteSelectedAccount = Boolean(selectedAccount);

  if (!canAccessStaffManagement) {
    return (
      <Stack spacing={3}>
        <div>
          <Typography variant="h4">Gestion du personnel</Typography>
        </div>
        <Alert color="warning">
          Cette page est reservee aux profils Chef de service, Chef de mission et Chef auditeur.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Gestion du personnel</Typography>
      </div>

      <Grid container spacing={3}>
        <Grid
          size={{
            lg: 5,
            xs: 12,
          }}
        >
          <Card>
            <CardHeader
              subheader="Cree un compte utilisateur et genere ses identifiants de connexion."
              title="Creation de compte"
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                {sessionError ? <Alert color="error">{sessionError}</Alert> : null}

                <Grid container spacing={2}>
                  <Grid
                    size={{
                      md: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Nom</InputLabel>
                      <OutlinedInput label="Nom" onChange={handleSessionFieldChange('lastName')} value={sessionForm.lastName} />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      md: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Prenom</InputLabel>
                      <OutlinedInput label="Prenom" onChange={handleSessionFieldChange('firstName')} value={sessionForm.firstName} />
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel>Adresse e-mail</InputLabel>
                      <OutlinedInput label="Adresse e-mail" onChange={handleSessionFieldChange('email')} value={sessionForm.email} />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      md: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Telephone</InputLabel>
                      <OutlinedInput label="Telephone" onChange={handleSessionFieldChange('phone')} value={sessionForm.phone} />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      md: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Statut</InputLabel>
                      <Select label="Statut" onChange={handleSessionFieldChange('status')} value={sessionForm.status}>
                        {availableStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      md: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Equipe</InputLabel>
                      <Select label="Equipe" onChange={handleSessionFieldChange('team')} value={sessionForm.team}>
                        {teamOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      md: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Mot de passe genere automatiquement</InputLabel>
                      <OutlinedInput label="Mot de passe genere automatiquement" readOnly value={sessionForm.password} />
                    </FormControl>
                  </Grid>
                </Grid>

                <Button onClick={handleCreateSession} variant="contained">
                  Creer le compte
                </Button>

                {createdCredentials ? (
                  <Box
                    sx={{
                      border: '1px solid rgba(15, 23, 42, 0.12)',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={2}>
                      <Typography variant="subtitle1">Identifiants generes</Typography>
                      <Button onClick={(): Promise<void> => handleCopyCredentials(createdCredentials)} size="small" variant="outlined">
                        Copier ces identifiants
                      </Button>
                    </Stack>
                    <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                      <Typography variant="body2">
                        <strong>Adresse e-mail :</strong> {createdCredentials.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mot de passe :</strong> {createdCredentials.password}
                      </Typography>
                    </Stack>
                  </Box>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            lg: 7,
            xs: 12,
          }}
        >
          <Card>
            <CardHeader
              subheader="Retrouve tous les utilisateurs et gere leurs identifiants de connexion."
              title="Comptes utilisateurs"
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <TableContainer component={Paper} elevation={0} square>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom complet</TableCell>
                      <TableCell>Adresse e-mail</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Equipe</TableCell>
                      <TableCell>Mot de passe</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleAccounts.length > 0 ? (
                      visibleAccounts.map((account) => (
                        <TableRow hover key={account.id}>
                          <TableCell>{`${account.firstName} ${account.lastName}`}</TableCell>
                          <TableCell>{typeof account.email === 'string' ? account.email : '-'}</TableCell>
                          <TableCell>
                            {account.isDisabled
                              ? `${typeof account.role === 'string' ? account.role : 'Utilisateur'} - Desactive`
                              : typeof account.role === 'string'
                                ? account.role
                                : 'Utilisateur'}
                          </TableCell>
                          <TableCell>{typeof account.team === 'string' ? account.team : '-'}</TableCell>
                          <TableCell>{account.generatedPassword ?? '—'}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              aria-label={`Actions pour ${account.firstName} ${account.lastName}`}
                              onClick={(event): void => {
                                handleOpenAccountMenu(event, account);
                              }}
                              size="small"
                            >
                              <DotsThreeVerticalIcon fontSize="var(--icon-fontSize-md)" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={6}>
                          {isLoadingAccounts ? 'Chargement des comptes...' : 'Aucun compte cree pour le moment.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Menu anchorEl={menuAnchorEl} onClose={handleCloseAccountMenu} open={Boolean(menuAnchorEl && selectedAccount)}>
        <MenuItem
          onClick={async (): Promise<void> => {
            if (!selectedAccount) {
              return;
            }

            if (!selectedAccount.generatedPassword) {
              setSessionError("Le mot de passe genere n'est pas disponible pour ce compte.");
              handleCloseAccountMenu();
              return;
            }

            await handleCopyCredentials({ email: selectedAccount.email ?? '', password: selectedAccount.generatedPassword });
            handleCloseAccountMenu();
          }}
        >
          <ListItemIcon>
            <CopyIcon fontSize="var(--icon-fontSize-sm)" />
          </ListItemIcon>
          Copier les identifiants
        </MenuItem>
        <MenuItem disabled={Boolean(selectedAccount?.isDisabled)} onClick={handleDisableAccount}>
          <ListItemIcon>
            <ProhibitIcon fontSize="var(--icon-fontSize-sm)" />
          </ListItemIcon>
          Désactiver
        </MenuItem>
        <MenuItem disabled={!canDeleteSelectedAccount} onClick={handleDeleteAccount}>
          <ListItemIcon>
            <TrashIcon fontSize="var(--icon-fontSize-sm)" />
          </ListItemIcon>
          Supprimer
        </MenuItem>
      </Menu>
    </Stack>
  );
}
