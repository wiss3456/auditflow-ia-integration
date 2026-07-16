'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Modal from '@mui/material/Modal';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { BrandMark } from '@/components/dashboard/layout/brand-mark';
import { MissionSelectionPanel, buildMissionSelectionRows, type MissionSelectionRow } from '@/components/dashboard/missions/mission-selection-panel';
import { useAppLanguage } from '@/hooks/use-app-language';
import { useWorkspace } from '@/hooks/use-workspace';
import { authClient } from '@/lib/auth/client';
import { filterMissionsForUser } from '@/lib/missions/access';
import { saveWorkspaceSelectedMission } from '@/lib/workspace-storage';
import { paths } from '@/paths';

const schema = zod.object({
  identifier: zod.string().min(1, { message: "L'e-mail ou le nom d'utilisateur est requis" }),
  password: zod.string().min(1, { message: 'Mot de passe requis' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { identifier: '', password: '' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [isSessionPanelOpen, setIsSessionPanelOpen] = React.useState<boolean>(false);
  const [sessionMissionRows, setSessionMissionRows] = React.useState<MissionSelectionRow[]>([]);
  const [sessionUserId, setSessionUserId] = React.useState<string | null>(null);
  const { language } = useAppLanguage();
  const { workspace } = useWorkspace();

  const navigateToPage = React.useCallback((href: string): void => {
    globalThis.location.assign(href);
  }, []);

  const selectMissionAndOpenOverview = React.useCallback(
    (missionId: string): void => {
      if (sessionUserId) {
        saveWorkspaceSelectedMission(sessionUserId, missionId);
      }

      navigateToPage(paths.dashboard.overview);
    },
    [navigateToPage, sessionUserId]
  );

  const {
    clearErrors,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      clearErrors('root');
      setIsPending(true);

      const { error } = await authClient.signInWithPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      const { data: signedInUser } = await authClient.getUser();
      const visibleMissions = filterMissionsForUser(workspace.missions, signedInUser ?? null);

      setSessionMissionRows(buildMissionSelectionRows(visibleMissions));
      setSessionUserId(signedInUser?.id ?? null);
      setIsSessionPanelOpen(true);
      setIsPending(false);
    },
    [clearErrors, setError, workspace.missions]
  );

  return (
    <React.Fragment>
      <Stack spacing={4}>
        <Stack spacing={2.25}>
          <Stack alignItems="center" direction="row" spacing={1.5}>
            <BrandMark size={18} withShadow={false} />
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Espace AuditFlow ONCF
            </Typography>
          </Stack>
          <Box>
            <Typography
              sx={{
                color: '#141b34',
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontSize: { xs: '1.75rem', sm: '1.95rem' },
                fontWeight: 700,
                letterSpacing: '-0.03em',
              }}
            >
              {language === 'fr' ? 'Bon retour' : 'Welcome back'}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, mt: 1 }}>
              {language === 'fr'
                ? "Connecte-toi pour acceder au pilotage des missions d'audit interne ONCF."
                : 'Sign in to access the AuditFlow dashboard.'}
            </Typography>
          </Box>
        </Stack>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.25}>
            <Controller
              control={control}
              name="identifier"
              render={({ field }) => (
                <FormControl error={Boolean(errors.identifier)}>
                  <Typography
                    component="label"
                    htmlFor="sign-in-identifier"
                    sx={{ color: '#27314d', fontSize: '0.82rem', fontWeight: 600, mb: 0.75 }}
                  >
                    {language === 'fr' ? "E-mail ou nom d'utilisateur" : 'Email or username'}
                  </Typography>
                  <OutlinedInput
                    {...field}
                    autoComplete="username"
                    id="sign-in-identifier"
                    inputRef={field.ref}
                    placeholder={language === 'fr' ? 'Ex. : john@gmail.com' : 'Ex: john@gmail.com'}
                    sx={{
                      backgroundColor: '#f7f9fc',
                      borderRadius: '16px',
                      '& .MuiOutlinedInput-input': { px: 1.75, py: 1.45 },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.28)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5b63f6',
                        borderWidth: '1px',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(91, 99, 246, 0.38)' },
                    }}
                    type="text"
                  />
                  {errors.identifier ? <FormHelperText>{errors.identifier.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <FormControl error={Boolean(errors.password)}>
                  <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography component="label" htmlFor="sign-in-password" sx={{ color: '#27314d', fontSize: '0.82rem', fontWeight: 600 }}>
                      {language === 'fr' ? 'Mot de passe' : 'Password'}
                    </Typography>
                  </Stack>
                  <OutlinedInput
                    {...field}
                    autoComplete="current-password"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={(): void => {
                            setShowPassword((current) => !current);
                          }}
                          sx={{ color: '#63708a' }}
                        >
                          {showPassword ? <EyeIcon fontSize="var(--icon-fontSize-md)" /> : <EyeSlashIcon fontSize="var(--icon-fontSize-md)" />}
                        </IconButton>
                      </InputAdornment>
                    }
                    id="sign-in-password"
                    placeholder={language === 'fr' ? 'Mot de passe' : 'Password'}
                    sx={{
                      backgroundColor: '#f7f9fc',
                      borderRadius: '16px',
                      '& .MuiOutlinedInput-input': { px: 1.75, py: 1.45 },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.28)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5b63f6',
                        borderWidth: '1px',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(91, 99, 246, 0.38)' },
                    }}
                    type={showPassword ? 'text' : 'password'}
                  />
                  {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {errors.root ? (
              <Alert color="error" sx={{ borderRadius: '16px' }}>
                {errors.root.message}
              </Alert>
            ) : null}

            <Button
              disabled={isPending}
              sx={{
                background: 'linear-gradient(135deg, #6a79ff 0%, #4c63ff 100%)',
                borderRadius: '14px',
                boxShadow: '0 18px 32px rgba(76, 99, 255, 0.22)',
                minHeight: 48,
                mt: 0.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5f70ff 0%, #4158f5 100%)',
                  boxShadow: '0 20px 34px rgba(65, 88, 245, 0.26)',
                },
              }}
              type="submit"
              variant="contained"
            >
              {isPending ? (language === 'fr' ? 'Connexion...' : 'Logging in...') : language === 'fr' ? 'Connexion' : 'Login'}
            </Button>

            <Typography align="center" color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.7 }}>
              {language === 'fr' ? 'Acces reserve au personnel autorise.' : 'Access is reserved for authorized staff.'}
            </Typography>
          </Stack>
        </form>
      </Stack>

      <Modal open={isSessionPanelOpen} onClose={(): void => setIsSessionPanelOpen(false)}>
        <Box
          sx={{
            alignItems: 'center',
            backdropFilter: 'blur(8px)',
            bgcolor: 'rgba(15, 23, 42, 0.34)',
            display: 'flex',
            inset: 0,
            justifyContent: 'center',
            p: 2,
            position: 'fixed',
          }}
        >
          <Box sx={{ maxWidth: 860, width: '100%' }}>
            <MissionSelectionPanel
              missionRows={sessionMissionRows}
              onMissionSelect={selectMissionAndOpenOverview}
              onNewMission={(): void => {
                navigateToPage(paths.dashboard.newMission);
              }}
              onSkip={(): void => {
                if (sessionUserId) {
                  saveWorkspaceSelectedMission(sessionUserId, null);
                }
                navigateToPage(paths.dashboard.overview);
              }}
            />
          </Box>
        </Box>
      </Modal>
    </React.Fragment>
  );
}
