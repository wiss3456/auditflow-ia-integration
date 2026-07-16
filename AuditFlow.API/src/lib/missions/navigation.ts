import { findAuditorAccount } from '@/lib/auth/mock-users';
import { paths } from '@/paths';

import { auditMissions } from './mock-data';

function getMissionPathForOwnerName(ownerName?: string | null): string {
  const normalizedOwnerName = ownerName?.trim().toLowerCase();

  const mission =
    auditMissions.find((item) => normalizedOwnerName && item.owner.toLowerCase() === normalizedOwnerName && item.status !== 'Follow-up') ??
    auditMissions.find((item) => normalizedOwnerName && item.owner.toLowerCase() === normalizedOwnerName) ??
    auditMissions[0];

  return mission ? paths.dashboard.missionDetails(mission.id) : paths.dashboard.overview;
}

export function getMissionPathForIdentifier(identifier: string): string {
  const account = findAuditorAccount(identifier);
  const ownerName = account ? `${account.firstName} ${account.lastName}` : null;

  return getMissionPathForOwnerName(ownerName);
}

export function getMissionPathForUserName(name?: string | null): string {
  return getMissionPathForOwnerName(name);
}
