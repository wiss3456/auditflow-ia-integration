import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { StaffManagementView } from '@/components/dashboard/staff-management/staff-management-view';

export const metadata = { title: `Gestion du personnel | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <StaffManagementView />;
}
