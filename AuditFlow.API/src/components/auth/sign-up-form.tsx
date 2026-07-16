'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/client';
import { paths } from '@/paths';

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'Le prénom est requis' }),
  lastName: zod.string().min(1, { message: 'Le nom est requis' }),
  email: zod.string().min(1, { message: "L’adresse e-mail est requise" }).email(),
  terms: zod.boolean().refine((value) => value, 'Tu dois confirmer cette demande'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { firstName: '', lastName: '', email: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [requestSent, setRequestSent] = React.useState(false);

  React.useEffect(() => {
    if (!requestSent) {
      return;
    }

    const timeout = globalThis.setTimeout(() => {
      router.replace(paths.auth.signIn);
    }, 1400);

    return () => {
      globalThis.clearTimeout(timeout);
    };
  }, [requestSent, router]);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      setRequestSent(false);

      const { error } = await authClient.signUp(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      reset(defaultValues);
      setRequestSent(true);
      setIsPending(false);
    },
    [reset, setError]
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Inscription</Typography>
        <Typography color="text.secondary" variant="body2">
          Tu as deja un compte ?{' '}
          <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
            Aller à la connexion
          </Link>
        </Typography>
      </Stack>

      {requestSent ? (
        <Alert color="success">Inscription enregistrée avec succès. Redirection vers la page de connexion...</Alert>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.firstName)}>
                <InputLabel>Prénom</InputLabel>
                <OutlinedInput {...field} label="Prénom" />
                {errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.lastName)}>
                <InputLabel>Nom</InputLabel>
                <OutlinedInput {...field} label="Nom" />
                {errors.lastName ? <FormHelperText>{errors.lastName.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Adresse e-mail</InputLabel>
                <OutlinedInput {...field} label="Adresse e-mail" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <div>
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={(event): void => field.onChange(event.target.checked)} />}
                  label="Je confirme que cette demande d’accès concerne du personnel autorisé."
                />
                {errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
              </div>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            {isPending ? 'Inscription en cours...' : 'S’inscrire'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
