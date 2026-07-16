import type { User } from '@/types/user';
import { canAccessFullApplication } from '@/lib/auth/roles';

import type { AuditMission } from './mock-data';

function normalize(value?: string | null): string {
  return value?.trim().toLowerCase() ?? '';
}

function buildUserIdentifiers(user?: User | null): Set<string> {
  const identifiers = new Set<string>();
  const fullName = [user?.firstName, user?.lastName].filter((value): value is string => typeof value === 'string' && value.trim().length > 0).join(' ');

  for (const value of [user?.name, fullName, user?.email, user?.username]) {
    const normalizedValue = normalize(value);

    if (normalizedValue) {
      identifiers.add(normalizedValue);
    }
  }

  return identifiers;
}

function hasGlobalMissionAccess(user?: User | null): boolean {
  return canAccessFullApplication(typeof user?.role === 'string' ? user.role : undefined);
}

export function canUserAccessMission(user: User | null | undefined, mission: AuditMission): boolean {
  if (!user) {
    return false;
  }

  if (hasGlobalMissionAccess(user)) {
    return true;
  }

  const identifiers = buildUserIdentifiers(user);
  const missionOwner = normalize(mission.owner);
  const missionCreator = normalize(mission.createdBy);

  return identifiers.has(missionOwner) || (missionCreator ? identifiers.has(missionCreator) : false);
}

export function filterMissionsForUser(missions: AuditMission[], user: User | null | undefined): AuditMission[] {
  if (!user) {
    return [];
  }

  if (hasGlobalMissionAccess(user)) {
    return missions;
  }

  return missions.filter((mission) => canUserAccessMission(user, mission));
}
