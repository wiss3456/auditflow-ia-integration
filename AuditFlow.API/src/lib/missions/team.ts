import { createStoredUser, loadAllAuditorAccounts, type AuditorAccount } from '@/lib/auth/mock-users';
import { loadStoredProfile } from '@/lib/profile-storage';

import type { AuditMission } from './mock-data';

export interface MissionTeamMember {
  avatar?: string;
  id: string;
  initials: string;
  name: string;
}

function normalize(value?: string | null): string {
  return value?.trim().toLowerCase() ?? '';
}

function buildAccountLabel(account: AuditorAccount): string {
  return `${account.firstName} ${account.lastName}`.trim();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((part) => part.trim().length > 0)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

function mapAccountToMember(account: AuditorAccount): MissionTeamMember {
  const scopedUser = createStoredUser(account);
  const storedProfile = loadStoredProfile(scopedUser);
  const name = `${storedProfile.firstName} ${storedProfile.lastName}`.trim() || buildAccountLabel(account);

  return {
    avatar: storedProfile.avatar || account.avatar,
    id: account.id,
    initials: getInitials(name),
    name,
  };
}

function findMissionOwnerAccount(accounts: AuditorAccount[], mission: AuditMission): AuditorAccount | undefined {
  const missionOwner = normalize(mission.owner);
  const missionCreator = normalize(mission.createdBy);

  return accounts.find((account) => {
    const accountName = normalize(buildAccountLabel(account));
    const accountEmail = normalize(account.email);
    const accountUsername = normalize(account.username);

    return (
      accountName === missionOwner ||
      accountEmail === missionOwner ||
      accountUsername === missionOwner ||
      (missionCreator ? accountName === missionCreator || accountEmail === missionCreator || accountUsername === missionCreator : false)
    );
  });
}

export function getMissionTeamMembers(mission: AuditMission): MissionTeamMember[] {
  const accounts = loadAllAuditorAccounts();
  const ownerAccount = findMissionOwnerAccount(accounts, mission);

  if (ownerAccount?.team) {
    const teamMembers = accounts.filter((account) => account.team === ownerAccount.team);

    if (teamMembers.length > 0) {
      return teamMembers.map((account) => mapAccountToMember(account));
    }
  }

  if (ownerAccount) {
    return [mapAccountToMember(ownerAccount)];
  }

  return [
    {
      id: mission.id,
      initials: getInitials(mission.owner),
      name: mission.owner,
    },
  ];
}
