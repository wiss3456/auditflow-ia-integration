'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/navigation';

import { paths } from '@/paths';

export function MissionRequiredAccess(): React.JSX.Element {
  const router = useRouter();

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open
      PaperProps={{
        sx: {
          borderRadius: '18px',
          maxWidth: 520,
        },
      }}
    >
      <DialogContent sx={{ pb: 1.5, pt: 2.5 }}>
        <Stack spacing={2}>
          <Alert severity="error" sx={{ borderRadius: '14px', lineHeight: 1.6 }}>
            Vous devez acceder a une mission avant d&apos;ouvrir cette page.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2.5 }}>
        <Button
          onClick={(): void => {
            router.push(paths.dashboard.overview);
          }}
          sx={{ borderRadius: '12px', minHeight: 40, px: 2.2 }}
          variant="outlined"
        >
          OK
        </Button>
        <Button
          onClick={(): void => {
            router.push(paths.dashboard.missionSelector);
          }}
          sx={{ borderRadius: '12px', minHeight: 40, px: 2.2 }}
          variant="contained"
        >
          Choisir une mission
        </Button>
      </DialogActions>
    </Dialog>
  );
}
